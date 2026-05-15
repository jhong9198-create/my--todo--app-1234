import Link from "next/link";
import { getTodayLog, getAIAnalysis, getWeightHistory, getRecentLogs } from "@/app/actions";
import HomeTabs from "@/app/components/HomeTabs";
import MotivationBubble from "@/app/components/MotivationBubble";
import CalligraphyLogo from "@/app/components/CalligraphyLogo";
import type { AIAnalysis } from "@/types/recovery";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ log, meals }, weightHistory, recentLogs] = await Promise.all([
    getTodayLog(),
    getWeightHistory(30),
    getRecentLogs(14),
  ]);
  const analysis = log ? (await getAIAnalysis(log.id) as AIAnalysis | null) : null;

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* 캘리그라피 로고 헤더 */}
        <CalligraphyLogo />

        {/* 날짜 + 네비 */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-stone-500 dark:text-stone-400">{today}</p>
          <nav className="flex gap-1.5">
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
          </nav>
        </div>

        {/* 4탭 홈 */}
        <HomeTabs
          log={log}
          meals={meals}
          analysis={analysis}
          weightHistory={weightHistory}
          recentLogs={recentLogs}
        />
      </div>

      <MotivationBubble />
    </main>
  );
}
