"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DailyLog, Meal, WeeklyReport } from "@/types/recovery";

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

export async function getEmotionHistory(limit = 30): Promise<
  { id: string; date: string; emotion_type: string | null; emotion_story: string | null; ai_comfort: string | null; recovery_message: string | null; mood: number; stress_level: number }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_logs")
    .select("id, date, emotion_type, emotion_story, ai_comfort, recovery_message, mood, stress_level")
    .not("emotion_type", "is", null)
    .order("date", { ascending: false })
    .limit(limit);
  return (data ?? []) as { id: string; date: string; emotion_type: string | null; emotion_story: string | null; ai_comfort: string | null; recovery_message: string | null; mood: number; stress_level: number }[];
}

export async function saveEmotionJournal(
  logId: string,
  emotionType: string,
  emotionStory: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_logs")
    .update({ emotion_type: emotionType, emotion_story: emotionStory })
    .eq("id", logId);
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

