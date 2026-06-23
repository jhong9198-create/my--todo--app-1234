"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DiagnosisAnswers,
  FailureType,
  FAILURE_TYPE_INFO,
  getDiagnosisResult,
} from "@/lib/diagnosis";
import { DEEP_DATA } from "@/lib/report-data";
import { trackEvent } from "@/lib/tracking";

const KAKAO_OPENCHAT_URL = "https://open.kakao.com/o/pJpkL2yi";

export default function PaidReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [failureType, setFailureType] = useState<FailureType | null>(null);

  useEffect(() => {
    const unlocked = localStorage.getItem("wg_paid_report_unlocked");
    if (!unlocked) {
      router.replace("/result");
      return;
    }

    const raw = localStorage.getItem("wg_diagnosis");
    if (!raw) {
      // 진단 데이터 없으면 결과 페이지로
      router.replace("/result");
      return;
    }

    const answers: DiagnosisAnswers = JSON.parse(raw);
    const type = getDiagnosisResult(answers);
    setFailureType(type);
    setLoading(false);

    void trackEvent({ eventName: "paid_report_viewed", resultType: FAILURE_TYPE_INFO[type].label });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy)" }}>
        <div className="text-center">
          <div className="text-4xl mb-4" style={{ animation: "pulse 1.2s ease-in-out infinite" }}>📋</div>
          <p className="text-white font-black">리포트 불러오는 중...</p>
          <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
        </div>
      </div>
    );
  }

  if (!failureType) return null;

  const info = FAILURE_TYPE_INFO[failureType];
  const d = DEEP_DATA[failureType];

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-12 pb-20 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            📋 식습관 분석 리포트
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-3" style={{ background: "rgba(212,168,83,0.2)" }}>
            <span className="text-2xl">{info.emoji}</span>
            <span className="text-xl font-black" style={{ color: "var(--amber)" }}>{info.label}</span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            구매 완료 · 전체 분석 내용
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">

        {/* 핵심 원인 */}
        <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
            핵심 원인 분석
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>{d.rootCause}</p>
        </div>

        {/* 트리거 심층 분석 */}
        <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>
            트리거 심층 분석
          </p>
          <div className="space-y-4">
            {d.triggerAnalysis.map(({ trigger, description }, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-full shrink-0 h-fit whitespace-nowrap"
                  style={{ background: "rgba(212,168,83,0.15)", color: "var(--amber)" }}>
                  {trigger}
                </span>
                <p className="text-xs leading-relaxed text-gray-500 pt-1">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 지금 바꿔야 할 환경 */}
        <div className="rounded-2xl p-6" style={{ background: "var(--navy)" }}>
          <p className="text-xs font-black tracking-widest mb-2" style={{ color: "var(--amber)" }}>
            지금 바꿔야 할 환경
          </p>
          <p className="text-sm leading-relaxed text-white">{d.environmentChange}</p>
        </div>

        {/* 7일 실천 플랜 */}
        <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>
            7일 단계별 실천 플랜
          </p>
          <div className="space-y-3">
            {d.weekPlan.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                  style={{ background: "var(--amber)", color: "var(--navy)" }}>
                  {i + 1}
                </span>
                <p className="text-xs leading-snug text-gray-600">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 실패 원인 + 패턴 */}
        <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
            나의 실패 원인
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>{info.cause}</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(30,58,95,0.04)", border: "1px solid rgba(30,58,95,0.08)" }}>
          <p className="text-xs font-black tracking-widest mb-2" style={{ color: "var(--navy)" }}>
            반복되는 패턴
          </p>
          <p className="text-sm leading-relaxed text-gray-600">{info.pattern}</p>
        </div>

        {/* 오픈채팅 CTA */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "2px solid var(--navy)" }}>
          <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
            <p className="text-xs font-black tracking-widest mb-1" style={{ color: "var(--amber)" }}>
              전문가 1:1 상담
            </p>
            <p className="font-black text-white text-sm leading-snug">
              리포트 내용에 대해 궁금한 게 있으신가요?
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <a
              href={KAKAO_OPENCHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void trackEvent({ eventName: "paid_report_kakao_click", resultType: info.label })}
              className="block w-full text-center py-3.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02]"
              style={{ background: "#FEE500", color: "#3A1D1D" }}
            >
              💬 카카오 오픈채팅으로 질문하기
            </a>
          </div>
        </div>

        <Link
          href="/result"
          className="block w-full text-center py-3 rounded-xl text-xs font-semibold"
          style={{ background: "rgba(30,58,95,0.05)", color: "var(--navy)", border: "1.5px solid rgba(30,58,95,0.1)" }}
        >
          결과 페이지로 돌아가기
        </Link>

        <p className="text-xs text-gray-400 text-center leading-relaxed px-2 pb-2">
          본 리포트는 생활습관 기반의 자기 점검 분석입니다. 의료적 진단을 대체하지 않습니다.
        </p>
      </div>
    </main>
  );
}
