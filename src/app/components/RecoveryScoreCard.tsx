"use client";

import type { DailyLog, Meal } from "@/types/recovery";

interface Props {
  log: DailyLog | null;
  meals: Meal[];
  streak: number;
}

function calcScore(log: DailyLog, bingeCount: number) {
  const sleepScore = log.sleep_hours
    ? Math.min(28, Math.round((log.sleep_hours / 7.5) * 28))
    : 14;
  const moodScore = Math.round((log.mood / 5) * 24);
  const stressScore = Math.round(((5 - log.stress_level) / 4) * 24);
  const bingeScore = bingeCount === 0 ? 24 : Math.max(0, 24 - bingeCount * 8);
  return Math.min(100, sleepScore + moodScore + stressScore + bingeScore);
}

function getLabel(score: number): { text: string; sub: string; color: string; accent: string; icon: string } {
  if (score >= 80) return { text: "몸이 충분히 쉬었어요", sub: "오늘 나를 잘 돌봤어요", color: "text-emerald-600 dark:text-emerald-400", accent: "#10b981", icon: "🌿" };
  if (score >= 60) return { text: "괜찮은 하루를 보내고 있어요", sub: "작은 것들이 쌓이고 있어요", color: "text-sky-600 dark:text-sky-400", accent: "#38bdf8", icon: "🌤" };
  if (score >= 40) return { text: "몸이 쉬고 싶어해요", sub: "그래도 여기까지 왔어요", color: "text-amber-600 dark:text-amber-400", accent: "#f59e0b", icon: "🍂" };
  return { text: "지금 쉬어가도 충분해요", sub: "힘든 날도 회복의 일부예요", color: "text-stone-500 dark:text-stone-400", accent: "#a8a29e", icon: "🌙" };
}

const FACTORS = [
  { key: "sleep",   label: "수면",    barColor: "bg-sky-400" },
  { key: "mood",    label: "기분",    barColor: "bg-emerald-400" },
  { key: "stress",  label: "안정",    barColor: "bg-violet-400" },
] as const;

export default function RecoveryScoreCard({ log, meals, streak }: Props) {
  if (!log) return null;

  const bingeCount = meals.filter((m) => m.is_binge).length;
  const score = calcScore(log, bingeCount);
  const label = getLabel(score);

  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const bars = [
    { key: "sleep",  label: "수면",  barColor: "bg-sky-400",    val: log.sleep_hours ? Math.min(100, Math.round((log.sleep_hours / 7.5) * 100)) : 50 },
    { key: "mood",   label: "기분",  barColor: "bg-emerald-400", val: Math.round((log.mood / 5) * 100) },
    { key: "stress", label: "안정",  barColor: "bg-violet-400",  val: Math.round(((5 - log.stress_level) / 4) * 100) },
  ];

  return (
    <div className="organic-card p-5">
      <div className="flex items-center gap-4">
        {/* 링 차트 */}
        <div className="relative shrink-0 w-[88px] h-[88px]">
          <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
            <circle cx="44" cy="44" r={r} strokeWidth="6" fill="none" stroke="rgba(0,0,0,0.06)" />
            <circle
              cx="44" cy="44" r={r}
              strokeWidth="6"
              fill="none"
              stroke={label.accent}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1.2s ease", opacity: 0.7 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[26px] leading-none">{label.icon}</span>
          </div>
        </div>

        {/* 우측 텍스트 + 바 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 tracking-wide">오늘 몸의 이야기</p>
            {streak >= 2 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                🌱 {streak}일째 함께예요
              </span>
            )}
          </div>
          <p className={`text-sm font-semibold ${label.color} leading-snug`}>{label.text}</p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-2">{label.sub}</p>

          <div className="space-y-1.5">
            {bars.map(({ key, label: lbl, barColor, val }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 w-8 shrink-0">{lbl}</span>
                <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full`}
                    style={{ width: `${val}%`, transition: "width 0.8s ease" }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 w-6 text-right shrink-0">{val}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
