"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRecentLogs } from "@/app/actions";
import { calculateWeeklyGrade } from "@/lib/grade";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function analyzeToday(logId: string) {
  const supabase = await createClient();

  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("id", logId)
    .single();

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("log_id", logId)
    .order("meal_time");

  const recentLogs = await getRecentLogs(14);

  const todayMeals = meals ?? [];
  const todayBinge = todayMeals.filter((m: { is_binge: boolean }) => m.is_binge);
  const bingeCount = recentLogs.reduce(
    (acc, l) => acc + l.meals.filter((m) => m.is_binge).length,
    0
  );
  const avgMood =
    recentLogs.length > 0
      ? recentLogs.reduce((acc, l) => acc + l.mood, 0) / recentLogs.length
      : log.mood;
  const avgStress =
    recentLogs.length > 0
      ? recentLogs.reduce((acc, l) => acc + l.stress_level, 0) / recentLogs.length
      : log.stress_level;

  const mealSummary = todayMeals
    .map(
      (m: { meal_time: string; food_items: string; is_binge: boolean; emotional_state: string | null; location: string | null }) =>
        `${m.meal_time} ${m.food_items}${m.is_binge ? " [폭식]" : ""}${m.emotional_state ? ` (감정: ${m.emotional_state})` : ""}${m.location ? ` @${m.location}` : ""}`
    )
    .join("\n");

  const recentPattern = recentLogs.slice(0, 7).map((l) => ({
    날짜: l.date,
    기분: l.mood,
    스트레스: l.stress_level,
    폭식횟수: l.meals.filter((m) => m.is_binge).length,
  }));

  const prompt = `당신은 비만·폭식·식습관 교정 전문 행동변화 코치입니다. 과학적 근거(습관 루프 이론, 변화 단계 모델, CBT 기반 식이요법)를 바탕으로 개인화된 코칭을 제공해주세요.

## 오늘 데이터
- 기분: ${log.mood}/5${log.mood_note ? ` (메모: "${log.mood_note}")` : ""}
- 스트레스: ${log.stress_level}/5
- 수면: ${log.sleep_hours ? `${log.sleep_hours}시간` : "미기록"}
- 오늘 폭식: ${todayBinge.length}회
- 식사 기록:
${mealSummary || "  (식사 기록 없음)"}

## 최근 14일 패턴
- 기록 일수: ${recentLogs.length}일 / 평균 기분: ${avgMood.toFixed(1)} / 평균 스트레스: ${avgStress.toFixed(1)}
- 총 폭식 횟수: ${bingeCount}회
- 최근 7일 패턴: ${JSON.stringify(recentPattern)}

다음 형식으로 응답해주세요. 각 섹션을 정확히 ===섹션명=== 구분자로 나눠주세요:

===오늘의코칭===
공감에서 시작해 오늘 데이터 기반 핵심 인사이트를 전달하는 코칭 메시지. 자책 없이 변화 동기를 높여주세요. (3-4문장)

===행동실천계획===
내일 실천할 구체적이고 달성 가능한 행동 3가지. 각 한 줄씩 번호 매기기.

===습관루프분석===
오늘 식사/폭식 패턴에서 보이는 신호(Cue) → 행동(Routine) → 결과(Consequence) 분석. 폭식 유지 메커니즘 설명. (2-3문장)

===트리거분석===
주요 폭식 트리거와 각 트리거별 구체적 대처 전략. (2-3문장)

===변화단계===
프로차스카 변화 단계(전숙고/숙고/준비/행동/유지) 중 현재 단계와 그 근거 및 다음 단계로 나아가는 전략. (2문장)

===대처전략===
이 사람에게 맞는 즉시 실행 가능한 과학 기반 대처 전략 2-3가지. (구체적 기법 이름 포함)

===패턴리포트===
최근 ${recentLogs.length}일 행동 패턴 종합 요약. 개선 트렌드와 주의 패턴. (2-3문장)`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    const extract = (section: string) => {
      const regex = new RegExp(`===${section}===\\s*([\\s\\S]*?)(?====|$)`);
      const match = content.match(regex);
      return match ? match[1].trim() : null;
    };

    const analysis = {
      today_comment: extract("오늘의코칭"),
      tomorrow_routine: extract("행동실천계획"),
      emotional_patterns: extract("습관루프분석"),
      binge_triggers: extract("트리거분석"),
      recovery_status: extract("변화단계"),
      time_patterns: extract("대처전략"),
      pattern_report: extract("패턴리포트") ?? buildPatternReport(recentLogs.length, bingeCount, avgMood, avgStress),
    };

    const { error } = await supabase
      .from("ai_analyses")
      .upsert({ log_id: logId, ...analysis }, { onConflict: "log_id" });

    if (error) throw new Error(error.message);
    revalidatePath("/");
    return analysis;
  } catch {
    const analysis = buildFallbackAnalysis(log, todayMeals, recentLogs, bingeCount, avgMood, avgStress);
    await supabase
      .from("ai_analyses")
      .upsert({ log_id: logId, ...analysis }, { onConflict: "log_id" });
    revalidatePath("/");
    return analysis;
  }
}

export async function getNutritionCoaching(logId: string) {
  const supabase = await createClient();

  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("id", logId)
    .single();

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("log_id", logId)
    .order("meal_time");

  const recentLogs = await getRecentLogs(14);

  const todayMeals = meals ?? [];
  const bingeMeals = todayMeals.filter((m: { is_binge: boolean }) => m.is_binge);

  const mealSummary = todayMeals
    .map(
      (m: { meal_time: string; food_items: string; is_binge: boolean; emotional_state: string | null; location: string | null }) =>
        `${m.meal_time.slice(0, 5)} [${m.food_items}]${m.is_binge ? " ⚠️폭식" : ""}${m.emotional_state ? ` 감정:${m.emotional_state}` : ""}${m.location ? ` @${m.location}` : ""}`
    )
    .join("\n");

  const recentMealPatterns = recentLogs.slice(0, 7).flatMap((l) =>
    l.meals.map((m) => m.food_items)
  ).slice(0, 30).join(", ");

  const avgStress =
    recentLogs.length > 0
      ? recentLogs.reduce((acc, l) => acc + l.stress_level, 0) / recentLogs.length
      : log?.stress_level ?? 3;

  const totalBinge = recentLogs.reduce(
    (acc, l) => acc + l.meals.filter((m) => m.is_binge).length,
    0
  );

  const prompt = `당신은 비만·폭식·식습관 교정 전문 영양 코치이자 행동변화 전문가입니다.
사용자의 식사 기록을 정밀 분석하여 살찌는 요인, 대체 음식, 식습관 교정 멘토링을 제공해주세요.

## 오늘 식사 기록
${mealSummary || "(식사 기록 없음)"}

## 컨디션
- 기분: ${log?.mood ?? 3}/5, 스트레스: ${log?.stress_level ?? 3}/5, 수면: ${log?.sleep_hours ? `${log.sleep_hours}h` : "미기록"}
- 오늘 폭식: ${bingeMeals.length}회
- 최근 14일 총 폭식: ${totalBinge}회
- 평균 스트레스: ${avgStress.toFixed(1)}/5

## 최근 7일 주요 식품
${recentMealPatterns || "(데이터 없음)"}

아래 형식을 정확히 지켜 응답해주세요. 각 섹션은 ===섹션명=== 구분자로 시작:

===살찌는요인===
이 사람의 식사 기록에서 체중 증가·비만을 유발하는 구체적 요인들:
각 요인을 다음 형식으로:
[요인명]: 구체적 설명과 왜 살이 찌는지 과학적 근거 (한 줄)

최소 4가지, 이 사람의 실제 기록 데이터 기반으로 작성.

===대체음식추천===
위에서 문제가 된 음식들의 건강한 대체 식품 추천:
각 항목을 다음 형식으로:
❌ [문제 음식] → ✅ [대체 음식]: 이유 (칼로리/영양 비교 포함)

최소 4가지, 실제 언급된 음식 기반으로 (없으면 일반적인 한국식 폭식 음식 기준).

===식습관멘토링===
비만 교정과 올바른 식습관 형성을 위한 개인화된 멘토링:
이 사람의 구체적 패턴(폭식 ${totalBinge}회, 스트레스 ${avgStress.toFixed(1)}/5 등)을 반영하여
실천 가능한 핵심 원칙 4가지를 번호로 제시.
각 원칙에 과학적 근거와 구체적 실천법 포함. 따뜻하고 실용적인 코치 톤으로.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    const extract = (section: string) => {
      const regex = new RegExp(`===${section}===\\s*([\\s\\S]*?)(?====|$)`);
      const match = content.match(regex);
      return match ? match[1].trim() : null;
    };

    const result = {
      weight_factors: extract("살찌는요인") ?? buildFallbackWeightFactors(todayMeals, log?.stress_level ?? 3, log?.sleep_hours),
      food_alternatives: extract("대체음식추천") ?? buildFallbackFoodAlternatives(todayMeals),
      eating_mentoring: extract("식습관멘토링") ?? buildFallbackEatingMentoring(totalBinge, avgStress),
    };

    await supabase
      .from("ai_analyses")
      .upsert({ log_id: logId, ...result }, { onConflict: "log_id" });

    revalidatePath("/");
    return result;
  } catch {
    const result = {
      weight_factors: buildFallbackWeightFactors(todayMeals, log?.stress_level ?? 3, log?.sleep_hours),
      food_alternatives: buildFallbackFoodAlternatives(todayMeals),
      eating_mentoring: buildFallbackEatingMentoring(totalBinge, avgStress),
    };
    await supabase
      .from("ai_analyses")
      .upsert({ log_id: logId, ...result }, { onConflict: "log_id" });
    revalidatePath("/");
    return result;
  }
}

// ── 영양 코칭 폴백 함수들 ──────────────────────────────────────────

function buildFallbackWeightFactors(
  meals: Array<{ food_items: string; meal_time: string; is_binge: boolean; location: string | null }>,
  stress: number,
  sleepHours: number | null
): string {
  const factors: string[] = [];
  const hasLateMeal = meals.some((m) => parseInt(m.meal_time.split(":")[0]) >= 21);
  const hasNoBreakfast = !meals.some((m) => parseInt(m.meal_time.split(":")[0]) <= 9);
  const hasBinge = meals.some((m) => m.is_binge);
  const foodText = meals.map((m) => m.food_items).join(" ").toLowerCase();

  if (hasBinge) factors.push("[폭식 패턴]: 단시간 대량 섭취로 인슐린이 급격히 분비되어 지방 합성이 촉진됩니다. 폭식 후 죄책감-절식-폭식의 악순환이 기초대사율을 낮춥니다.");
  if (hasLateMeal) factors.push("[야식 섭취]: 밤 9시 이후 식사는 활동량 감소로 칼로리 소비가 거의 없고, 수면 중 지방으로 전환되는 비율이 낮 시간 대비 2배 이상입니다.");
  if (hasNoBreakfast) factors.push("[아침 결식]: 아침을 굶으면 점심·저녁에 과식 충동이 강해지고 기초대사율이 낮아져 오히려 체중 증가로 이어집니다.");
  if (stress >= 4) factors.push("[스트레스성 과식]: 코르티솔 호르몬이 상승하면 탄수화물·고지방 음식 갈망이 강해지고, 복부 지방 축적을 촉진합니다.");
  if (sleepHours !== null && sleepHours < 7) factors.push("[수면 부족]: 수면이 7시간 미만이면 그렐린(식욕 증진) 호르몬이 증가하고 렙틴(포만 신호) 호르몬이 감소해 하루 평균 300kcal 더 먹게 됩니다.");
  if (foodText.includes("라면") || foodText.includes("과자") || foodText.includes("편의점")) {
    factors.push("[초가공식품 섭취]: 라면·과자·편의점 식품은 나트륨과 정제 탄수화물이 높아 부종을 유발하고 혈당을 급격히 올려 지방 축적을 가속화합니다.");
  }
  if (factors.length === 0) {
    factors.push("[식사 기록 부족]: 더 많은 식사를 기록할수록 정확한 살찌는 요인 분석이 가능합니다.");
    factors.push("[감정적 식사 패턴]: 배고픔이 아닌 감정(스트레스, 지루함, 외로움)으로 먹는 패턴이 체중 증가의 주요 원인입니다.");
    factors.push("[불규칙한 식사 시간]: 식사 시간이 불규칙하면 인슐린 분비 패턴이 불안정해져 지방 합성이 증가합니다.");
    factors.push("[수분 섭취 부족]: 물 부족은 허기와 구분되지 않아 불필요한 칼로리 섭취로 이어집니다.");
  }
  return factors.join("\n\n");
}

function buildFallbackFoodAlternatives(
  meals: Array<{ food_items: string }>
): string {
  const defaults = [
    "❌ 라면/인스턴트 → ✅ 현미밥 + 된장국: 나트륨 1/3 수준, 식이섬유로 포만감 3배 지속",
    "❌ 과자·스낵 → ✅ 삶은 달걀 + 방울토마토: 단백질로 혈당 안정, 포만감 유지",
    "❌ 흰쌀밥 → ✅ 현미밥 또는 잡곡밥: 혈당 지수(GI) 40% 낮고 식이섬유 4배 풍부",
    "❌ 탄산음료·카페라떼 → ✅ 탄산수 + 아메리카노: 설탕 0g, 칼로리 200kcal 절약",
    "❌ 야식 치킨·피자 → ✅ 두부 + 삶은 채소: 단백질 동일하게 채우면서 지방 1/5 수준",
    "❌ 빵·도넛 → ✅ 오트밀 + 바나나: 천천히 소화되어 혈당 급등 없이 에너지 공급",
  ];
  const foodText = meals.map((m) => m.food_items).join(" ");
  const specific: string[] = [];
  if (foodText.includes("라면")) specific.push("❌ 라면 → ✅ 곤약면 + 채소 국물: 칼로리 75% 절감, 포만감은 동일");
  if (foodText.includes("치킨")) specific.push("❌ 프라이드 치킨 → ✅ 닭가슴살 구이 + 쌈채소: 지방 1/6 수준, 단백질 동일");
  if (foodText.includes("삼겹살") || foodText.includes("고기")) specific.push("❌ 삼겹살 → ✅ 목살 or 닭다리살: 포화지방 절반, 단백질은 더 풍부");
  if (foodText.includes("과자") || foodText.includes("쿠키")) specific.push("❌ 과자 → ✅ 무가당 아몬드 한 줌: 건강지방으로 혈당 안정, 칼로리 비슷하지만 영양 밀도 10배");

  const combined = [...specific, ...defaults.filter((_, i) => specific.length + i < 5)];
  return combined.slice(0, 5).join("\n");
}

function buildFallbackEatingMentoring(bingeCount: number, avgStress: number): string {
  return `1. 규칙적인 3끼 식사 원칙
아침-점심-저녁을 4-5시간 간격으로 규칙적으로 먹으면 인슐린 분비가 안정되어 지방 축적이 줄어듭니다. 아침을 먹지 않으면 점심·저녁 폭식 위험이 3배 높아집니다. 아침은 단백질(달걀, 두부)을 포함한 400-500kcal로 시작하세요.

2. 폭식 예방을 위한 '80% 포만감' 법칙
천천히 씹고(한 입당 20번 이상), 뇌가 포만 신호를 인식하는 데 20분이 걸립니다. 식사 시 스마트폰·TV를 끄고 음식에 집중하세요. 80% 배부름에서 멈추는 연습이 ${bingeCount > 0 ? "폭식 예방의 핵심 기술" : "건강한 식습관의 기초"}입니다.

3. 스트레스 식욕 vs 진짜 배고픔 구분하기 (현재 스트레스 ${avgStress >= 4 ? "높음 — 특히 중요!" : "보통"})
음식이 당길 때 '지금 진짜 배고픈가? 마지막 식사가 3시간 이상 지났나?'를 먼저 물어보세요. 스트레스·감정으로 먹고 싶다면 먼저 물 한 잔 + 5분 산책을 시도하세요. 감정적 식욕은 15-20분 후 자연히 감소합니다.

4. 비만 교정의 핵심 — 지속 가능한 작은 변화
극단적 다이어트(단식, 초저칼로리)는 기초대사율을 낮추고 요요를 부릅니다. 대신 매일 식사에서 탄수화물 1/4을 줄이고, 단백질(두부, 달걀, 닭가슴살)을 늘리는 것이 장기적으로 효과적입니다. 체중은 주당 0.5kg 감량이 가장 지속 가능한 속도입니다.`;
}

export async function getBingeMentoring(
  logId: string,
  latestMeal: { food_items: string; emotional_state: string | null } | null
) {
  const supabase = await createClient();

  const { data: log } = await supabase
    .from("daily_logs")
    .select("mood, stress_level, mood_note")
    .eq("id", logId)
    .single();

  const mood: number = log?.mood ?? 3;
  const stress: number = log?.stress_level ?? 3;
  const moodNote: string = log?.mood_note ?? "";
  const foodItems = latestMeal?.food_items ?? "";
  const emotionalState = latestMeal?.emotional_state ?? "";

  const prompt = `당신은 폭식·비만 전문 행동변화 코치입니다. 방금 폭식 에피소드를 기록한 사용자에게 즉각적인 행동변화 코칭을 제공해주세요.

현재 상황:
- 기분: ${mood}/5, 스트레스: ${stress}/5
- 기분 메모: ${moodNote || "없음"}
- 폭식한 음식: ${foodItems || "미기록"}
- 감정 상태: ${emotionalState || "미기록"}

규칙:
1. 첫 문장은 반드시 공감으로 시작 (자책 금지)
2. 이 폭식을 일으킨 감정/신호(cue)를 인식시켜 주기
3. 지금 당장 할 수 있는 구체적 행동 1-2가지 제안 (예: 4-7-8 호흡, 걷기, 물 마시기)
4. 이 에피소드를 학습 기회로 재프레이밍 (행동변화 관점)
5. 따뜻하고 코치답게, 3-5문장`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    return message.content[0].type === "text"
      ? message.content[0].text
      : buildFallbackMentoring(mood, stress, latestMeal);
  } catch {
    return buildFallbackMentoring(mood, stress, latestMeal);
  }
}

export async function generateWeeklyReport() {
  const supabase = await createClient();
  const logs = await getRecentLogs(7);

  if (logs.length === 0) throw new Error("최근 7일 기록이 없습니다.");

  const gradeData = calculateWeeklyGrade(logs);

  // 주간 날짜 범위
  const dates = logs.map((l) => l.date).sort();
  const weekStart = dates[0];
  const weekEnd = dates[dates.length - 1];

  const bingeCount = logs.reduce((acc, l) => acc + l.meals.filter((m) => m.is_binge).length, 0);
  const avgMood = (logs.reduce((acc, l) => acc + l.mood, 0) / logs.length).toFixed(1);
  const avgStress = (logs.reduce((acc, l) => acc + l.stress_level, 0) / logs.length).toFixed(1);
  const sleepLogs = logs.filter((l) => l.sleep_hours != null);
  const avgSleep = sleepLogs.length > 0
    ? (sleepLogs.reduce((acc, l) => acc + (l.sleep_hours ?? 0), 0) / sleepLogs.length).toFixed(1)
    : "미기록";
  const totalMeals = logs.reduce((acc, l) => acc + l.meals.length, 0);
  const weightLogs = logs.filter((l) => l.weight_kg != null);
  const weightTrend = weightLogs.length >= 2
    ? `${weightLogs[weightLogs.length - 1].weight_kg}kg (첫날 ${weightLogs[0].weight_kg}kg)`
    : weightLogs.length === 1 ? `${weightLogs[0].weight_kg}kg` : "미기록";

  const prompt = `당신은 비만·식습관 교정 전문 교수입니다. 학생(사용자)의 지난 7일 식습관 데이터를 평가하여 대학 학점 보고서를 작성해주세요.

## 이번 주 데이터 (${weekStart} ~ ${weekEnd})
- 기록 일수: ${logs.length}일
- 폭식 에피소드: ${bingeCount}회
- 평균 기분: ${avgMood}/5
- 평균 스트레스: ${avgStress}/5
- 평균 수면: ${avgSleep}시간
- 총 식사 기록: ${totalMeals}회 (하루 평균 ${(totalMeals / logs.length).toFixed(1)}끼)
- 체중: ${weightTrend}

## 산출된 학점
- 최종 학점: ${gradeData.grade} (${gradeData.score}점/100점)
- 폭식 점수: ${gradeData.binge_score}/35
- 식사 규칙성: ${gradeData.meal_score}/25
- 기분 점수: ${gradeData.mood_score}/15
- 수면 점수: ${gradeData.sleep_score}/15
- 스트레스: ${gradeData.stress_score}/10

다음 형식으로 응답해주세요:

===교수평가===
교수가 학생에게 쓰는 학점 평가서 형식으로 작성. 이 학생의 이번 주 식습관을 구체적 데이터를 언급하며 평가. 잘한 점과 부족한 점을 균형 있게. 따뜻하지만 솔직하게. (4-5문장)

===개선과제===
다음 주 반드시 실천해야 할 구체적 과제 3가지. 번호 매기기. 각 과제는 측정 가능하고 달성 가능한 형태로.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";
    const extract = (section: string) => {
      const regex = new RegExp(`===${section}===\\s*([\\s\\S]*?)(?====|$)`);
      const match = content.match(regex);
      return match ? match[1].trim() : null;
    };

    const evaluation = extract("교수평가");
    const tasks = extract("개선과제");
    const ai_feedback = [evaluation, tasks ? `\n개선 과제:\n${tasks}` : ""].filter(Boolean).join("\n\n");

    const reportPayload = {
      week_start: weekStart,
      week_end: weekEnd,
      grade: gradeData.grade,
      grade_score: gradeData.score,
      binge_score: gradeData.binge_score,
      meal_score: gradeData.meal_score,
      mood_score: gradeData.mood_score,
      sleep_score: gradeData.sleep_score,
      stress_score: gradeData.stress_score,
      evaluation,
      ai_feedback,
    };

    await supabase
      .from("weekly_reports")
      .upsert(reportPayload, { onConflict: "week_start" });

    revalidatePath("/weekly");
    return reportPayload;
  } catch {
    const ai_feedback = buildFallbackWeeklyFeedback(gradeData.grade, gradeData.score, bingeCount, Number(avgStress));
    const reportPayload = {
      week_start: weekStart,
      week_end: weekEnd,
      grade: gradeData.grade,
      grade_score: gradeData.score,
      binge_score: gradeData.binge_score,
      meal_score: gradeData.meal_score,
      mood_score: gradeData.mood_score,
      sleep_score: gradeData.sleep_score,
      stress_score: gradeData.stress_score,
      evaluation: ai_feedback,
      ai_feedback,
    };
    await supabase
      .from("weekly_reports")
      .upsert(reportPayload, { onConflict: "week_start" });
    revalidatePath("/weekly");
    return reportPayload;
  }
}

function buildFallbackWeeklyFeedback(grade: string, score: number, bingeCount: number, avgStress: number): string {
  const gradeMsg = grade.startsWith("A")
    ? "이번 주 식습관 관리에서 매우 우수한 성과를 보여주었습니다."
    : grade.startsWith("B")
    ? "이번 주 전반적으로 양호한 식습관을 유지하였으나 개선 여지가 있습니다."
    : grade.startsWith("C")
    ? "이번 주 식습관이 보통 수준이며 몇 가지 중요한 개선이 필요합니다."
    : "이번 주 식습관에 상당한 개선이 필요합니다. 하지만 기록 자체가 변화의 시작입니다.";

  const bingeMsg = bingeCount === 0
    ? "특히 폭식 에피소드 없이 한 주를 마친 점이 매우 인상적입니다."
    : `폭식이 ${bingeCount}회 발생한 점은 다음 주 최우선 개선 과제입니다.`;

  return `${gradeMsg} ${bingeMsg} ${avgStress >= 4 ? "스트레스 수준이 높게 유지되고 있어 스트레스 관리가 식습관 개선의 선결 조건으로 보입니다." : ""}

개선 과제:
1. ${bingeCount > 0 ? "폭식 충동이 올 때 STOP 기법(멈추기→호흡→관찰→진행) 실천하기" : "현재의 규칙적 식사 패턴을 다음 주도 유지하기"}
2. 매일 아침·점심·저녁 3끼를 일정한 시간에 섭취하기
3. 식사 일기에 먹기 전 신호(Cue)와 감정을 반드시 기록하기`;
}

// ── 폴백 빌더 함수들 ──────────────────────────────────────────────

function buildFallbackAnalysis(
  log: { mood: number; stress_level: number; sleep_hours: number | null; mood_note: string | null; notes: string | null },
  todayMeals: Array<{ meal_time: string; is_binge: boolean; food_items: string; emotional_state: string | null; location: string | null }>,
  recentLogs: Array<{ stress_level: number; mood: number; meals: Array<{ is_binge: boolean }> }>,
  bingeCount: number,
  avgMood: number,
  avgStress: number
) {
  const todayBinge = todayMeals.filter((m) => m.is_binge);
  const improving =
    recentLogs.length >= 2 &&
    recentLogs[0].mood >= recentLogs[recentLogs.length - 1].mood;

  return {
    today_comment: buildTodayComment(log.mood, todayBinge.length, log.notes),
    tomorrow_routine: buildTomorrowRoutine(log.stress_level, log.sleep_hours, avgMood),
    emotional_patterns: buildHabitLoop(todayMeals, log.stress_level),
    binge_triggers: buildBingeTriggers(todayBinge, log.stress_level, log.sleep_hours, recentLogs),
    recovery_status: buildChangeStage(bingeCount, recentLogs.length, avgMood, improving),
    time_patterns: buildCopingStrategies(log.stress_level, log.sleep_hours, todayBinge.length),
    pattern_report: buildPatternReport(recentLogs.length, bingeCount, avgMood, avgStress),
  };
}

function buildHabitLoop(
  meals: Array<{ is_binge: boolean; emotional_state: string | null; location: string | null; meal_time: string }>,
  stress: number
): string {
  const bingeMeals = meals.filter((m) => m.is_binge);
  if (bingeMeals.length === 0) {
    return "오늘 폭식 없이 식사를 마쳤어요. 이런 날의 패턴을 파악해두면 좋은 전략이 됩니다. 어떤 신호가 건강한 식사를 가능하게 했는지 기록해두세요.";
  }
  const emotionText = bingeMeals.map((m) => m.emotional_state).filter(Boolean).join(" ");
  const cue = stress >= 4 ? "높은 스트레스/긴장감(신호)" : emotionText.includes("외로") ? "외로움·공허감(신호)" : "감정적 불편감(신호)";
  return `습관 루프 분석: ${cue} → 폭식 행동(루틴) → 일시적 안도·죄책감(결과). 이 루프가 반복되면서 폭식이 감정 조절 수단으로 강화됩니다. 신호를 인식하는 순간이 변화의 시작점이에요.`;
}

function buildChangeStage(
  bingeCount: number,
  recordedDays: number,
  avgMood: number,
  improving: boolean
): string {
  if (recordedDays < 3) return "변화 단계 [준비기]: 기록을 시작한 것 자체가 변화를 준비하고 있다는 신호예요. 꾸준한 기록이 다음 단계인 행동기로 넘어가는 발판이 됩니다.";
  if (bingeCount === 0 && recordedDays >= 7) return "변화 단계 [유지기]: 폭식 없이 안정적으로 유지하고 있어요. 이 상태를 지속하기 위한 환경 설계와 대처 전략을 강화해주세요.";
  if (improving && avgMood >= 3) return "변화 단계 [행동기]: 변화를 실천하고 있는 행동기에 있어요. 슬럼프가 와도 포기하지 않는 것이 이 단계의 핵심 과제입니다.";
  return "변화 단계 [숙고기]: 변화의 필요성을 인식하고 기록을 이어가고 있어요. 작은 성공 경험을 쌓아가면 자연스럽게 행동기로 전환됩니다.";
}

function buildCopingStrategies(stress: number, sleepHours: number | null, bingeCount: number): string {
  const strategies: string[] = [];
  if (bingeCount > 0) strategies.push("STOP 기법: 충동이 올 때 멈추고(Stop) → 심호흡(Take a breath) → 관찰(Observe feelings) → 진행(Proceed mindfully)");
  if (stress >= 4) strategies.push("4-7-8 호흡법: 4초 들이쉬고, 7초 참고, 8초 내쉬기 — 코르티솔 수치를 빠르게 낮춰줍니다");
  if (sleepHours !== null && sleepHours < 7) strategies.push("수면 개선 우선: 수면 부족은 그렐린(식욕호르몬)을 증가시켜 폭식 위험을 높여요. 오늘 30분 일찍 취침을 목표로 하세요");
  if (strategies.length === 0) strategies.push("마음챙김 식사: 천천히 씹고 맛을 음미하며, 배부름 신호에 집중하는 연습을 해보세요");
  return strategies.join("\n");
}

function buildBingeTriggers(
  bingeMeals: Array<{ emotional_state: string | null; location: string | null }>,
  stress: number,
  sleepHours: number | null,
  recentLogs: Array<{ stress_level: number; meals: Array<{ is_binge: boolean }> }>
): string {
  if (bingeMeals.length === 0) return "오늘 폭식이 없었어요. 어떤 요소가 도움이 됐는지 기억해두면 좋은 대처 전략이 됩니다.";
  const triggers: string[] = [];
  if (stress >= 4) triggers.push("높은 스트레스");
  if (sleepHours !== null && sleepHours < 6) triggers.push("수면 부족");
  const emotionTexts = bingeMeals.map((m) => m.emotional_state).filter(Boolean).join(" ");
  if (emotionTexts.includes("불안") || emotionTexts.includes("스트레스")) triggers.push("불안·긴장");
  if (emotionTexts.includes("외로") || emotionTexts.includes("공허")) triggers.push("외로움·공허감");
  if (emotionTexts.includes("슬픔")) triggers.push("슬픔");
  const highStressBingeDays = recentLogs.filter(
    (l) => l.stress_level >= 4 && l.meals.some((m) => m.is_binge)
  ).length;
  if (highStressBingeDays >= 2) triggers.push("만성 스트레스 패턴");
  if (triggers.length === 0) return "트리거 패턴이 아직 뚜렷하지 않아요. 감정 일기를 더 자세히 적으면 패턴이 보이기 시작해요.";
  return `확인된 트리거: ${triggers.join(", ")}. 이 상황들을 미리 인식하고 대체 행동(산책, 호흡, 차 한잔)을 준비해두는 것이 핵심 전략이에요.`;
}

function buildTodayComment(mood: number, bingeCount: number, notes: string | null): string {
  if (bingeCount > 0) {
    const arr = [
      "오늘 힘든 순간이 있었지만, 그것을 기록한 것 자체가 변화를 향한 용기 있는 행동이에요. 폭식은 실패가 아니라 아직 배워가고 있는 과정입니다.",
      "어려운 순간을 기록했어요. 이 데이터가 쌓일수록 내 패턴이 보이고, 패턴이 보여야 변화가 시작됩니다. 잘 하고 있어요.",
      "오늘 폭식이 있었지만, 자책보다 '왜 그랬을까'를 부드럽게 탐색해보세요. 그 답 속에 변화의 실마리가 있어요.",
    ];
    return arr[mood % arr.length];
  }
  if (mood >= 4) return "오늘 기분도 좋고 식사도 잘 마쳤어요! 이런 날의 패턴을 기억해두면 어려운 날의 나침반이 됩니다. 오늘 정말 잘 하셨어요.";
  if (mood <= 2) return "오늘 많이 힘드셨을 텐데도 기록해줘서 고마워요. 힘든 날 기록을 이어가는 것 자체가 변화 의지의 증거예요.";
  return notes ? "오늘 하루를 솔직하게 기록해줘서 고마워요. 이런 기록들이 자신을 더 잘 이해하는 토대가 됩니다." : "오늘도 기록을 완료했어요. 꾸준한 기록이 행동변화의 가장 강력한 도구예요.";
}

function buildTomorrowRoutine(stress: number, sleepHours: number | null, avgMood: number): string {
  const routines: string[] = [];
  if (sleepHours !== null && sleepHours < 7) {
    routines.push("1. 오늘보다 30분 일찍 취침 — 수면은 식욕 호르몬 조절의 핵심입니다");
  } else {
    routines.push("1. 기상 후 물 한 잔 + 5분 스트레칭으로 하루를 시작하세요");
  }
  if (stress >= 4) {
    routines.push("2. 점심 후 10분 산책 또는 4-7-8 호흡 3회 — 오후 스트레스 예방");
  } else {
    routines.push("2. 점심은 자리에서 벗어나 천천히, 음식에 집중하며 드세요");
  }
  if (avgMood < 3) {
    routines.push("3. 저녁에 오늘 잘한 일 딱 한 가지를 기록하세요 — 작은 성공이 동기를 만들어요");
  } else {
    routines.push("3. 저녁 식사 후 내일 코칭 알람을 설정해두면 꾸준한 기록에 도움이 돼요");
  }
  return routines.join("\n");
}

function buildPatternReport(days: number, bingeCount: number, avgMood: number, avgStress: number): string {
  const moodLabel = avgMood >= 4 ? "좋음" : avgMood >= 3 ? "보통" : "낮음";
  const stressLabel = avgStress >= 4 ? "높음" : avgStress >= 3 ? "보통" : "낮음";
  let result = `최근 ${days}일 분석: 평균 기분 ${avgMood.toFixed(1)}/5(${moodLabel}), 평균 스트레스 ${avgStress.toFixed(1)}/5(${stressLabel}). `;
  if (bingeCount === 0) {
    result += "폭식 에피소드 없이 안정적으로 유지하고 있어요. ";
  } else {
    result += `${days}일 중 폭식 ${bingeCount}회 발생. `;
    if (avgStress >= 4) result += "스트레스-폭식 연관성이 확인됩니다. 스트레스 관리가 핵심 과제예요. ";
  }
  result += avgMood >= 3.5
    ? "전반적인 컨디션이 양호하고 변화를 위한 에너지가 있어요."
    : "기분이 낮은 날이 많았어요. 수면과 활동량을 점검해보세요.";
  return result;
}

function buildFallbackMentoring(
  mood: number,
  stress: number,
  latestMeal: { food_items: string; emotional_state: string | null } | null
): string {
  const emotionText = latestMeal?.emotional_state ?? "";
  const highStress = stress >= 4;
  const lowMood = mood <= 2;
  if (lowMood || emotionText.includes("슬픔")) {
    return "지금 마음이 무겁고 힘드셨군요. 폭식은 그 감정을 달래려는 자연스러운 반응이에요 — 당신이 약한 게 아니에요. 지금 눈을 감고 천천히 숨을 세 번 쉬어보세요. 이 에피소드에서 '어떤 신호가 있었는지' 기억해두면 다음번에 그 신호를 알아차릴 수 있게 됩니다. 💙";
  }
  if (highStress || emotionText.includes("불안") || emotionText.includes("스트레스")) {
    return "스트레스나 불안이 높을 때 폭식 충동이 강해지는 건 뇌의 자연스러운 생존 반응이에요. 당신이 약해서가 아닙니다. 지금 4-7-8 호흡(4초 들이쉬고, 7초 참고, 8초 내쉬기)을 세 번 해보세요. 코르티솔이 빠르게 낮아질 거예요. 이 상황이 내 트리거라는 걸 인식한 것만으로도 변화가 시작됩니다. 💛";
  }
  if (emotionText.includes("외로") || emotionText.includes("공허")) {
    return "외롭거나 공허할 때 음식이 그 빈자리를 채워주는 것 같지만, 그 감정은 여전히 남아있죠. 지금 그 외로움을 인정해주세요 — 판단 없이요. 연락하고 싶은 한 사람에게 짧은 메시지를 보내거나, 5분 산책으로 기분을 전환해보세요. 이 패턴을 인식하는 것이 변화의 첫 걸음이에요. 🫂";
  }
  const general = [
    "오늘 어려운 순간이 있었지만, 기록한 것 자체가 변화를 향한 용기 있는 행동이에요. 자책보다 '무엇이 나를 이 상황으로 이끌었는지' 부드럽게 탐색해보세요. 그 답이 다음번 전략이 됩니다. 💙",
    "완벽한 변화의 길은 없어요. 실수하고, 기록하고, 다시 시작하는 것 — 그 반복이 진짜 행동변화예요. 지금 물 한 잔 마시고 잠깐 쉬어가요. 🌱",
  ];
  return general[mood % general.length];
}

// ── 감정 공감 ──────────────────────────────────────────────────────

export async function getEmotionComfort(logId: string): Promise<string> {
  const supabase = await createClient();
  const { data: log } = await supabase.from("daily_logs").select("*").eq("id", logId).single();
  if (!log?.emotion_story && !log?.emotion_type) return "오늘 감정을 먼저 기록해주세요.";

  const prompt = `당신은 오랜 친구처럼 따뜻하게 공감해주는 감정 지지자입니다.
절대 조언하거나 가르치려 하지 마세요. 먼저 충분히 들어주고 이해받는 느낌을 주는 게 전부예요.

오늘 감정 유형: ${log.emotion_type ?? "기록 없음"}
오늘 있었던 일: ${log.emotion_story ?? "이야기 없음"}
기분 점수: ${log.mood}/5, 스트레스: ${log.stress_level}/5

아래 형식으로 응답 (각 섹션 1-2문장, 총 100자 내외):

===공감===
그 감정을 완전히 인정하는 문장. "~하셨겠어요", "그럴 수 있어요" 사용. 판단 없이.

===이해===
왜 그 감정이 생겼는지 사용자 편에서 1문장. "당연한 거예요" 식으로.

===위로===
따뜻한 격려 1문장. "오늘도 충분히 잘 하고 있어요" 같은 정서적 연결.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    const extract = (s: string) => {
      const m = text.match(new RegExp(`===${s}===\\s*([\\s\\S]*?)(?====|$)`));
      return m ? m[1].trim() : null;
    };
    const result = [extract("공감"), extract("이해"), extract("위로")].filter(Boolean).join("\n\n");
    await supabase.from("daily_logs").update({ ai_comfort: result }).eq("id", logId);
    revalidatePath("/");
    return result || text.slice(0, 200);
  } catch {
    const fallbacks: Record<string, string> = {
      "불안": "불안한 마음이 드는 건 정말 힘든 일이에요. 그 감정이 얼마나 무거운지 느껴져요.\n\n불안은 우리가 무언가를 깊이 신경 쓰고 있다는 신호예요. 당연한 거예요.\n\n지금 이 순간 숨 한 번 깊게 쉬어요. 오늘도 충분히 잘 하고 있어요.",
      "슬픔": "슬프다는 건 정말 힘든 감정이에요. 그 무게를 혼자 감당하고 계신 게 느껴져요.\n\n슬픔은 소중한 것들을 마음에 품고 있기 때문에 생겨요. 당연한 거예요.\n\n울어도 괜찮아요. 오늘 하루도 잘 버텨내셨어요.",
      "분노": "화가 나는 건 정당한 감정이에요. 억울하고 속상한 마음이 느껴져요.\n\n그 분노는 옳은 것을 원하고 있다는 신호예요. 당연히 화가 날 수 있어요.\n\n그 감정을 인정해주세요. 오늘도 잘 버티셨어요.",
      "공허": "공허한 느낌은 묘하게 힘든 감정이에요. 무엇을 해야 할지 모르는 그 막막함이 느껴져요.\n\n공허함은 충전이 필요하다는 신호예요. 당연히 그럴 수 있어요.\n\n오늘은 그냥 쉬어도 괜찮아요. 충분히 잘 하고 있어요.",
      "지침": "정말 많이 지치셨겠어요. 그 피로감이 얼마나 무거운지 느껴져요.\n\n몸과 마음이 힘들 땐 쉬어야 한다는 신호예요. 당연한 거예요.\n\n오늘은 자신에게 친절하게 대해주세요. 충분히 잘 하고 있어요.",
      "외로움": "외로운 마음이 드는 건 정말 힘든 거예요. 그 쓸쓸함이 얼마나 힘든지 알아요.\n\n외로움은 연결을 원하는 마음에서 와요. 당연히 그럴 수 있어요.\n\n지금 이 기록이 자신과 연결되는 시간이에요. 오늘도 잘 하고 있어요.",
    };
    const result = fallbacks[log.emotion_type ?? ""] ?? "오늘 감정을 기록해주셔서 감사해요. 자신의 마음을 들여다보는 것 자체가 용기 있는 일이에요.\n\n어떤 감정이든 당신의 것이고 당연한 거예요.\n\n항상 응원합니다.";
    await supabase.from("daily_logs").update({ ai_comfort: result }).eq("id", logId);
    revalidatePath("/");
    return result;
  }
}

// ── 회복 메시지 ────────────────────────────────────────────────────

export async function getRecoveryMessage(logId: string): Promise<string> {
  const supabase = await createClient();
  const { data: log } = await supabase.from("daily_logs").select("*").eq("id", logId).single();

  const bingeCount = await supabase
    .from("meals")
    .select("id")
    .eq("log_id", logId)
    .eq("is_binge", true)
    .then(r => (r.data ?? []).length);

  const prompt = `당신은 따뜻하고 비판 없는 회복 전문 코치입니다.
오늘 사용자의 상태를 보고 "회복" 관점의 짧은 메시지를 써주세요.
실패가 아닌 "쉬어감"과 "회복 과정"으로 프레이밍하세요.

오늘 데이터:
- 기분: ${log?.mood ?? 3}/5
- 스트레스: ${log?.stress_level ?? 3}/5
- 폭식 횟수: ${bingeCount}회
- 감정: ${log?.emotion_type ?? "미기록"}
- 감정 이야기: ${log?.emotion_story ?? "미기록"}

2-3문장으로 따뜻하고 짧게. "의지보다 회복", "무너진 게 아니라 쉬어간 것", "이런 날도 회복의 일부" 같은 관점 사용.
자책 유발 표현 절대 금지. "오늘은 ..." 으로 시작하세요.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    await supabase.from("daily_logs").update({ recovery_message: text }).eq("id", logId);
    revalidatePath("/");
    return text;
  } catch {
    const msgs = [
      "오늘은 의지보다 회복이 필요한 하루였을 수 있어요. 무너진 게 아니라 잠깐 쉬어간 거예요. 이런 날도 당신의 회복 여정에 포함돼요.",
      "오늘 완벽하지 않았어도 괜찮아요. 이런 날이 있어야 더 단단해져요. 기록한 것 자체가 이미 회복의 시작이에요.",
      "오늘은 통제보다 자기 돌봄이 필요한 날이었어요. 자책 말고 오늘 하루 그냥 받아들여요. 내일이 또 있으니까요.",
      "오늘 흔들렸다면, 그건 당신이 여전히 노력하고 있다는 증거예요. 넘어진 게 아니라 쉬어간 거예요.",
    ];
    const result = msgs[Math.floor(Math.random() * msgs.length)];
    await supabase.from("daily_logs").update({ recovery_message: result }).eq("id", logId);
    revalidatePath("/");
    return result;
  }
}

// ── 데이터 기반 패턴 인사이트 ──────────────────────────────────────

export async function getPatternInsights(): Promise<string> {
  const logs = await getRecentLogs(14);
  if (logs.length < 3) return "3일 이상 기록하면 패턴 분석이 시작돼요. 조금 더 기록해주세요!";

  // 구체적 통계 계산
  const highStressLogs = logs.filter(l => l.stress_level >= 4);
  const lowStressLogs = logs.filter(l => l.stress_level <= 2);
  const highStressBinge = highStressLogs.reduce((a, l) => a + l.meals.filter(m => m.is_binge).length, 0);
  const lowStressBinge = lowStressLogs.reduce((a, l) => a + l.meals.filter(m => m.is_binge).length, 0);
  const highStressNight = highStressLogs.reduce((a, l) => a + l.meals.filter(m => parseInt(m.meal_time.split(":")[0]) >= 21).length, 0);

  const allMeals = logs.flatMap(l => l.meals);
  const nightMeals = allMeals.filter(m => parseInt(m.meal_time.split(":")[0]) >= 21);
  const emotionNightMeals = nightMeals.filter(m => m.emotional_state && !m.emotional_state.includes("진짜 배고파서") && !m.emotional_state.includes("시간이라서"));

  // 요일별 폭식 패턴
  const dayBinge: Record<number, number> = {};
  logs.forEach(l => {
    const day = new Date(l.date + "T00:00:00").getDay();
    dayBinge[day] = (dayBinge[day] ?? 0) + l.meals.filter(m => m.is_binge).length;
  });
  const peakDay = Object.entries(dayBinge).sort((a, b) => b[1] - a[1])[0];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const stats = {
    totalDays: logs.length,
    totalBinge: logs.reduce((a, l) => a + l.meals.filter(m => m.is_binge).length, 0),
    avgStress: (logs.reduce((a, l) => a + l.stress_level, 0) / logs.length).toFixed(1),
    avgMood: (logs.reduce((a, l) => a + l.mood, 0) / logs.length).toFixed(1),
    highStressCount: highStressLogs.length,
    highStressBinge,
    lowStressBinge,
    nightMealCount: nightMeals.length,
    emotionNightMealCount: emotionNightMeals.length,
    peakBingeDay: peakDay ? dayNames[parseInt(peakDay[0])] : null,
    mealEatReasons: allMeals.map(m => m.emotional_state).filter(Boolean).slice(0, 20).join(" | "),
  };

  const prompt = `당신은 데이터 기반 식습관 패턴 분석 전문가입니다.
아래 ${stats.totalDays}일 데이터를 분석하여 구체적인 패턴 인사이트를 생성하세요.
숫자와 구체적 사실에 근거해서, "~한 경향이 있어요", "~빈도가 높았어요" 식으로 써주세요.
따뜻하지만 명확하게. 조언보다 패턴 설명에 집중하세요.

데이터 요약:
- 분석 기간: ${stats.totalDays}일
- 총 폭식: ${stats.totalBinge}회
- 평균 스트레스: ${stats.avgStress}/5, 평균 기분: ${stats.avgMood}/5
- 스트레스 4+인 날(${stats.highStressCount}일)의 폭식: ${stats.highStressBinge}회
- 저스트레스 날(${lowStressLogs.length}일)의 폭식: ${stats.lowStressBinge}회
- 밤 9시 이후 식사: ${stats.nightMealCount}회 (중 감정적 이유: ${stats.emotionNightMealCount}회)
- 폭식 집중 요일: ${stats.peakBingeDay ?? "특정 없음"}
- 식사 이유 샘플: ${stats.mealEatReasons || "미기록"}

아래 형식으로 3가지 패턴과 핵심 포인트:

===패턴1===
구체적 패턴 1 (숫자 포함, 1-2문장)

===패턴2===
구체적 패턴 2 (숫자 포함, 1-2문장)

===패턴3===
구체적 패턴 3 (숫자 포함, 1-2문장)

===핵심포인트===
가장 효과적인 개입 포인트 1가지 (1문장)`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    const extract = (s: string) => {
      const m = text.match(new RegExp(`===${s}===\\s*([\\s\\S]*?)(?====|$)`));
      return m ? m[1].trim() : null;
    };
    const patterns = [extract("패턴1"), extract("패턴2"), extract("패턴3")].filter(Boolean);
    const key = extract("핵심포인트");
    return JSON.stringify({ patterns, key });
  } catch {
    const patterns = [
      stats.highStressCount > 0 && stats.highStressBinge > stats.lowStressBinge
        ? `스트레스 4점 이상인 날(${stats.highStressCount}일) 폭식이 ${stats.lowStressBinge === 0 ? "집중" : `${Math.round((stats.highStressBinge / Math.max(1, stats.lowStressBinge)) * 10) / 10}배 많이`} 나타났어요`
        : "스트레스와 폭식의 연관성을 더 기록하면 패턴이 보여요",
      stats.emotionNightMealCount > 0
        ? `밤 9시 이후 식사 ${stats.nightMealCount}회 중 ${stats.emotionNightMealCount}회가 감정적 이유로 기록됐어요`
        : "밤 시간대 식사 패턴은 아직 데이터가 부족해요",
      stats.peakBingeDay
        ? `${stats.peakBingeDay}요일에 폭식 빈도가 가장 높게 나타났어요`
        : "아직 특정 요일 패턴은 보이지 않아요",
    ].filter((p): p is string => typeof p === "string");
    return JSON.stringify({ patterns, key: "스트레스 수치가 4 이상인 날 저녁 루틴을 미리 계획해두는 것이 효과적이에요" });
  }
}
