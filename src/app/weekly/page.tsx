import Link from "next/link";
import { getWeeklyLogs, getPastWeeklyReports } from "@/app/actions";
import { calculateWeeklyGrade } from "@/lib/grade";
import WeeklyReportClient from "@/app/weekly/WeeklyReportClient";
import type { Grade } from "@/types/recovery";

export const dynamic = "force-dynamic";

export default async function WeeklyPage() {
  const [logs, pastReports] = await Promise.all([
    getWeeklyLogs(),
    getPastWeeklyReports(8),
  ]);

  const gradeData = calculateWeeklyGrade(logs);
  const bingeCount = logs.reduce((acc, l) => acc + l.meals.filter((m) => m.is_binge).length, 0);
  const avgMood = logs.length > 0
    ? (logs.reduce((acc, l) => acc + l.mood, 0) / logs.length).toFixed(1)
    : "0";
  const avgStress = logs.length > 0
    ? (logs.reduce((acc, l) => acc + l.stress_level, 0) / logs.length).toFixed(1)
    : "0";
  const sleepLogs = logs.filter((l) => l.sleep_hours != null);
  const avgSleep = sleepLogs.length > 0
    ? (sleepLogs.reduce((acc, l) => acc + (l.sleep_hours ?? 0), 0) / sleepLogs.length).toFixed(1)
    : null;
  const totalMeals = logs.reduce((acc, l) => acc + l.meals.length, 0);

  const latestReport = pastReports[0] ?? null;

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">←</Link>
          <div>
            <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">📊 주간 리포트</h1>
            <p className="text-xs text-stone-400 mt-0.5">최근 7일 식습관 학점 평가</p>
          </div>
        </div>

        {logs.length < 3 ? (
          <div className="organic-card p-8 text-center">
            <span className="text-4xl block mb-3">📝</span>
            <p className="text-stone-600 dark:text-stone-400 text-sm mb-1">
              주간 리포트를 받으려면 최소 3일 이상 기록이 필요해요
            </p>
            <p className="text-xs text-stone-400 mb-4">현재 {logs.length}일 기록됨</p>
            <Link href="/" className="text-sm text-green-700 hover:text-green-800 dark:text-green-400">
              오늘 기록하러 가기 →
            </Link>
          </div>
        ) : (
          <>
            {/* 학점 카드 */}
            <div className={`rounded-2xl overflow-hidden shadow-sm border ${gradeColor(gradeData.grade).border}`}>
              <div className={`px-5 py-6 ${gradeColor(gradeData.grade).bg}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
                      이번 주 식습관 학점
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-black text-white">
                        {gradeData.grade}
                      </span>
                      <span className="text-2xl font-bold text-white/80">
                        {gradeData.score}점
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mt-1">
                      {gradeComment(gradeData.grade)}
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">🎓</div>
                </div>
              </div>

              {/* 점수 세부 항목 */}
              <div className="bg-white/80 dark:bg-stone-800/80 px-5 py-4 space-y-2.5">
                <ScoreBar label="폭식 억제" score={gradeData.binge_score} max={35} color="green" />
                <ScoreBar label="식사 규칙성" score={gradeData.meal_score} max={25} color="blue" />
                <ScoreBar label="기분 관리" score={gradeData.mood_score} max={15} color="purple" />
                <ScoreBar label="수면 관리" score={gradeData.sleep_score} max={15} color="indigo" />
                <ScoreBar label="스트레스" score={gradeData.stress_score} max={10} color="amber" />
              </div>
            </div>

            {/* 이번 주 통계 */}
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="폭식 에피소드" value={`${bingeCount}회`} warn={bingeCount > 0} />
              <MiniStat label="총 식사 기록" value={`${totalMeals}끼`} sub={`하루 평균 ${(totalMeals / logs.length).toFixed(1)}끼`} />
              <MiniStat label="평균 기분" value={`${avgMood}/5`} />
              <MiniStat label="평균 스트레스" value={`${avgStress}/5`} warn={Number(avgStress) >= 4} />
              {avgSleep && <MiniStat label="평균 수면" value={`${avgSleep}h`} warn={Number(avgSleep) < 7} />}
              <MiniStat label="기록 일수" value={`${logs.length}일`} sub="7일 중" />
            </div>

            {/* AI 교수 평가 */}
            <WeeklyReportClient
              gradeData={gradeData}
              existingReport={latestReport}
              hasEnoughData={logs.length >= 3}
            />

            {/* 학점 기준 */}
            <div className="organic-card p-5">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">학점 기준표</h3>
              <div className="grid grid-cols-4 gap-2">
                {GRADE_CRITERIA.map((g) => (
                  <div
                    key={g.grade}
                    className={`text-center p-2 rounded-xl border ${
                      gradeData.grade === g.grade
                        ? gradeColor(g.grade as Grade).border + " " + gradeColor(g.grade as Grade).bg.replace("from-", "from-").replace("to-", "to-") + " text-white"
                        : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    }`}
                  >
                    <p className={`text-sm font-bold ${gradeData.grade === g.grade ? "text-white" : gradeColor(g.grade as Grade).text}`}>
                      {g.grade}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{g.range}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 과거 학점 이력 */}
            {pastReports.length > 0 && (
              <div className="organic-card p-5">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">📈 학점 이력</h3>
                <div className="space-y-2">
                  {pastReports.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 py-2 border-b border-stone-100 dark:border-stone-700 last:border-0">
                      <span className={`text-lg font-black w-10 ${gradeColor(r.grade as Grade).text}`}>
                        {r.grade}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${gradeColor(r.grade as Grade).bar}`}
                              style={{ width: `${r.grade_score}%` }}
                            />
                          </div>
                          <span className="text-xs text-stone-500 w-8 text-right">{r.grade_score}점</span>
                        </div>
                      </div>
                      <span className="text-xs text-stone-400 shrink-0">
                        {r.week_start.slice(5).replace("-", "/")} ~
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .organic-card {
          background: rgba(253, 250, 245, 0.85);
          border: 1px solid #E0D8CC;
          border-radius: 1.25rem;
          box-shadow: 0 1px 3px rgba(58,46,38,0.06), 0 4px 16px rgba(58,46,38,0.04);
          backdrop-filter: blur(8px);
        }
        @media (prefers-color-scheme: dark) {
          .organic-card { background: rgba(37,32,24,0.85); border-color: #3A3020; }
        }
      `}</style>
    </main>
  );
}

/* ── 서브 컴포넌트들 ─────────────────────────────────────────────── */

function ScoreBar({ label, score, max, color }: { label: string; score: number | null; max: number; color: string }) {
  const val = score ?? 0;
  const pct = Math.round((val / max) * 100);
  const colorMap: Record<string, string> = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
  };
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-stone-500 dark:text-stone-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${colorMap[color] ?? "bg-green-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 w-12 text-right">
        {val}/{max}
      </span>
    </div>
  );
}

function MiniStat({ label, value, sub, warn = false }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className={`organic-card p-4 ${warn ? "border-amber-200 dark:border-amber-800" : ""}`}>
      <p className="text-xs text-stone-400">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${warn ? "text-amber-600 dark:text-amber-400" : "text-stone-800 dark:text-stone-100"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-stone-400">{sub}</p>}
    </div>
  );
}

/* ── 학점 헬퍼 ──────────────────────────────────────────────────── */

const GRADE_CRITERIA = [
  { grade: "A+", range: "90~100" },
  { grade: "A",  range: "80~89" },
  { grade: "B+", range: "70~79" },
  { grade: "B",  range: "60~69" },
  { grade: "C+", range: "50~59" },
  { grade: "C",  range: "40~49" },
  { grade: "D",  range: "30~39" },
  { grade: "F",  range: "~29" },
];

function gradeColor(grade: Grade) {
  if (grade === "A+" || grade === "A") return {
    bg: "bg-gradient-to-r from-emerald-600 to-green-600",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  };
  if (grade === "B+" || grade === "B") return {
    bg: "bg-gradient-to-r from-blue-600 to-sky-600",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
  };
  if (grade === "C+" || grade === "C") return {
    bg: "bg-gradient-to-r from-amber-500 to-orange-500",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  };
  return {
    bg: "bg-gradient-to-r from-red-500 to-rose-600",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-600 dark:text-red-400",
    bar: "bg-red-500",
  };
}

function gradeComment(grade: Grade): string {
  const map: Record<Grade, string> = {
    "A+": "완벽에 가까운 한 주였습니다! 이 패턴을 유지하세요",
    "A":  "매우 우수한 식습관을 보여준 한 주입니다",
    "B+": "좋은 노력이 보이는 한 주였어요. 조금만 더!",
    "B":  "전반적으로 양호했지만 개선 여지가 있습니다",
    "C+": "보통 수준입니다. 몇 가지 습관을 바꿔보세요",
    "C":  "개선이 필요합니다. 작은 변화부터 시작해요",
    "D":  "이번 주는 힘들었군요. 다음 주를 기대해요",
    "F":  "새로 시작하는 마음으로. 기록이 첫걸음이에요",
  };
  return map[grade];
}
