"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserType, USER_TYPE_DATA } from "@/types/diagnosis";

export default function MissionPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [completedDay, setCompletedDay] = useState(0);

  useEffect(() => {
    const type = localStorage.getItem("dd_type") as UserType | null;
    if (!type) { router.push("/diagnosis"); return; }
    setUserType(type);
    setCompletedDay(parseInt(localStorage.getItem("dd_day") || "0"));
  }, [router]);

  function markComplete(dayIdx: number) {
    const next = dayIdx + 1;
    localStorage.setItem("dd_day", String(next));
    setCompletedDay(next);
  }

  if (!userType) return null;
  const data = USER_TYPE_DATA[userType];

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-10 pb-16">
        <div className="max-w-md mx-auto">
          <Link href="/result" className="text-xs font-medium mb-6 block" style={{ color: "rgba(255,255,255,0.4)" }}>
            ← 결과로 돌아가기
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl">{data.emoji}</span>
            <div>
              <p className="text-xs font-bold tracking-widest" style={{ color: "var(--amber)" }}>
                {data.label}
              </p>
              <h1 className="text-xl font-black text-white">7일 실천 루틴</h1>
            </div>
          </div>
          {/* 진행바 */}
          <div>
            <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span>진행도</span>
              <span>{completedDay} / 7일 완료</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedDay / 7) * 100}%`, background: "var(--amber)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 미션 카드들 */}
      <div className="max-w-md mx-auto px-4 -mt-6 space-y-3">
        {data.mission.map((m, idx) => {
          const isDone = idx < completedDay;
          const isCurrent = idx === completedDay;
          const isLocked = idx > completedDay;

          return (
            <div
              key={m.day}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: isDone ? "#F0F9F0" : "white",
                border: isCurrent
                  ? "2px solid var(--amber)"
                  : isDone
                  ? "2px solid #86C98A"
                  : "2px solid transparent",
                opacity: isLocked ? 0.45 : 1,
                boxShadow: isCurrent ? "0 4px 20px rgba(212,168,83,0.18)" : "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-start gap-4">
                {/* 날짜 배지 */}
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                  style={{
                    background: isDone ? "#4CAF50" : isCurrent ? "var(--navy)" : "rgba(30,58,95,0.08)",
                    color: isDone || isCurrent ? "white" : "rgba(30,58,95,0.35)",
                  }}
                >
                  {isDone ? "✓" : m.day}
                </div>

                {/* 내용 */}
                <div className="flex-1">
                  <p
                    className="font-bold text-sm leading-snug"
                    style={{ color: isDone ? "#4CAF50" : isCurrent ? "var(--navy)" : "#999" }}
                  >
                    {m.day}일차 — {m.task}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{m.detail}</p>
                  )}
                  {isDone && (
                    <p className="text-xs mt-1" style={{ color: "#4CAF50" }}>완료!</p>
                  )}
                </div>

                {/* 완료 버튼 */}
                {isCurrent && (
                  <button
                    onClick={() => markComplete(idx)}
                    className="shrink-0 px-3 py-2 rounded-xl text-xs font-black"
                    style={{ background: "var(--amber)", color: "var(--navy)" }}
                  >
                    완료 ✓
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* 완료 메시지 */}
        {completedDay >= 7 && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "var(--navy)" }}
          >
            <div className="text-4xl mb-4">🎉</div>
            <p className="font-black text-white text-lg mb-2">7일 미션 완료!</p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              이번 주 루틴을 모두 마쳤어요.<br />
              다음 단계로 나아갈 준비가 됐습니다.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 rounded-xl text-sm font-black"
              style={{ background: "var(--amber)", color: "var(--navy)" }}
            >
              주간 분석 리포트 받기 →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
