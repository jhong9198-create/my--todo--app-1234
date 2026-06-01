"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserType, USER_TYPE_DATA } from "@/types/diagnosis";

export default function ResultPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const type = localStorage.getItem("dd_type") as UserType | null;
    if (!type) {
      router.push("/diagnosis");
      return;
    }
    const timer = setTimeout(() => {
      setUserType(type);
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "var(--navy)" }}
      >
        <div className="text-5xl animate-bounce">🔍</div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-2">패턴을 분석하고 있습니다</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>잠시만 기다려주세요...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: "var(--amber)",
                animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!userType) return null;
  const data = USER_TYPE_DATA[userType];

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 결과 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-12 pb-20 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            🔍 분석 완료
          </p>
          <div className="text-5xl mb-5">{data.emoji}</div>
          <div
            className="inline-block px-4 py-1.5 rounded-full mb-5"
            style={{ background: "var(--amber)" }}
          >
            <span className="text-sm font-black" style={{ color: "var(--navy)" }}>
              {data.label}
            </span>
          </div>
          <p className="text-white text-lg font-semibold leading-snug px-4">
            {data.headline}
          </p>
        </div>
      </div>

      {/* 카드 영역 */}
      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">

        {/* 핵심 원인 */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
            핵심 원인
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{data.core_problem}</p>
        </div>

        {/* 반복 패턴 */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
            반복되는 패턴
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{data.pattern}</p>
        </div>

        {/* 3가지 규칙 — 무료 */}
        <div className="rounded-2xl p-6" style={{ background: "var(--navy)" }}>
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>
            오늘부터 바꿔야 할 3가지 규칙
          </p>
          <div className="flex flex-col gap-4">
            {data.rules.map((rule, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: "var(--amber)", color: "var(--navy)" }}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-white leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7일 루틴 — 프리미엄 잠금 */}
        <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          {/* 블러 콘텐츠 */}
          <div className="bg-white p-6">
            <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>
              7일 맞춤 실천 루틴
            </p>
            <div className="flex flex-col gap-3 blur-sm select-none pointer-events-none">
              {data.mission.slice(0, 4).map((m) => (
                <div key={m.day} className="flex gap-3 items-start">
                  <span className="shrink-0 text-xs font-bold w-10" style={{ color: "var(--amber)" }}>
                    {m.day}일차
                  </span>
                  <p className="text-sm text-gray-700">{m.task}</p>
                </div>
              ))}
            </div>
          </div>
          {/* 잠금 오버레이 */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(245,237,216,0.88)", backdropFilter: "blur(2px)" }}
          >
            <div className="text-center px-6">
              <div className="text-3xl mb-3">🔒</div>
              <p className="font-black text-base mb-1" style={{ color: "var(--navy)" }}>
                7일 맞춤 루틴은 프리미엄
              </p>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                유형별 7일 실천 미션 + 주간 분석 리포트<br />폭식·야식 방지 전략 포함
              </p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-3 rounded-xl text-sm font-black"
                style={{ background: "var(--navy)", color: "white" }}
              >
                프리미엄 시작하기 →
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/mission"
            className="block w-full text-center py-4 rounded-2xl font-bold text-sm"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            7일 미션 시작하기 (프리미엄)
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("dd_answers");
              localStorage.removeItem("dd_type");
              router.push("/diagnosis");
            }}
            className="w-full py-3 rounded-2xl text-sm font-medium text-gray-400 bg-transparent"
          >
            다시 진단하기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </main>
  );
}
