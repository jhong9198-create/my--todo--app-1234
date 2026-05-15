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
    <main className="min-h-screen py-10 px-5">
      <div className="max-w-lg mx-auto space-y-7">

        {/* 헤더 — 로고 좌측 + 날짜/네비 우측 */}
        <div className="flex items-start justify-between gap-4">
          <CalligraphyLogo />

          <div className="flex flex-col items-end justify-between h-[112px] py-1">
            <nav className="flex gap-2">
              <Link
                href="/history"
                className="px-3.5 py-1.5 text-xs rounded-full text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(160,140,115,0.22)" }}
              >
                기록
              </Link>
              <Link
                href="/weekly"
                className="px-3.5 py-1.5 text-xs rounded-full text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(160,140,115,0.22)" }}
              >
                주간리포트
              </Link>
            </nav>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 tracking-wide">{today}</p>
          </div>
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
