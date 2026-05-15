"use client";

import { useState, useTransition } from "react";
import { generateWeeklyReport } from "@/app/ai-actions";
import type { WeeklyReport, Grade } from "@/types/recovery";

interface GradeData {
  grade: Grade;
  score: number;
  binge_score: number;
  meal_score: number;
  mood_score: number;
  sleep_score: number;
  stress_score: number;
}

interface Props {
  gradeData: GradeData;
  existingReport: WeeklyReport | null;
  hasEnoughData: boolean;
}

export default function WeeklyReportClient({ gradeData, existingReport, hasEnoughData }: Props) {
  const [report, setReport] = useState<WeeklyReport | null>(existingReport);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateWeeklyReport();
        if (result) setReport(result as WeeklyReport);
      } catch (e) {
        setError("평가 생성 중 오류가 발생했어요. 다시 시도해주세요.");
      }
    });
  }

  if (!hasEnoughData) return null;

  return (
    <div className="organic-card p-5 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🎓</span>
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">AI 교수 평가</h3>
      </div>

      {report?.ai_feedback ? (
        <div className="space-y-3">
          {/* 교수 평가 텍스트 */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                교
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">식습관 교수의 한 마디</p>
                <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                  {report.ai_feedback}
                </p>
              </div>
            </div>
          </div>

          {/* 재생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors underline underline-offset-2"
          >
            {isPending ? "생성 중..." : "평가 다시 받기"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            이번 주 식습관에 대한 AI 교수의 상세 평가를 받아보세요.
            학점 근거, 잘한 점, 개선할 점을 알려드립니다.
          </p>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-sm"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                교수님이 평가 중...
              </span>
            ) : "🎓 AI 교수 평가 받기"}
          </button>
        </div>
      )}
    </div>
  );
}
