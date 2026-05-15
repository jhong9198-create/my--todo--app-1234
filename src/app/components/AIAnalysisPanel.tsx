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
        setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleAnalyze}
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-400 to-rose-400 hover:from-violet-500 hover:to-rose-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            AI 분석 중...
          </span>
        ) : analysis ? (
          "AI 재분석"
        ) : (
          "AI 패턴 분석하기 ✨"
        )}
      </button>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {analysis && (
        <div className="space-y-3">
          <AnalysisCard
            emoji="💬"
            title="오늘 회복 코멘트"
            content={analysis.today_comment}
            highlight
          />
          <AnalysisCard
            emoji="🗓️"
            title="내일 추천 루틴"
            content={analysis.tomorrow_routine}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnalysisCard
              emoji="💭"
              title="감정 패턴"
              content={analysis.emotional_patterns}
              compact
            />
            <AnalysisCard
              emoji="🕐"
              title="시간대 패턴"
              content={analysis.time_patterns}
              compact
            />
            <AnalysisCard
              emoji="🌱"
              title="회복 상태"
              content={analysis.recovery_status}
              compact
            />
            <AnalysisCard
              emoji="⚠️"
              title="폭식 트리거"
              content={analysis.binge_triggers}
              compact
            />
          </div>
          <AnalysisCard
            emoji="📊"
            title="반복 패턴 리포트"
            content={analysis.pattern_report}
          />
        </div>
      )}
    </div>
  );
}

function AnalysisCard({
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
          ? "bg-gradient-to-br from-rose-50 to-violet-50 dark:from-rose-900/20 dark:to-violet-900/20 border border-rose-100 dark:border-rose-800"
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
