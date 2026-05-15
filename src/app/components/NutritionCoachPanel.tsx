"use client";

import { useState, useTransition } from "react";
import { getNutritionCoaching } from "@/app/ai-actions";
import type { AIAnalysis } from "@/types/recovery";

interface NutritionResult {
  weight_factors: string | null;
  food_alternatives: string | null;
  eating_mentoring: string | null;
}

interface Props {
  logId: string;
  existing: AIAnalysis | null;
}

type Tab = "factors" | "alternatives" | "mentoring";

export default function NutritionCoachPanel({ logId, existing }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<NutritionResult | null>(
    existing?.weight_factors
      ? {
          weight_factors: existing.weight_factors,
          food_alternatives: existing.food_alternatives,
          eating_mentoring: existing.eating_mentoring,
        }
      : null
  );
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("factors");

  function handleAnalyze() {
    setError(null);
    startTransition(async () => {
      try {
        const data = await getNutritionCoaching(logId);
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
      }
    });
  }

  const tabs: { key: Tab; emoji: string; label: string }[] = [
    { key: "factors", emoji: "🔬", label: "살찌는 요인" },
    { key: "alternatives", emoji: "🥗", label: "대체 음식" },
    { key: "mentoring", emoji: "📚", label: "식습관 교정" },
  ];

  const tabContent: Record<Tab, { content: string | null | undefined; emptyMsg: string }> = {
    factors: {
      content: result?.weight_factors,
      emptyMsg: "살찌는 요인을 분석하려면 위 버튼을 눌러주세요.",
    },
    alternatives: {
      content: result?.food_alternatives,
      emptyMsg: "건강한 대체 음식을 추천받으려면 위 버튼을 눌러주세요.",
    },
    mentoring: {
      content: result?.eating_mentoring,
      emptyMsg: "올바른 식습관 멘토링을 받으려면 위 버튼을 눌러주세요.",
    },
  };

  return (
    <div className="space-y-4">
      {/* 분석 버튼 */}
      <button
        onClick={handleAnalyze}
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            영양 분석 중...
          </span>
        ) : result ? (
          "영양 분석 재실행"
        ) : (
          "🔬 살찌는 요인 · 대체 음식 · 식습관 분석"
        )}
      </button>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {/* 탭 UI */}
      <div className="bg-white/80 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden backdrop-blur-sm shadow-sm">
        {/* 탭 헤더 */}
        <div className="flex border-b border-stone-100 dark:border-stone-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                activeTab === tab.key
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-b-2 border-amber-500"
                  : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700/50"
              }`}
            >
              <span className="text-base">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-5">
          {activeTab === "factors" && (
            <FactorsContent content={result?.weight_factors} />
          )}
          {activeTab === "alternatives" && (
            <AlternativesContent content={result?.food_alternatives} />
          )}
          {activeTab === "mentoring" && (
            <MentoringContent content={result?.eating_mentoring} />
          )}
          {!result && (
            <p className="text-sm text-stone-400 text-center py-4">
              {tabContent[activeTab].emptyMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 탭 콘텐츠 컴포넌트들 ───────────────────────────────────── */

function FactorsContent({ content }: { content: string | null | undefined }) {
  if (!content) return null;

  const items = content
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
        내 식사 기록 기반으로 파악된 체중 증가 요인입니다
      </p>
      {items.map((item, i) => {
        const colonIdx = item.indexOf("]:");
        const hasFormat = item.startsWith("[") && colonIdx !== -1;
        const title = hasFormat ? item.slice(1, colonIdx) : null;
        const body = hasFormat ? item.slice(colonIdx + 2).trim() : item;
        return (
          <div
            key={i}
            className="flex gap-3 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900"
          >
            <span className="text-amber-500 font-bold text-sm shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div>
              {title && (
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                  {title}
                </p>
              )}
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AlternativesContent({ content }: { content: string | null | undefined }) {
  if (!content) return null;

  const lines = content
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
        더 건강한 선택으로 맛있게 교체해보세요
      </p>
      {lines.map((line, i) => {
        const arrowIdx = line.indexOf("→");
        const hasBad = line.startsWith("❌");
        const before = arrowIdx !== -1 ? line.slice(0, arrowIdx).replace("❌", "").trim() : line;
        const after = arrowIdx !== -1 ? line.slice(arrowIdx + 1).trim() : "";
        const goodPart = after.startsWith("✅") ? after.slice(1).trim() : after;
        const colonIdx = goodPart.indexOf(":");
        const foodName = colonIdx !== -1 ? goodPart.slice(0, colonIdx).trim() : goodPart;
        const reason = colonIdx !== -1 ? goodPart.slice(colonIdx + 1).trim() : "";

        if (!hasBad && arrowIdx === -1) {
          return (
            <div key={i} className="p-3.5 rounded-xl bg-green-50/60 dark:bg-green-900/10 border border-green-100 dark:border-green-900">
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{line}</p>
            </div>
          );
        }

        return (
          <div key={i} className="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="flex items-stretch">
              <div className="flex-1 p-3 bg-red-50/50 dark:bg-red-900/10 border-r border-stone-200 dark:border-stone-700">
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-0.5">❌ 현재</p>
                <p className="text-xs text-stone-700 dark:text-stone-300">{before}</p>
              </div>
              <div className="flex-1 p-3 bg-green-50/50 dark:bg-green-900/10">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-0.5">✅ 대체</p>
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">{foodName}</p>
              </div>
            </div>
            {reason && (
              <div className="px-3 py-2 bg-stone-50/50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-700">
                <p className="text-xs text-stone-500 dark:text-stone-400">{reason}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MentoringContent({ content }: { content: string | null | undefined }) {
  if (!content) return null;

  const sections = content
    .split(/\n(?=\d+\.)/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sections.length <= 1) {
    return (
      <div className="prose prose-sm max-w-none">
        <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-500 dark:text-stone-400">
        과학적 근거를 바탕으로 한 개인화 식습관 교정 가이드
      </p>
      {sections.map((section, i) => {
        const firstNewline = section.indexOf("\n");
        const title = firstNewline !== -1 ? section.slice(0, firstNewline).trim() : section;
        const body = firstNewline !== -1 ? section.slice(firstNewline + 1).trim() : "";

        return (
          <div
            key={i}
            className="p-4 rounded-xl bg-gradient-to-br from-green-50/60 to-emerald-50/40 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-900"
          >
            <p className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">
              {title}
            </p>
            {body && (
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {body}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
