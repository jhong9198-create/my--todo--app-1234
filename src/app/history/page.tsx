import Link from "next/link";
import { getRecentLogs } from "@/app/actions";
import { MOOD_EMOJI } from "@/types/recovery";

export default async function HistoryPage() {
  const logs = await getRecentLogs(30);

  return (
    <main className="min-h-screen bg-rose-50/30 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            지난 기록
          </h1>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 dark:text-gray-600 text-sm">
              아직 기록이 없습니다
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm text-rose-400 hover:text-rose-500"
            >
              오늘 기록 시작하기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const bingeCount = log.meals.filter((m) => m.is_binge).length;
              const dateObj = new Date(log.date + "T00:00:00");
              const dateStr = dateObj.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
              });

              return (
                <div
                  key={log.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {dateStr}
                    </span>
                    <div className="flex items-center gap-2">
                      {bingeCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500">
                          폭식 {bingeCount}회
                        </span>
                      )}
                      <span className="text-xl">
                        {MOOD_EMOJI[log.mood]}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>수면 {log.sleep_hours ?? "-"}h</span>
                    <span>스트레스 {log.stress_level}/5</span>
                    <span>식사 {log.meals.length}회</span>
                  </div>

                  {log.meals.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {log.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          <span className="font-mono text-gray-400">
                            {meal.meal_time.slice(0, 5)}
                          </span>
                          <span className="truncate">{meal.food_items}</span>
                          {meal.location && (
                            <span className="shrink-0 text-gray-400">
                              {meal.location}
                            </span>
                          )}
                          {meal.is_binge && (
                            <span className="shrink-0 text-red-400">폭식</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-2">
                      {log.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
