"use client";

import { useState, useTransition } from "react";
import { getRecoveryRoutine } from "@/app/ai-actions";

interface RoutineData {
  sleep: string | null;
  exercise: string | null;
  meal: string | null;
  message: string | null;
}

const SECTIONS = [
  { key: "sleep",    emoji: "🌙", label: "수면 회복 루틴",  color: "from-indigo-500 to-violet-500" },
  { key: "exercise", emoji: "🌿", label: "저강도 운동 루틴", color: "from-green-500 to-emerald-500" },
  { key: "meal",     emoji: "🥗", label: "현실 식단 제안",   color: "from-amber-500 to-orange-500" },
] as const;

export default function RecoveryRoutineCard() {
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState<string>("sleep");

  function handleGenerate() {
    startTransition(async () => {
      const raw = await getRecoveryRoutine();
      try {
        setRoutine(JSON.parse(raw));
        setActiveSection("sleep");
      } catch {
        setRoutine(null);
      }
    });
  }

  if (!routine) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          최근 7일 데이터를 분석해 <span className="text-green-700 dark:text-green-400 font-medium">수면 회복 · 저강도 운동 · 현실 식단</span>을 맞춤 제안해드려요.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-sm"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              AI가 루틴을 만드는 중...
            </span>
          ) : "🌿 맞춤 회복 루틴 받기"}
        </button>
      </div>
    );
  }

  const currentSection = SECTIONS.find(s => s.key === activeSection);
  const currentText = routine[activeSection as keyof RoutineData];

  return (
    <div className="space-y-3">
      {/* 탭 */}
      <div className="flex gap-1">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSection === s.key
                ? `bg-gradient-to-r ${s.color} text-white shadow-sm`
                : "bg-stone-100/80 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400 hover:bg-stone-200/80 dark:hover:bg-stone-600/60"
            }`}
          >
            {s.emoji} {s.label.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* 내용 */}
      {currentSection && currentText && (
        <div className={`rounded-xl bg-gradient-to-br ${currentSection.color} p-0.5 shadow-sm`}>
          <div className="bg-white/90 dark:bg-stone-900/90 rounded-[11px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{currentSection.emoji}</span>
              <h4 className="text-sm font-bold text-stone-700 dark:text-stone-200">{currentSection.label}</h4>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
              {currentText}
            </p>
          </div>
        </div>
      )}

      {/* 회복 메시지 */}
      {routine.message && (
        <div className="bg-green-50/80 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
          <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
            🌱 {routine.message}
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isPending}
        className="text-xs text-stone-400 hover:text-green-600 transition-colors underline underline-offset-2"
      >
        {isPending ? "생성 중..." : "루틴 새로 받기"}
      </button>
    </div>
  );
}
