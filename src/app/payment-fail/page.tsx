"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/tracking";

export default function PaymentFailPage() {
  const [errorMsg, setErrorMsg] = useState("결제가 취소되었습니다.");

  useEffect(() => {
    const stored = localStorage.getItem("wg_last_payment_error");
    if (stored) setErrorMsg(stored);
    void trackEvent({ eventName: "payment_failed_page_viewed" });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 pb-12" style={{ background: "var(--beige)" }}>
      <div className="max-w-md w-full space-y-5 text-center">
        <div className="text-5xl mb-2">😔</div>
        <h1 className="text-xl font-black" style={{ color: "var(--navy)" }}>결제가 완료되지 않았어요</h1>
        <p className="text-sm text-gray-500 leading-relaxed">{errorMsg}</p>

        <div className="rounded-2xl bg-white p-5 text-sm text-gray-500 leading-relaxed"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          결제창을 닫거나 취소하셨다면 다시 시도할 수 있어요.<br />
          계속 문제가 생기면 카카오 오픈채팅으로 문의해주세요.
        </div>

        <Link
          href="/result"
          className="block w-full py-4 rounded-2xl font-black text-base text-center transition-all hover:scale-[1.02]"
          style={{ background: "var(--amber)", color: "var(--navy)" }}
        >
          결과 페이지로 돌아가기 (재시도)
        </Link>

        <a
          href="https://open.kakao.com/o/pJpkL2yi"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-gray-400 text-center pt-1"
        >
          결제 문의하기 →
        </a>
      </div>
    </main>
  );
}
