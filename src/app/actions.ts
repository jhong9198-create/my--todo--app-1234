"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DailyLog, Meal, WeeklyReport, Grade } from "@/types/recovery";

export async function getTodayLog(): Promise<{
  log: DailyLog | null;
  meals: Meal[];
}> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("date", today)
    .single();

  if (!log) return { log: null, meals: [] };

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("log_id", log.id)
    .order("meal_time", { ascending: true });

  return { log, meals: meals ?? [] };
}

export async function getRecentLogs(limit = 7): Promise<
  (DailyLog & { meals: Meal[] })[]
> {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("daily_logs")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (!logs?.length) return [];

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .in("log_id", logs.map((l) => l.id));

  return logs.map((log) => ({
    ...log,
    meals: (meals ?? []).filter((m) => m.log_id === log.id),
  }));
}

export async function getWeightHistory(days = 30): Promise<
  { date: string; weight_kg: number }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_logs")
    .select("date, weight_kg")
    .not("weight_kg", "is", null)
    .order("date", { ascending: true })
    .limit(days);

  return (data ?? []) as { date: string; weight_kg: number }[];
}

export async function getWeeklyLogs(): Promise<
  (DailyLog & { meals: Meal[] })[]
> {
  return getRecentLogs(7);
}

export async function getLatestWeeklyReport(): Promise<WeeklyReport | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_reports")
    .select("*")
    .order("week_start", { ascending: false })
    .limit(1)
    .single();
  return data as WeeklyReport | null;
}

export async function getPastWeeklyReports(limit = 8): Promise<WeeklyReport[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_reports")
    .select("*")
    .order("week_start", { ascending: false })
    .limit(limit);
  return (data ?? []) as WeeklyReport[];
}

export async function upsertDailyLog(formData: FormData) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const payload = {
    date: today,
    mood: Number(formData.get("mood")),
    mood_note: (formData.get("mood_note") as string) || null,
    sleep_hours: formData.get("sleep_hours") ? Number(formData.get("sleep_hours")) : null,
    sleep_quality: formData.get("sleep_quality") ? Number(formData.get("sleep_quality")) : null,
    stress_level: Number(formData.get("stress_level")),
    notes: (formData.get("notes") as string) || null,
    weight_kg: formData.get("weight_kg") ? Number(formData.get("weight_kg")) : null,
  };

  const { error } = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "date" });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function addMeal(formData: FormData) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: log } = await supabase
    .from("daily_logs")
    .select("id")
    .eq("date", today)
    .single();

  if (!log) throw new Error("오늘 기록을 먼저 저장하세요.");

  const { error } = await supabase.from("meals").insert({
    log_id: log.id,
    meal_time: formData.get("meal_time") as string,
    food_items: formData.get("food_items") as string,
    location: (formData.get("location") as string) || null,
    is_binge: formData.get("is_binge") === "true",
    emotional_state: (formData.get("emotional_state") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteMeal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function getAIAnalysis(logId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_analyses")
    .select("*")
    .eq("log_id", logId)
    .single();
  return data;
}

// ── 학점 계산 유틸 (서버/클라이언트 공통) ───────────────────────────

export function calculateWeeklyGrade(
  logs: (DailyLog & { meals: Meal[] })[]
): {
  grade: Grade;
  score: number;
  binge_score: number;
  meal_score: number;
  mood_score: number;
  sleep_score: number;
  stress_score: number;
} {
  if (logs.length === 0) {
    return { grade: "F", score: 0, binge_score: 0, meal_score: 0, mood_score: 0, sleep_score: 0, stress_score: 0 };
  }

  const bingeCount = logs.reduce((acc, l) => acc + l.meals.filter((m) => m.is_binge).length, 0);
  const avgMood = logs.reduce((acc, l) => acc + l.mood, 0) / logs.length;
  const avgStress = logs.reduce((acc, l) => acc + l.stress_level, 0) / logs.length;
  const sleepLogs = logs.filter((l) => l.sleep_hours != null);
  const avgSleep = sleepLogs.length > 0
    ? sleepLogs.reduce((acc, l) => acc + (l.sleep_hours ?? 0), 0) / sleepLogs.length
    : null;
  const totalMeals = logs.reduce((acc, l) => acc + l.meals.length, 0);
  const avgMealsPerDay = totalMeals / logs.length;

  // 폭식 점수 (35점): 0회=35, 1회=25, 2회=15, 3회=5, 4+회=0
  const binge_score = Math.max(0, 35 - bingeCount * 10);

  // 식사 규칙성 점수 (25점): 평균 3끼=25점
  const meal_score = Math.min(25, Math.round((avgMealsPerDay / 3) * 25));

  // 기분 평균 점수 (15점)
  const mood_score = Math.round((avgMood / 5) * 15);

  // 수면 점수 (15점)
  let sleep_score = 8;
  if (avgSleep !== null) {
    if (avgSleep >= 7 && avgSleep <= 9) sleep_score = 15;
    else if (avgSleep >= 6 && avgSleep < 7) sleep_score = 10;
    else if (avgSleep > 9 && avgSleep <= 10) sleep_score = 10;
    else sleep_score = 5;
  }

  // 스트레스 점수 (10점)
  const stress_score = Math.round(((5 - avgStress) / 4) * 10);

  const score = Math.min(100, binge_score + meal_score + mood_score + sleep_score + stress_score);

  let grade: Grade = "F";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 70) grade = "B+";
  else if (score >= 60) grade = "B";
  else if (score >= 50) grade = "C+";
  else if (score >= 40) grade = "C";
  else if (score >= 30) grade = "D";

  return { grade, score, binge_score, meal_score, mood_score, sleep_score, stress_score };
}
