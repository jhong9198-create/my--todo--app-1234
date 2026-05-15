import type { DailyLog, Meal, Grade } from "@/types/recovery";

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

  const binge_score = Math.max(0, 35 - bingeCount * 10);
  const meal_score = Math.min(25, Math.round((avgMealsPerDay / 3) * 25));
  const mood_score = Math.round((avgMood / 5) * 15);

  let sleep_score = 8;
  if (avgSleep !== null) {
    if (avgSleep >= 7 && avgSleep <= 9) sleep_score = 15;
    else if ((avgSleep >= 6 && avgSleep < 7) || (avgSleep > 9 && avgSleep <= 10)) sleep_score = 10;
    else sleep_score = 5;
  }

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
