"use client";

import { useTransition, useState } from "react";
import { analyzeToday } from "@/app/ai-actions";
import type { AIAnalysis } from "@/types/recovery";

interface Props {
  logId: string;
  existing: AIAnalysis | null;
}

export default function AIAnalysisPanel({ logId, existing }: Props) {
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(existing);
  const [error, setError] = useState<string | null>(null);

  function handleAnalyze() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await analyzeToday(logId);
        setAnalysis(result as AIAnalysis);
      } catch (e) {
        setError(e instanceof Error ? e.message : "코칭 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleAnalyze}
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            AI 코칭 분석 중...
          </span>
        ) : analysis ? (
          "코칭 재분석"
        ) : (
          "AI 행동 코칭 받기 🧠"
        )}
      </button>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {analysis && (
        <div className="space-y-3">
          <CoachingCard
            emoji="🧠"
            title="오늘의 코칭 메시지"
            content={analysis.today_comment}
            highlight
          />
          <CoachingCard
            emoji="📋"
            title="내일 행동 실천 계획"
            content={analysis.tomorrow_routine}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CoachingCard
              emoji="🔄"
              title="습관 루프 분석"
              content={analysis.emotional_patterns}
              compact
            />
            <CoachingCard
              emoji="🛡️"
              title="대처 전략"
              content={analysis.time_patterns}
              compact
            />
            <CoachingCard
              emoji="📍"
              title="변화 단계"
              content={analysis.recovery_status}
              compact
            />
            <CoachingCard
              emoji="⚡"
              title="트리거 분석"
              content={analysis.binge_triggers}
              compact
            />
          </div>
          <CoachingCard
            emoji="📊"
            title="행동 패턴 리포트"
            content={analysis.pattern_report}
          />
        </div>
      )}
    </div>
  );
}

function CoachingCard({
  emoji,
  title,
  content,
  highlight = false,
  compact = false,
}: {
  emoji: string;
  title: string;
  content: string | null | undefined;
  highlight?: boolean;
  compact?: boolean;
}) {
  if (!content) return null;
  return (
    <div
      className={`rounded-xl p-4 ${
        highlight
          ? "bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-100 dark:border-teal-800"
          : "bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-base">{emoji}</span>
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <p
        className={`text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {content}
      </p>
    </div>
  );
}
