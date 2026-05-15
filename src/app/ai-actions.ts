"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRecentLogs } from "@/app/actions";
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
