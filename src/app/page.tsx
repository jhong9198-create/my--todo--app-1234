import Link from "next/link";
import { getTodayLog, getAIAnalysis, getWeightHistory } from "@/app/actions";
import DailyLogForm from "@/app/components/DailyLogForm";
import MealForm from "@/app/components/MealForm";
import MealList from "@/app/components/MealList";
import AIAnalysisPanel from "@/app/components/AIAnalysisPanel";
import BingeMentoringCard from "@/app/components/BingeMentoringCard";
import NutritionCoachPanel from "@/app/components/NutritionCoachPanel";
import WeightGraph from "@/app/components/WeightGraph";
import { MOOD_EMOJI } from "@/types/recovery";

export default async function Home() {
  const [{ log, meals }, weightHistory] = await Promise.all([
    getTodayLog(),
    getWeightHistory(30),
  ]);
  const analysis = log ? await getAIAnalysis(log.id) : null;

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const bingeMeals = meals.filter((m) => m.is_binge);
  const latestBinge = bingeMeals.at(-1) ?? null;

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
              🌿 행동변화 코치
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              {today}
            </p>
          </div>
          <nav className="flex gap-2">
            <Link
              href="/history"
              className="px-3 py-1.5 text-xs rounded-full bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-green-400 hover:text-green-700 dark:hover:text-green-400 transition-all backdrop-blur-sm"
            >
              기록
            </Link>
            <Link
              href="/weekly"
              className="px-3 py-1.5 text-xs rounded-full bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-green-400 hover:text-green-700 dark:hover:text-green-400 transition-all backdrop-blur-sm"
            >
              주간리포트
            </Link>
            <Link
              href="/report"
              className="px-3 py-1.5 text-xs rounded-full bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-green-400 hover:text-green-700 dark:hover:text-green-400 transition-all backdrop-blur-sm"
            >
              리포트
            </Link>
          </nav>
        </div>

        {/* 오늘 요약 카드 */}
        {log && (
          <div className="grid grid-cols-4 gap-2">
            <StatMini
              label="기분"
              value={<span className="text-2xl">{MOOD_EMOJI[log.mood]}</span>}
            />
            <StatMini
              label="수면"
              value={
                <span className="text-xl font-bold text-stone-700 dark:text-stone-200">
                  {log.sleep_hours ?? "-"}
                </span>
              }
              sub="시간"
            />
            <StatMini
              label="스트레스"
              value={
                <span className={`text-xl font-bold ${log.stress_level >= 4 ? "text-amber-700 dark:text-amber-400" : "text-stone-700 dark:text-stone-200"}`}>
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

        {/* 행동변화 코칭 카드 */}
        {log && bingeMeals.length > 0 && (
          <BingeMentoringCard
            logId={log.id}
            bingeCount={bingeMeals.length}
            latestBingeMeal={
              latestBinge
                ? {
                    food_items: latestBinge.food_items,
                    emotional_state: latestBinge.emotional_state,
                  }
                : null
            }
          />
        )}

        {/* 오늘 상태 체크인 */}
        <section className="organic-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🌱</span>
            <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
              오늘 상태 체크인
            </h2>
          </div>
          <DailyLogForm existing={log} />
        </section>

        {/* 식사 & 행동 기록 */}
        <section className="organic-card overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-stone-100 dark:border-stone-700/50">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base">🍃</span>
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                식사 & 행동 기록
                {bingeMeals.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    폭식 {bingeMeals.length}회
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 pl-6">
              먹기 전 신호와 감정을 함께 기록하세요
            </p>
          </div>

          <div className="p-5">
            {log ? (
              <div className="space-y-3">
                <MealList meals={meals} />
                <MealForm />
              </div>
            ) : (
              <p className="text-sm text-stone-400 text-center py-4">
                상태 체크인을 먼저 저장하면 식사 기록을 할 수 있어요
              </p>
            )}
          </div>
        </section>

        {/* 영양 코칭 — 살찌는 요인 · 대체 음식 · 식습관 멘토링 */}
        {log && (
          <section className="organic-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🌾</span>
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
                영양 코칭
              </h2>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-4 pl-6">
              살찌는 요인 분석 · 대체 음식 추천 · 올바른 식습관 교정
            </p>
            <NutritionCoachPanel logId={log.id} existing={analysis} />
          </section>
        )}

        {/* 체중 그래프 */}
        <section className="organic-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">⚖️</span>
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
                체중 변화
              </h2>
            </div>
            {weightHistory.length > 0 && (
              <span className="text-xs text-stone-400">{weightHistory.length}일 기록</span>
            )}
          </div>
          <WeightGraph data={weightHistory} />
        </section>

        {/* AI 행동 코칭 */}
        {log && (
          <section className="organic-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🧠</span>
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
                AI 행동 코칭
              </h2>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-4 pl-6">
              오늘 데이터를 바탕으로 개인화된 코칭을 받아보세요
            </p>
            <AIAnalysisPanel logId={log.id} existing={analysis} />
          </section>
        )}

      </div>

      <style>{`
        .organic-card {
          background: rgba(253, 250, 245, 0.85);
          border: 1px solid #E0D8CC;
          border-radius: 1.25rem;
          box-shadow: 0 1px 3px rgba(58, 46, 38, 0.06), 0 4px 16px rgba(58, 46, 38, 0.04);
          backdrop-filter: blur(8px);
        }
        @media (prefers-color-scheme: dark) {
          .organic-card {
            background: rgba(37, 32, 24, 0.85);
            border-color: #3A3020;
          }
        }
      `}</style>
    </main>
  );
}

function StatMini({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
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
