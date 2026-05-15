"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRecentLogs } from "@/app/actions";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  const bingeCount = recentLogs.reduce(
    (acc, l) => acc + l.meals.filter((m) => m.is_binge).length,
    0
  );
  const avgMood =
    recentLogs.length > 0
      ? recentLogs.reduce((acc, l) => acc + l.mood, 0) / recentLogs.length
      : 0;
  const avgStress =
    recentLogs.length > 0
      ? recentLogs.reduce((acc, l) => acc + l.stress_level, 0) /
        recentLogs.length
      : 0;

  const prompt = `당신은 식이장애 회복을 돕는 전문 상담사입니다. 아래 오늘의 기록과 최근 패턴을 분석해 주세요.

## 오늘 기록 (${log.date})
- 기분: ${log.mood}/5${log.mood_note ? ` (${log.mood_note})` : ""}
- 수면: ${log.sleep_hours ?? "미기록"}시간, 수면 질 ${log.sleep_quality ?? "미기록"}/5
- 스트레스: ${log.stress_level}/5
- 메모: ${log.notes ?? "없음"}

## 오늘 식사 기록
${
  meals && meals.length > 0
    ? meals
        .map(
          (m) =>
            `- ${m.meal_time} | ${m.food_items} | 장소: ${m.location ?? "미기록"} | 폭식: ${m.is_binge ? "예" : "아니오"} | 감정: ${m.emotional_state ?? "미기록"}`
        )
        .join("\n")
    : "식사 기록 없음"
}

## 최근 14일 통계
- 평균 기분: ${avgMood.toFixed(1)}/5
- 평균 스트레스: ${avgStress.toFixed(1)}/5
- 폭식 횟수: ${bingeCount}회
- 기록 일수: ${recentLogs.length}일

## 최근 기록 요약
${recentLogs
  .slice(0, 7)
  .map(
    (l) =>
      `${l.date}: 기분${l.mood} 스트레스${l.stress_level} 폭식${l.meals.filter((m) => m.is_binge).length}회`
  )
  .join("\n")}

다음 6가지 항목을 각각 JSON 형태로 분석해 주세요:
1. emotional_patterns: 감정 패턴 분석 (2-3문장)
2. time_patterns: 시간대별 식사 패턴 분석 (2-3문장)
3. recovery_status: 현재 회복 상태 평가 (2-3문장)
4. binge_triggers: 폭식 트리거 분석 (2-3문장, 없으면 긍정적 멘트)
5. today_comment: 오늘 회복 응원 코멘트 (따뜻하고 구체적으로, 2-3문장)
6. tomorrow_routine: 내일 추천 루틴 3가지 (구체적인 시간과 행동)
7. pattern_report: 반복 패턴 요약 리포트 (3-4문장)

반드시 아래 JSON 형식으로만 응답하세요:
{
  "emotional_patterns": "...",
  "time_patterns": "...",
  "recovery_status": "...",
  "binge_triggers": "...",
  "today_comment": "...",
  "tomorrow_routine": "...",
  "pattern_report": "..."
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 응답 파싱 실패");

  const analysis = JSON.parse(jsonMatch[0]);

  const { error } = await supabase.from("ai_analyses").upsert(
    { log_id: logId, ...analysis },
    { onConflict: "log_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/");

  return analysis;
}
