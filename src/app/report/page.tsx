import Link from "next/link";
import { getRecentLogs } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { MOOD_EMOJI } from "@/types/recovery";

export default async function ReportPage() {
  const logs = await getRecentLogs(14);
  const supabase = await createClient();

  const logIds = logs.map((l) => l.id);
  const { data: analyses } =
    logIds.length > 0
      ? await supabase
          .from("ai_analyses")
          .select("*")
          .in("log_id", logIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const totalDays = logs.length;
  const bingeEpisodes = logs.reduce(
    (acc, l) => acc + l.meals.filter((m) => m.is_binge).length,
    0
  );
  const avgMood =
    totalDays > 0
      ? logs.reduce((acc, l) => acc + l.mood, 0) / totalDays
      : 0;
  const avgStress =
    totalDays > 0
      ? logs.reduce((acc, l) => acc + l.stress_level, 0) / totalDays
      : 0;
  const avgSleep =
    logs.filter((l) => l.sleep_hours != null).length > 0
      ? logs
          .filter((l) => l.sleep_hours != null)
          .reduce((acc, l) => acc + (l.sleep_hours ?? 0), 0) /
        logs.filter((l) => l.sleep_hours != null).length
      : 0;

  const bingeDays = logs.filter((l) => l.meals.some((m) => m.is_binge));
  const bingeByLocation = bingeDays
    .flatMap((l) => l.meals.filter((m) => m.is_binge))
    .reduce<Record<string, number>>((acc, m) => {
      const loc = m.location ?? "미기록";
      acc[loc] = (acc[loc] ?? 0) + 1;
      return acc;
    }, {});

  const moodTrend = logs
    .slice()
    .reverse()
    .map((l) => l.mood);

  const latestAnalysis = analyses?.[0];

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
            14일 패턴 리포트
          </h1>
        </div>

        {totalDays === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              기록이 부족합니다. 더 많이 기록해 주세요!
            </p>
          </div>
        ) : (
          <>
            {/* 통계 요약 */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="기록 일수"
                value={`${totalDays}일`}
                sub="최근 14일"
              />
              <StatCard
                label="평균 기분"
                value={`${MOOD_EMOJI[Math.round(avgMood) as 1 | 2 | 3 | 4 | 5]} ${avgMood.toFixed(1)}`}
                sub="/5"
              />
              <StatCard
                label="평균 수면"
                value={avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : "-"}
                sub="권장 7-9h"
                warn={avgSleep > 0 && (avgSleep < 7 || avgSleep > 9)}
              />
              <StatCard
                label="평균 스트레스"
                value={avgStress.toFixed(1)}
                sub="/5"
                warn={avgStress >= 4}
              />
              <StatCard
                label="폭식 에피소드"
                value={`${bingeEpisodes}회`}
                sub={`${totalDays}일 중`}
                warn={bingeEpisodes > 0}
              />
              <StatCard
                label="기록 달성률"
                value={`${Math.round((totalDays / 14) * 100)}%`}
                sub="14일 기준"
              />
            </div>

            {/* 기분 트렌드 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                기분 트렌드
              </h2>
              <div className="flex items-end gap-1 h-16">
                {moodTrend.map((mood, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-rose-300 dark:bg-rose-600 transition-all"
                      style={{ height: `${(mood / 5) * 100}%` }}
                    />
                    <span className="text-[9px] text-gray-400">{MOOD_EMOJI[mood as 1|2|3|4|5]}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{totalDays}일 전</span>
                <span>오늘</span>
              </div>
            </div>

            {/* 폭식 장소 분석 */}
            {Object.keys(bingeByLocation).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  폭식 발생 장소
                </h2>
                <div className="space-y-2">
                  {Object.entries(bingeByLocation)
                    .sort((a, b) => b[1] - a[1])
                    .map(([loc, count]) => (
                      <div key={loc} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-16 shrink-0">
                          {loc}
                        </span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-red-400 h-2 rounded-full transition-all"
                            style={{
                              width: `${(count / bingeEpisodes) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6 text-right">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* AI 패턴 리포트 */}
            {latestAnalysis && (
              <div className="bg-gradient-to-br from-violet-50 to-rose-50 dark:from-violet-900/20 dark:to-rose-900/20 rounded-2xl p-5 border border-violet-100 dark:border-violet-800">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                  <span>✨</span> AI 패턴 리포트
                </h2>
                {latestAnalysis.pattern_report && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {latestAnalysis.pattern_report}
                  </p>
                )}
                {latestAnalysis.binge_triggers && (
                  <div className="mt-3 pt-3 border-t border-violet-100 dark:border-violet-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      폭식 트리거
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {latestAnalysis.binge_triggers}
                    </p>
                  </div>
                )}
                {latestAnalysis.tomorrow_routine && (
                  <div className="mt-3 pt-3 border-t border-violet-100 dark:border-violet-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      추천 루틴
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {latestAnalysis.tomorrow_routine}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!latestAnalysis && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">
                  오늘 AI 분석을 실행하면 리포트가 여기 표시됩니다
                </p>
                <Link
                  href="/"
                  className="text-sm text-rose-400 hover:text-rose-500"
                >
                  오늘 기록으로 →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
  warn = false,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        warn
          ? "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800"
          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
      }`}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-xl font-bold mt-1 ${
          warn
            ? "text-amber-600 dark:text-amber-400"
            : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
      )}
    </div>
  );
}
