"use client";

import { useState } from "react";
import DailyLogForm from "./DailyLogForm";
import MealForm from "./MealForm";
import MealList from "./MealList";
import ExerciseCard from "./ExerciseCard";
import BingeMentoringCard from "./BingeMentoringCard";
import NutritionCoachPanel from "./NutritionCoachPanel";
import EmotionJournalCard from "./EmotionJournalCard";
import PatternAnalysisPanel from "./PatternAnalysisPanel";
import RecoveryScoreCard from "./RecoveryScoreCard";
import BingeRiskCard from "./BingeRiskCard";
import AIEmpathyCard from "./AIEmpathyCard";
import { MOOD_EMOJI } from "@/types/recovery";
import type { DailyLog, Meal, AIAnalysis } from "@/types/recovery";

const TABS = [
  { id: "status",  emoji: "🌱", label: "상태기록" },
  { id: "emotion", emoji: "💙", label: "감정기록" },
  { id: "meal",    emoji: "🍃", label: "식습관" },
  { id: "pattern", emoji: "📊", label: "패턴분석" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  log: DailyLog | null;
  meals: Meal[];
  analysis: AIAnalysis | null;
  weightHistory: { date: string; weight_kg: number }[];
  recentLogs: (DailyLog & { meals: Meal[] })[];
}

export default function HomeTabs({ log, meals, analysis, weightHistory, recentLogs }: Props) {
  const [active, setActive] = useState<TabId>("status");
  const bingeMeals = meals.filter((m) => m.is_binge);

  // 연속 기록 일수 계산
  const streak = (() => {
    const logDates = new Set([
      ...recentLogs.map((l) => l.date),
      ...(log ? [log.date] : []),
    ]);
    let count = 0;
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    // 오늘 기록이 없으면 어제부터 역산
    const checkFrom = new Date(today);
    if (!logDates.has(todayStr)) checkFrom.setDate(checkFrom.getDate() - 1);
    while (count < 30) {
      const d = checkFrom.toISOString().slice(0, 10);
      if (logDates.has(d)) {
        count++;
        checkFrom.setDate(checkFrom.getDate() - 1);
      } else break;
    }
    return count;
  })();

  return (
    <div>
      {/* 탭 네비게이션 */}
      <div className="flex gap-1 bg-stone-100/90 dark:bg-stone-800/90 rounded-2xl p-1 mb-5 backdrop-blur-sm sticky top-2 z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all ${
              active === tab.id
                ? "bg-white dark:bg-stone-700 shadow-sm"
                : "hover:bg-white/50 dark:hover:bg-stone-700/50"
            }`}
          >
            <span className="text-lg leading-none mb-0.5">{tab.emoji}</span>
            <span className={`text-[11px] font-semibold ${
              active === tab.id
                ? "text-green-700 dark:text-green-400"
                : "text-stone-500 dark:text-stone-400"
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── 탭 1: 상태기록 ── */}
      {active === "status" && (
        <div className="space-y-4">
          {log && (
            <div className="grid grid-cols-4 gap-2">
              <StatMini label="기분" value={<span className="text-2xl">{MOOD_EMOJI[log.mood]}</span>} />
              <StatMini
                label="수면"
                value={<span className="text-xl font-bold text-stone-700 dark:text-stone-200">{log.sleep_hours ?? "−"}</span>}
                sub="h"
              />
              <StatMini
                label="스트레스"
                value={
                  <span className={`text-xl font-bold ${log.stress_level >= 4 ? "text-amber-600 dark:text-amber-400" : "text-stone-700 dark:text-stone-200"}`}>
                    {log.stress_level}
                  </span>
                }
                sub="/5"
              />
              <StatMini
                label={bingeMeals.length > 0 ? "폭식" : "식사"}
                value={
                  <span className={`text-xl font-bold ${bingeMeals.length > 0 ? "text-red-500" : "text-green-700 dark:text-green-400"}`}>
                    {bingeMeals.length > 0 ? `${bingeMeals.length}⚠` : meals.length}
                  </span>
                }
                sub="회"
              />
            </div>
          )}

          {/* 회복점수 + 연속 배지 */}
          <RecoveryScoreCard log={log} meals={meals} streak={streak} />

          {/* AI 공감 메시지 (프리미엄) */}
          <AIEmpathyCard log={log} />

          {/* 폭식 위험 예측 (프리미엄) */}
          <BingeRiskCard log={log} meals={meals} recentLogs={recentLogs} />

          <ExerciseCard />

          <div className="organic-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span>🌱</span>
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">오늘 상태 체크인</h2>
            </div>
            <DailyLogForm existing={log} />
          </div>
        </div>
      )}

      {/* ── 탭 2: 감정기록 ── */}
      {active === "emotion" && (
        <EmotionJournalCard log={log} recentLogs={recentLogs} />
      )}

      {/* ── 탭 3: 식습관 ── */}
      {active === "meal" && (
        <div className="space-y-4">
          {log && bingeMeals.length > 0 && (
            <BingeMentoringCard
              logId={log.id}
              bingeCount={bingeMeals.length}
              latestBingeMeal={
                bingeMeals.at(-1)
                  ? { food_items: bingeMeals.at(-1)!.food_items, emotional_state: bingeMeals.at(-1)!.emotional_state }
                  : null
              }
            />
          )}

          <div className="organic-card overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-stone-100 dark:border-stone-700/50">
              <div className="flex items-center gap-2">
                <span>🍃</span>
                <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  식사 & 감정 기록
                  {bingeMeals.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      폭식 {bingeMeals.length}회
                    </span>
                  )}
                </h2>
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 pl-6">
                먹은 것 + 왜 먹었는지 함께 기록해요
              </p>
            </div>
            <div className="p-5">
              {log ? (
                <div className="space-y-3">
                  <MealList meals={meals} />
                  <MealForm />
                </div>
              ) : (
                <p className="text-sm text-stone-400 text-center py-4">상태 체크인을 먼저 저장해주세요</p>
              )}
            </div>
          </div>

          {log && (
            <div className="organic-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <span>🌾</span>
                <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">영양 코칭</h2>
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500 mb-4 pl-6">
                살찌는 요인 · 대체 음식 · 식습관 교정
              </p>
              <NutritionCoachPanel logId={log.id} existing={analysis} />
            </div>
          )}
        </div>
      )}

      {/* ── 탭 4: 패턴분석 ── */}
      {active === "pattern" && (
        <PatternAnalysisPanel
          log={log}
          analysis={analysis}
          weightHistory={weightHistory}
          recentLogs={recentLogs}
        />
      )}
    </div>
  );
}

function StatMini({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="organic-card p-3 text-center">
      <div className="flex items-baseline justify-center gap-0.5">
        {value}
        {sub && <span className="text-xs text-stone-400 dark:text-stone-500">{sub}</span>}
      </div>
      <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">{label}</div>
    </div>
  );
}
