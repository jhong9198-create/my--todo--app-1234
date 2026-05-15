import Link from "next/link";
import { getTodayLog, getAIAnalysis } from "@/app/actions";
import DailyLogForm from "@/app/components/DailyLogForm";
import MealForm from "@/app/components/MealForm";
import MealList from "@/app/components/MealList";
import AIAnalysisPanel from "@/app/components/AIAnalysisPanel";
import BingeMentoringCard from "@/app/components/BingeMentoringCard";
import { MOOD_EMOJI } from "@/types/recovery";

export default async function Home() {
  const { log, meals } = await getTodayLog();
  const analysis = log ? await getAIAnalysis(log.id) : null;

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const bingeMeals = meals.filter((m) => m.is_binge);
  const latestBinge = bingeMeals.at(-1) ?? null;

  return (
    <main className="min-h-screen bg-teal-50/30 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              행동변화 코치 🧠
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {today}
            </p>
          </div>
          <nav className="flex gap-2">
            <Link
              href="/history"
              className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal-300 transition-colors"
            >
              기록 보기
            </Link>
            <Link
              href="/report"
              className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal-300 transition-colors"
            >
              리포트
            </Link>
          </nav>
        </div>

        {/* 오늘 요약 카드 */}
        {log && (
          <div className="flex gap-3">
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
              <div className="text-2xl">{MOOD_EMOJI[log.mood]}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">기분</div>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {log.sleep_hours ?? "-"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">수면(h)</div>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-amber-500">
                {log.stress_level}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">스트레스</div>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
              <div className={`text-2xl font-bold ${bingeMeals.length > 0 ? "text-red-400" : "text-teal-500"}`}>
                {bingeMeals.length > 0 ? `${bingeMeals.length}⚠` : meals.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {bingeMeals.length > 0 ? "폭식" : "식사"}
              </div>
            </div>
          </div>
        )}

        {/* 행동변화 코칭 카드 — 폭식이 있을 때만 표시 */}
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

        {/* 오늘 상태 기록 */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
            오늘 상태 체크인
          </h2>
          <DailyLogForm existing={log} />
        </section>

        {/* 식사 기록 */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              식사 & 행동 기록
              {bingeMeals.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500">
                  폭식 {bingeMeals.length}회
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
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
              <p className="text-sm text-gray-400 text-center py-4">
                상태 체크인을 먼저 저장하면 식사 기록을 할 수 있어요
              </p>
            )}
          </div>
        </section>

        {/* AI 행동 코칭 */}
        {log && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
              AI 행동 코칭
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              오늘 데이터를 바탕으로 개인화된 코칭을 받아보세요
            </p>
            <AIAnalysisPanel logId={log.id} existing={analysis} />
          </section>
        )}

      </div>
    </main>
  );
}
