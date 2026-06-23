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
import { PAID_REPORT } from "@/lib/paid-report-data";
import { trackEvent } from "@/lib/tracking";

const KAKAO_OPENCHAT_URL = "https://open.kakao.com/o/pJpkL2yi";

const difficultyStyle: Record<string, { bg: string; text: string }> = {
  "쉬움": { bg: "rgba(34,197,94,0.12)", text: "#15803d" },
  "보통": { bg: "rgba(234,179,8,0.15)", text: "#92400e" },
  "조금 어려움": { bg: "rgba(239,68,68,0.1)", text: "#b91c1c" },
};

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
  const data = PAID_REPORT[failureType];

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>

      {/* ── 헤더 ── */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-12 pb-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(212,168,83,0.2)", border: "1px solid rgba(212,168,83,0.3)" }}>
            <span className="text-xs font-black tracking-widest" style={{ color: "var(--amber)" }}>
              ✦ 식습관 분석 리포트
            </span>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-4"
            style={{ background: "rgba(212,168,83,0.15)" }}>
            <span className="text-3xl">{info.emoji}</span>
            <span className="text-2xl font-black" style={{ color: "var(--amber)" }}>{info.label}</span>
          </div>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            구매 완료 · 전체 분석 내용
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-5">

        {/* ── Section 1: 유형 요약 ── */}
        <SectionCard label="01 다이어트 실패 유형 요약">
          <div className="rounded-xl p-4 mb-4"
            style={{ background: "var(--navy)" }}>
            <p className="font-black text-base leading-snug" style={{ color: "var(--amber)" }}>
              {data.typeSummary.headline}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 mb-4">
            {data.typeSummary.description}
          </p>
          <div className="rounded-xl p-4 flex gap-3"
            style={{ background: "rgba(212,168,83,0.1)", border: "1.5px solid rgba(212,168,83,0.25)" }}>
            <span className="text-xl shrink-0">💡</span>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: "#7a5000" }}>
              {data.typeSummary.insight}
            </p>
          </div>
        </SectionCard>

        {/* ── Section 2: 핵심 원인 3가지 ── */}
        <SectionCard label="02 살이 찌는 핵심 원인 3가지">
          <div className="space-y-3">
            {data.coreReasons.map((reason, i) => (
              <div key={i} className="rounded-xl p-4 flex gap-3"
                style={{ background: "rgba(30,58,95,0.04)", border: "1px solid rgba(30,58,95,0.08)" }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                  style={{ background: "var(--navy)", color: "var(--amber)" }}>
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-black mb-1.5" style={{ color: "var(--navy)" }}>
                    {reason.title}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-500">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 3: 오늘부터 바꿀 행동 3가지 ── */}
        <SectionCard label="03 오늘부터 바꿀 행동 3가지">
          <div className="space-y-3">
            {data.todayActions.map((action, i) => {
              const ds = difficultyStyle[action.difficulty];
              return (
                <div key={i} className="rounded-xl bg-white p-4"
                  style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-black" style={{ color: "var(--navy)" }}>
                      {action.title}
                    </p>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap"
                      style={{ background: ds.bg, color: ds.text }}>
                      {action.difficulty}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-500">{action.description}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Section 4: 위험 시간대 대응법 ── */}
        <SectionCard label="04 야식·폭식 위험 시간대 대응법">
          <div className="rounded-xl p-4 mb-4 text-center"
            style={{ background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.15)" }}>
            <p className="text-xs text-gray-400 mb-1">가장 위험한 시간대</p>
            <p className="text-base font-black" style={{ color: "#c53030" }}>
              ⚠ {data.riskTimeResponse.riskTime}
            </p>
          </div>
          <div className="rounded-xl p-4 mb-4"
            style={{ background: "rgba(30,58,95,0.04)", border: "1px solid rgba(30,58,95,0.08)" }}>
            <p className="text-xs font-black mb-1.5" style={{ color: "var(--navy)" }}>왜 이 시간대가 위험한가요?</p>
            <p className="text-xs leading-relaxed text-gray-500">{data.riskTimeResponse.trigger}</p>
          </div>
          <div className="space-y-2.5">
            {data.riskTimeResponse.strategies.map((s, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-white p-3.5"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                  style={{ background: "var(--amber)", color: "var(--navy)" }}>
                  {i + 1}
                </span>
                <p className="text-xs leading-relaxed text-gray-600">{s}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 5: 식사 조합 추천 ── */}
        <SectionCard label="05 덜 찌게 먹는 식사 조합 추천">
          <div className="space-y-3">
            {data.mealCombinations.map((mc, i) => (
              <div key={i} className="rounded-xl bg-white p-4"
                style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black"
                    style={{ background: "rgba(212,168,83,0.15)", color: "#7a5000" }}>
                    {mc.meal}
                  </span>
                </div>
                <p className="text-sm font-black mb-1.5" style={{ color: "var(--navy)" }}>
                  {mc.recommendation}
                </p>
                <p className="text-xs leading-relaxed text-gray-400">{mc.reason}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 6: 배달·편의점 대체 선택지 ── */}
        <SectionCard label="06 배달음식·편의점 대체 선택지">
          <div className="space-y-3">
            {data.alternatives.map((alt, i) => (
              <div key={i} className="rounded-xl p-4"
                style={{ background: "rgba(30,58,95,0.04)", border: "1px solid rgba(30,58,95,0.08)" }}>
                <p className="text-xs font-black mb-2.5" style={{ color: "var(--navy)" }}>
                  🍔 {alt.instead}
                </p>
                <div className="space-y-1.5 mb-3">
                  {alt.options.map((opt, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5" style={{ color: "var(--amber)" }}>→</span>
                      <p className="text-xs leading-relaxed text-gray-600">{opt}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg px-3 py-2"
                  style={{ background: "rgba(212,168,83,0.1)" }}>
                  <p className="text-xs leading-relaxed" style={{ color: "#7a5000" }}>
                    💡 {alt.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 7: 7일 실천 플랜 ── */}
        <SectionCard label="07 7일 실천 플랜">
          <div className="space-y-3">
            {data.sevenDayPlan.map((plan, i) => (
              <div key={i} className="rounded-xl bg-white overflow-hidden"
                style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 px-4 py-2.5"
                  style={{ background: i === 0 || i === 6 ? "var(--navy)" : "rgba(30,58,95,0.06)" }}>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      background: i === 0 || i === 6 ? "rgba(212,168,83,0.25)" : "white",
                      color: i === 0 || i === 6 ? "var(--amber)" : "var(--navy)",
                    }}>
                    {plan.day}
                  </span>
                  <p className="text-xs font-black"
                    style={{ color: i === 0 || i === 6 ? "white" : "var(--navy)" }}>
                    {plan.focus}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs leading-relaxed text-gray-600 mb-2">{plan.action}</p>
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs shrink-0 mt-0.5">✓</span>
                    <p className="text-xs text-gray-400">{plan.checkpoint}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 8: 마지막 응원 문구 ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--navy)", boxShadow: "0 4px 20px rgba(30,58,95,0.2)" }}>
          <div className="px-6 pt-8 pb-6 text-center">
            <p className="text-3xl mb-4">🌱</p>
            <p className="text-lg font-black mb-4" style={{ color: "var(--amber)" }}>
              {data.encouragement.headline}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {data.encouragement.message}
            </p>
            <div className="mt-6 pt-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                {info.emoji} {info.label} 유형 · 맞춤 분석 완료
              </p>
            </div>
          </div>
        </div>

        {/* ── 오픈채팅 CTA ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "2px solid var(--navy)" }}>
          <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
            <p className="text-xs font-black tracking-widest mb-1" style={{ color: "var(--amber)" }}>
              1:1 질문하기
            </p>
            <p className="font-black text-white text-sm leading-snug">
              리포트 내용이 궁금하거나 더 구체적인 도움이 필요하신가요?
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <a
              href={KAKAO_OPENCHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                void trackEvent({ eventName: "paid_report_kakao_click", resultType: info.label })
              }
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
          style={{
            background: "rgba(30,58,95,0.05)",
            color: "var(--navy)",
            border: "1.5px solid rgba(30,58,95,0.1)",
          }}
        >
          결과 페이지로 돌아가기
        </Link>

        <p className="text-xs text-gray-400 text-center leading-relaxed px-2 pb-2">
          본 리포트는 생활습관 기반의 자기 점검 분석입니다.
          의료적 진단이나 처방을 대체하지 않습니다.
        </p>
      </div>
    </main>
  );
}

function SectionCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1" style={{ background: "rgba(30,58,95,0.08)" }} />
        <p className="text-xs font-black tracking-widest px-1" style={{ color: "var(--amber)" }}>
          {label}
        </p>
        <div className="h-px flex-1" style={{ background: "rgba(30,58,95,0.08)" }} />
      </div>
      {children}
    </div>
  );
}
