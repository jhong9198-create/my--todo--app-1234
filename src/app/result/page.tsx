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
import { trackEvent } from "@/lib/tracking";

const HELP_LABELS: Record<string, string> = {
  obesity_clinic: "비만클리닉",
  oriental: "한의원",
  pt: "PT",
  body_care: "바디관리실",
  meal_delivery: "식단 배송",
  online_coaching: "온라인 코칭",
};

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [failureType, setFailureType] = useState<FailureType | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("wg_diagnosis");
    if (!raw) {
      router.push("/quiz");
      return;
    }
    const answers: DiagnosisAnswers = JSON.parse(raw);
    const type = getDiagnosisResult(answers);

    const timer = setTimeout(() => {
      setFailureType(type);
      setLoading(false);
      void trackEvent({
        eventName: "diagnosis_result_viewed",
        resultType: FAILURE_TYPE_INFO[type].label,
        topRecommendation: type,
        selectedAnswers: answers as unknown as Record<string, unknown>,
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "var(--navy)" }}>
        <div className="text-5xl" style={{ animation: "pulse 1.2s ease-in-out infinite" }}>🔍</div>
        <div className="text-center">
          <p className="text-white font-black text-lg mb-2">실패 원인 분석 중</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>답변을 분석하는 중...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--amber)", animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <style>{`
          @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        `}</style>
      </div>
    );
  }

  if (!failureType) return null;
  const info = FAILURE_TYPE_INFO[failureType];

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-12 pb-20 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            📍 분석 완료
          </p>
          <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            당신의 다이어트 실패 유형은
          </p>
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-3"
            style={{ background: "rgba(212,168,83,0.2)" }}
          >
            <span className="text-2xl">{info.emoji}</span>
            <span className="text-xl font-black" style={{ color: "var(--amber)" }}>
              {info.label}
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            3가지 답변 분석 결과
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">
        {/* 실패 원인 */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
            나의 실패 원인
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>
            {info.cause}
          </p>
        </div>

        {/* 반복되는 패턴 */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(30,58,95,0.04)",
            border: "1px solid rgba(30,58,95,0.08)",
          }}
        >
          <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--navy)" }}>
            반복되는 패턴
          </p>
          <p className="text-sm leading-relaxed text-gray-600">{info.pattern}</p>
        </div>

        {/* 오늘 당장 할 수 있는 무료 행동 */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>
            오늘 당장 할 수 있는 무료 행동 3가지
          </p>
          <div className="space-y-3">
            {info.freeActions.map((action, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                  style={{ background: "var(--amber)", color: "var(--navy)" }}
                >
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 도움 */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--beige)", border: "1px solid rgba(212,168,83,0.25)" }}
        >
          <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--navy)" }}>
            필요한 경우 추천되는 도움
          </p>
          <div className="flex flex-wrap gap-2">
            {info.helpTypes.map((type) => (
              <Link
                key={type}
                href={`/businesses?type=${type}`}
                onClick={() =>
                  void trackEvent({
                    eventName: "help_type_click",
                    topRecommendation: type,
                    resultType: info.label,
                  })
                }
                data-event={`help_type_${type}`}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={{
                  background: "var(--navy)",
                  color: "white",
                }}
              >
                {HELP_LABELS[type] ?? type}
              </Link>
            ))}
          </div>
        </div>

        {/* ── 수익화 연결 섹션 ── */}
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(30,58,95,0.15)" }}>
          <div className="px-6 py-5" style={{ background: "var(--navy)" }}>
            <p className="font-black text-white text-base mb-1">혼자 해결하기 어렵다면</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              내 유형에 맞는 도움을 찾아보세요
            </p>
          </div>
          <div className="bg-white px-6 py-5 space-y-3">
            <Link
              href={`/businesses?type=${info.helpTypes[0]}`}
              onClick={() =>
                void trackEvent({
                  eventName: "monetization_cta_click",
                  resultType: info.label,
                  topRecommendation: "my_type_help",
                })
              }
              data-event="cta_my_type_help"
              className="block w-full text-center py-3.5 rounded-xl font-black text-sm transition-transform hover:scale-[1.02]"
              style={{ background: "var(--amber)", color: "var(--navy)" }}
            >
              내 유형에 맞는 관리 방법 보기 →
            </Link>
            <Link
              href="/businesses"
              onClick={() =>
                void trackEvent({
                  eventName: "monetization_cta_click",
                  resultType: info.label,
                  topRecommendation: "all_businesses",
                })
              }
              data-event="cta_all_businesses"
              className="block w-full text-center py-3.5 rounded-xl font-bold text-sm"
              style={{
                background: "rgba(30,58,95,0.06)",
                color: "var(--navy)",
                border: "1.5px solid rgba(30,58,95,0.1)",
              }}
            >
              주변 다이어트 업체 보기
            </Link>
            <button
              onClick={() =>
                void trackEvent({
                  eventName: "consultation_request_click",
                  resultType: info.label,
                })
              }
              data-event="cta_consultation"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-gray-400"
              style={{ border: "1.5px solid rgba(0,0,0,0.06)" }}
            >
              상담 신청하기 (준비 중)
            </button>
          </div>
        </div>

        {/* 다시 분석 */}
        <button
          onClick={() => {
            localStorage.removeItem("wg_diagnosis");
            router.push("/quiz");
          }}
          className="w-full py-3 rounded-2xl text-sm font-medium text-gray-400"
        >
          다시 분석하기
        </button>
      </div>
    </main>
  );
}
