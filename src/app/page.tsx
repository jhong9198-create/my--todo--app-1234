import Link from "next/link";
import { getTodayLog, getAIAnalysis, getWeightHistory, getRecentLogs } from "@/app/actions";
import HomeTabs from "@/app/components/HomeTabs";
import MotivationBubble from "@/app/components/MotivationBubble";
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
      <div className="max-w-lg mx-auto space-y-6">

        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {["감정", "식습관", "회복", "패턴"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-stone-500 dark:text-stone-400 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(160,140,115,0.22)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-stone-400 dark:text-stone-500 tracking-wide pl-0.5">기록 서비스</p>
            <p className="text-[11px] text-stone-300 dark:text-stone-600 pl-0.5">{today}</p>
          </div>

          <nav className="flex gap-2 pt-1 shrink-0">
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
        </div>

        {/* 첫 화면 — 오늘 당신의 상태는 어떤가요? */}
        <div
          className="rounded-3xl px-7 py-8 flex flex-col gap-3"
          style={{
            background: "rgba(255,252,247,0.72)",
            border: "1px solid rgba(175,155,130,0.22)",
            boxShadow: "0 1px 3px rgba(60,40,20,0.04), 0 4px 20px rgba(60,40,20,0.05)",
          }}
        >
          <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-[0.18em]">
            {today}
          </p>
          <h2
            className="text-[22px] font-semibold text-stone-700 dark:text-stone-200 leading-snug"
            style={{ letterSpacing: "-0.01em" }}
          >
            오늘 당신의 상태는<br />어떤가요?
          </h2>
          <p className="text-sm text-stone-400 dark:text-stone-500 leading-relaxed">
            {log
              ? "오늘도 기록해줘서 고마워요. 당신의 하루를 함께 살펴볼게요."
              : "작은 기록 하나가 나를 이해하는 시작이에요."}
          </p>
          {!log && (
            <div className="mt-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
              <p className="text-xs text-stone-400 dark:text-stone-500">아래 탭에서 오늘 상태를 기록해보세요</p>
            </div>
          )}
        </div>

        {/* 4탭 홈 */}
        <HomeTabs
          log={log}
          meals={meals}
          analysis={analysis}
          weightHistory={weightHistory}
          recentLogs={recentLogs}
        />

        {/* 마지막 화면 — 오늘도 당신의 곁에서 */}
        <div
          className="rounded-3xl px-7 py-10 flex flex-col items-center gap-4 text-center"
          style={{
            background: "linear-gradient(160deg, rgba(245,240,232,0.80) 0%, rgba(235,230,220,0.80) 100%)",
            border: "1px solid rgba(175,155,130,0.20)",
          }}
        >
          {/* 잎새 */}
          <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-40" aria-hidden="true">
            <path d="M24 42 C24 42 10 30 12 18 C14 7 24 7 24 7 C24 7 34 7 36 18 C38 30 24 42 24 42Z" fill="#5a7a52"/>
            <path d="M24 42 L24 7" stroke="#4a6641" strokeWidth="1.2" fill="none" opacity="0.6"/>
            <path d="M24 28 C17 25 14 18 16 13" stroke="#4a6641" strokeWidth="0.9" fill="none" opacity="0.5"/>
            <path d="M24 34 C31 30 34 23 32 17" stroke="#4a6641" strokeWidth="0.9" fill="none" opacity="0.5"/>
          </svg>

          <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold text-stone-600 dark:text-stone-300 tracking-wide">
              오늘도 당신의 곁에서
            </p>
            <p className="text-sm text-stone-400 dark:text-stone-500 leading-relaxed max-w-[240px]">
              무너진 날도, 괜찮은 날도<br />기록이 쌓일수록 나를 더 알게 돼요
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="h-px w-12 bg-stone-300/60 dark:bg-stone-600/40" />
            <span className="text-[10px] text-stone-300 dark:text-stone-600 tracking-widest uppercase">곁</span>
            <div className="h-px w-12 bg-stone-300/60 dark:bg-stone-600/40" />
          </div>
        </div>

        <div className="h-6" />
      </div>

      <MotivationBubble />
    </main>
  );
}
