"use client";

import { useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/tracking";

export default function PaymentSuccessPage() {
  useEffect(() => {
    void trackEvent({ eventName: "payment_success_page_viewed" });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 pb-12" style={{ background: "var(--beige)" }}>
      <div className="max-w-md w-full space-y-5 text-center">
        <div className="text-6xl mb-2">🎉</div>
        <h1 className="text-2xl font-black" style={{ color: "var(--navy)" }}>결제가 완료됐어요!</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          식습관 분석 리포트를 지금 바로 확인하세요.
        </p>

        <div className="rounded-2xl bg-white p-6 text-left space-y-3"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {[
            "실패 패턴 근본 원인 심층 분석",
            "3가지 핵심 트리거 상세 분석",
            "지금 바꿔야 할 환경 설정 가이드",
            "7일 단계별 실천 플랜",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--navy)" }}>
              <span>✅</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <Link
          href="/paid-report"
          className="block w-full py-4 rounded-2xl font-black text-base text-center transition-all hover:scale-[1.02]"
          style={{ background: "var(--navy)", color: "var(--amber)" }}
        >
          심층 리포트 보러가기 →
        </Link>

        <Link href="/result" className="block text-xs text-gray-400 text-center pt-1">
          결과 페이지로 돌아가기
        </Link>
      </div>
    </main>
  );
}
