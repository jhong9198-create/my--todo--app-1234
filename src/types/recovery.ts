export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "매우 나쁨 😭",
  2: "나쁨 😢",
  3: "보통 😐",
  4: "좋음 😊",
  5: "매우 좋음 😄",
};

export const MOOD_EMOJI: Record<MoodLevel, string> = {
  1: "😭",
  2: "😢",
  3: "😐",
  4: "😊",
  5: "😄",
};

export const STRESS_LABELS: Record<MoodLevel, string> = {
  1: "없음",
  2: "약함",
  3: "보통",
  4: "강함",
  5: "극심함",
};

export const LOCATIONS = [
  "집",
  "사무실",
  "식당",
  "카페",
  "편의점",
  "차 안",
  "기타",
] as const;

export type Location = (typeof LOCATIONS)[number];

export interface DailyLog {
  id: string;
  date: string;
  mood: MoodLevel;
  mood_note: string | null;
  sleep_hours: number | null;
  sleep_quality: MoodLevel | null;
  stress_level: MoodLevel;
  notes: string | null;
  weight_kg: number | null;
  created_at: string;
}

export type Grade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

export interface WeeklyReport {
  id: string;
  week_start: string;
  week_end: string;
  grade: Grade;
  grade_score: number;
  binge_score: number | null;
  meal_score: number | null;
  mood_score: number | null;
  sleep_score: number | null;
  stress_score: number | null;
  evaluation: string | null;
  ai_feedback: string | null;
  created_at: string;
}

export interface Meal {
  id: string;
  log_id: string;
  meal_time: string;
  food_items: string;
  location: string | null;
  is_binge: boolean;
  emotional_state: string | null;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  log_id: string;
  emotional_patterns: string | null;
  time_patterns: string | null;
  recovery_status: string | null;
  binge_triggers: string | null;
  today_comment: string | null;
  tomorrow_routine: string | null;
  pattern_report: string | null;
  weight_factors: string | null;
  food_alternatives: string | null;
  eating_mentoring: string | null;
  created_at: string;
}

export interface DailyLogWithMeals extends DailyLog {
  meals: Meal[];
  ai_analysis?: AIAnalysis | null;
}
