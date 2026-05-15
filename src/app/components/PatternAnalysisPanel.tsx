"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import WeightGraph from "./WeightGraph";
import AIAnalysisPanel from "./AIAnalysisPanel";
import PremiumGate from "./PremiumGate";
import { getPatternInsights } from "@/app/ai-actions";
import type { DailyLog, Meal, AIAnalysis } from "@/types/recovery";

interface Props {
  log: DailyLog | null;
  analysis: AIAnalysis | null;
  weightHistory: { date: string; weight_kg: number }[];
  recentLogs: (DailyLog & { meals: Meal[] })[];
}

export default function PatternAnalysisPanel({ log, analysis, weightHistory, recentLogs }: Props) {
  const [insights, setInsights] = useState<{ patterns: string[]; key: string | null } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAnalyze() {
    startTransition(async () => {
      const raw = await getPatternInsights();
      try {
        setInsights(JSON.parse(raw));
      } catch {
        setInsights({ patterns: [raw], key: null });
      }
    });
  }

  // 최근 7일 기분/스트레스 trend
  const trend = [...recentLogs].slice(0, 7).reverse();

  // 폭식 이유 상위 3개
  const allBingeMeals = recentLogs.flatMap(l => l.meals.filter(m => m.is_binge && m.emotional_state));
  const reasonCounts: Record<string, number> = {};
  allBingeMeals.forEach(m => {
    const match = m.emotional_state?.match(/이유:\s*([^/\n]+)/);
    if (match) {
      const r = match[1].trim();
      reasonCounts[r] = (reasonCounts[r] ?? 0) + 1;
    }
  });
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="space-y-4">

      {/* AI 데이터 기반 패턴 분석 */}
      <div className="organic-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🔬</span>
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">AI 패턴 분석</h3>
        </div>

        {insights ? (
          <div className="space-y-3">
            {insights.patterns.map((p, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">{p}</p>
              </div>
            ))}
            {insights.key && (
              <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 flex gap-2">
                <span className="text-amber-500 shrink-0">⭐</span>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{insights.key}</p>
              </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={isPending}
              className="text-xs text-stone-400 hover:text-violet-600 transition-colors underline underline-offset-2"
            >
              {isPending ? "분석 중..." : "다시 분석하기"}
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">
              최근 {recentLogs.length}일 데이터를 분석하여 구체적인 패턴을 찾아드려요.<br />
              <span className="text-violet-500">예: "스트레스 높은 밤 시간대 야식 빈도가 증가합니다"</span>
            </p>
            <button
              onClick={handleAnalyze}
              disabled={isPending || recentLogs.length < 3}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  AI가 패턴 분석 중...
                </span>
              ) : recentLogs.length < 3 ? "3일 이상 기록 후 분석 가능" : "🔬 내 패턴 분석하기"}
            </button>
          </>
        )}
      </div>

      {/* 최근 7일 기분 & 스트레스 트렌드 */}
      {trend.length > 0 && (
        <div className="organic-card p-5">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">📈 기분 & 스트레스 트렌드</h3>
          <div className="space-y-2.5">
            {trend.map((l) => (
              <div key={l.id} className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 w-11 shrink-0">
                  {l.date.slice(5).replace("-", "/")}
                </span>
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-400 w-4">😊</span>
                  <div className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-400 transition-all"
                      style={{ width: `${(l.mood / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 w-3">{l.mood}</span>
                </div>
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-400 w-4">😰</span>
                  <div className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-amber-400 transition-all"
                      style={{ width: `${(l.stress_level / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 w-3">{l.stress_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 폭식 이유 패턴 */}
      {topReasons.length > 0 && (
        <div className="organic-card p-5">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">⚡ 폭식 이유 패턴</h3>
          <div className="space-y-2">
            {topReasons.map(([reason, count], i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 bg-stone-50 dark:bg-stone-700/50 rounded-xl px-3 py-2">
                  <span className="text-xs text-stone-600 dark:text-stone-300">{reason}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: count }).map((_, j) => (
                    <div key={j} className="w-2 h-2 rounded-full bg-amber-400" />
                  ))}
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 ml-1">{count}회</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-stone-400 mt-3">이 이유가 올 때 대처 전략을 미리 세워두세요</p>
        </div>
      )}

      {/* 체중 그래프 */}
      <div className="organic-card p-5">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">⚖️ 체중 변화</h3>
        <WeightGraph data={weightHistory} />
      </div>

      {/* 스트레스 & 식습관 연결 — 프리미엄 */}
      <PremiumGate
        feature="스트레스 & 식습관 연결"
        description="스트레스 수준이 식습관에 어떤 영향을 주는지 데이터로 분석해요"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🔗</span>
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">스트레스 & 식습관 연결</h3>
          </div>

          {/* 스트레스 단계별 폭식 발생률 */}
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((level) => {
              const logsAtLevel = recentLogs.filter((l) => l.stress_level === level);
              const bingedays = logsAtLevel.filter((l) => l.meals.some((m) => m.is_binge)).length;
              const rate = logsAtLevel.length > 0 ? bingedays / logsAtLevel.length : 0;
              const pct = Math.round(rate * 100);
              const barColor =
                level >= 4 ? "bg-red-400" : level === 3 ? "bg-amber-400" : "bg-emerald-400";
              const label =
                level === 1 ? "없음" : level === 2 ? "약함" : level === 3 ? "보통" : level === 4 ? "강함" : "극심함";
              return (
                <div key={level} className="flex items-center gap-2">
                  <div className="w-14 shrink-0">
                    <span className="text-[10px] text-stone-400">{label}</span>
                  </div>
                  <div className="flex-1 h-3 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full`}
                      style={{ width: logsAtLevel.length > 0 ? `${pct}%` : "0%", minWidth: logsAtLevel.length > 0 ? "4px" : "0", transition: "width 0.8s ease" }}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-right">
                    {logsAtLevel.length > 0 ? (
                      <span className="text-[10px] text-stone-400">
                        {pct}% <span className="text-stone-300 dark:text-stone-600">({logsAtLevel.length}일)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-300 dark:text-stone-600">데이터 없음</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500">
            각 스트레스 단계에서 폭식이 있었던 날의 비율
          </p>

          {/* 인사이트 텍스트 */}
          {(() => {
            const high = recentLogs.filter((l) => l.stress_level >= 4);
            const low = recentLogs.filter((l) => l.stress_level <= 2);
            const highBinge = high.filter((l) => l.meals.some((m) => m.is_binge)).length;
            const lowBinge = low.filter((l) => l.meals.some((m) => m.is_binge)).length;
            const highRate = high.length > 0 ? highBinge / high.length : 0;
            const lowRate = low.length > 0 ? lowBinge / low.length : 0;
            if (high.length < 2 && low.length < 2) return null;
            const diff = highRate - lowRate;
            return (
              <div
                className="rounded-xl p-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed"
                style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}
              >
                {diff > 0.2
                  ? `스트레스가 높은 날, 폭식 가능성이 ${Math.round(diff * 100)}%p 더 높아요. 스트레스 관리가 식습관 교정의 핵심이에요.`
                  : diff > 0
                  ? "스트레스와 폭식 사이에 약한 연관성이 보여요. 기록을 이어가면 패턴이 더 뚜렷해져요."
                  : "현재 데이터에서는 스트레스 수준과 폭식의 뚜렷한 연관성이 보이지 않아요."}
              </div>
            );
          })()}
        </div>
      </PremiumGate>

      {/* AI 행동 코칭 */}
      {log && (
        <div className="organic-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span>🧠</span>
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">AI 행동 코칭</h3>
          </div>
          <AIAnalysisPanel logId={log.id} existing={analysis} />
        </div>
      )}

      {/* 주간 리포트 바로가기 */}
      <Link
        href="/weekly"
        className="organic-card p-4 flex items-center justify-between hover:border-green-300 dark:hover:border-green-700 transition-colors block"
      >
        <div>
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">📊 주간 학점 리포트</p>
          <p className="text-xs text-stone-400 mt-0.5">지난 7일 식습관 종합 평가 보기</p>
        </div>
        <span className="text-stone-400 text-lg">→</span>
      </Link>
    </div>
  );
}
