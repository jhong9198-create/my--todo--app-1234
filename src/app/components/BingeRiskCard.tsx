"use client";

import PremiumGate from "./PremiumGate";
import type { DailyLog, Meal } from "@/types/recovery";

interface Props {
  log: DailyLog | null;
  meals: Meal[];
  recentLogs: (DailyLog & { meals: Meal[] })[];
}

type RiskLevel = "낮음" | "보통" | "높음";

function calcRisk(log: DailyLog, recentLogs: (DailyLog & { meals: Meal[] })[]) {
  let score = 0;
  const factors: string[] = [];

  if (log.stress_level >= 4) {
    score += 30;
    factors.push(`스트레스 ${log.stress_level}/5 — 코르티솔 증가로 식욕 촉진`);
  } else if (log.stress_level === 3) {
    score += 10;
  }

  if (log.sleep_hours !== null && log.sleep_hours < 6) {
    score += 25;
    factors.push(`수면 ${log.sleep_hours}시간 — 그렐린(식욕) 호르몬 불안정`);
  } else if (log.sleep_hours !== null && log.sleep_hours < 7) {
    score += 12;
  }

  if (log.mood <= 2) {
    score += 20;
    factors.push(`기분 ${log.mood}/5 — 감정적 식욕 주의 구간`);
  } else if (log.mood === 3) {
    score += 6;
  }

  const recent7 = recentLogs.slice(0, 7);
  const recentBinge = recent7.reduce((a, l) => a + l.meals.filter((m) => m.is_binge).length, 0);
  if (recentBinge >= 5) {
    score += 25;
    factors.push(`최근 7일 폭식 ${recentBinge}회 — 반복 패턴 감지`);
  } else if (recentBinge >= 3) {
    score += 12;
    factors.push(`최근 7일 폭식 ${recentBinge}회`);
  }

  return { score: Math.min(100, score), factors };
}

const RISK_CONFIG: Record<RiskLevel, {
  color: string; bg: string; border: string; bar: string; icon: string; advice: string;
}> = {
  높음: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50/80 dark:bg-red-900/15",
    border: "border-red-200 dark:border-red-800/60",
    bar: "bg-gradient-to-r from-red-400 to-rose-500",
    icon: "⚠️",
    advice: "오늘 저녁 폭식 충동이 올 때, 먼저 물 한 잔 + 4-7-8 호흡(4초 들이쉬고, 7초 참고, 8초 내쉬기)을 해보세요. 건강한 간식을 미리 준비해두면 도움이 돼요.",
  },
  보통: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50/80 dark:bg-amber-900/15",
    border: "border-amber-200 dark:border-amber-800/60",
    bar: "bg-gradient-to-r from-amber-400 to-orange-400",
    icon: "🌤",
    advice: "저녁 식사 전에 물 한 잔 마시고, 천천히 충분히 채워먹는 한 끼를 준비해보세요. 규칙적인 식사가 충동을 줄여줘요.",
  },
  낮음: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50/80 dark:bg-emerald-900/15",
    border: "border-emerald-200 dark:border-emerald-800/60",
    bar: "bg-gradient-to-r from-emerald-400 to-teal-400",
    icon: "🌿",
    advice: "오늘은 컨디션이 좋아요. 규칙적인 식사 시간을 유지하고, 이 좋은 상태를 기억해두세요.",
  },
};

export default function BingeRiskCard({ log, meals, recentLogs }: Props) {
  const preview = (
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">⚡</span>
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">오늘 폭식 위험도</h3>
        <span className="ml-auto text-sm font-bold text-amber-500">보통</span>
      </div>
      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-amber-400 rounded-full" />
      </div>
      <p className="text-xs text-stone-500">스트레스·수면·기분 데이터로 오늘의 폭식 가능성을 미리 파악해요.</p>
    </div>
  );

  return (
    <PremiumGate feature="폭식 위험 예측" description="스트레스·수면·기분으로 오늘 폭식 가능성을 미리 파악하고 예방해요">
      {!log ? (
        preview
      ) : (() => {
        const { score, factors } = calcRisk(log, recentLogs);
        const level: RiskLevel = score >= 55 ? "높음" : score >= 25 ? "보통" : "낮음";
        const cfg = RISK_CONFIG[level];

        return (
          <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{cfg.icon}</span>
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">오늘 폭식 위험도</h3>
              </div>
              <span className={`text-sm font-bold ${cfg.color}`}>{level}</span>
            </div>

            {/* 위험도 바 */}
            <div className="h-2.5 bg-stone-200/60 dark:bg-stone-700/60 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full ${cfg.bar} rounded-full`}
                style={{ width: `${score}%`, transition: "width 0.8s ease" }}
              />
            </div>

            {/* 위험 요인 */}
            {factors.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-xs ${cfg.color} shrink-0 mt-0.5 font-bold`}>•</span>
                    <span className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 대처 조언 */}
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed pt-3 border-t border-stone-200/60 dark:border-stone-700/40">
              {cfg.advice}
            </p>
          </div>
        );
      })()}
    </PremiumGate>
  );
}
