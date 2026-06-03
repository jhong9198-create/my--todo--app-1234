"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QuizAnswers,
  ServiceType,
  SERVICE_LABELS,
  SERVICE_ICONS,
  SERVICE_DESCRIPTIONS,
  SERVICE_TYPE_INFO,
  getRecommendations,
  getRecommendationReason,
} from "@/lib/recommendation";
import { trackEvent } from "@/lib/tracking";

// ─── Feedback types ──────────────────────────────────────────────
interface FeedbackData {
  resultType: string;
  topRecommendation: ServiceType;
  accuracy: string;
  interest: string;
  consultationIntent: string;
  name: string;
  phone: string;
  submittedAt: string;
}

const ACCURACY_OPTIONS = ["매우 맞음", "어느 정도 맞음", "잘 모르겠음", "안 맞음"];
const INTEREST_OPTIONS = [
  "위고비/비만클리닉",
  "PT",
  "식습관 코칭",
  "한의원",
  "바디관리실",
  "식단배송",
];
const INTENT_OPTIONS = ["있다", "고민 중이다", "없다"];

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
      style={{
        background: selected ? "var(--navy)" : "white",
        color: selected ? "white" : "var(--navy)",
        border: `1.5px solid ${selected ? "var(--navy)" : "rgba(30,58,95,0.12)"}`,
        boxShadow: selected ? "0 3px 10px rgba(30,58,95,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {selected && <span className="mr-2 text-xs">✓</span>}
      {label}
    </button>
  );
}

function FeedbackForm({ topRecommendation }: { topRecommendation: ServiceType }) {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [accuracy, setAccuracy] = useState("");
  const [interest, setInterest] = useState("");
  const [intent, setIntent] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("wg_feedback_submitted") === "true") {
      setAlreadySubmitted(true);
    }
  }, []);

  function handleSubmit() {
    if (!accuracy || !interest || !intent) return;

    const feedbackData: FeedbackData = {
      resultType: SERVICE_LABELS[topRecommendation],
      topRecommendation,
      accuracy,
      interest,
      consultationIntent: intent,
      name: name.trim(),
      phone: phone.trim(),
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem("wg_feedback", JSON.stringify(feedbackData));
    localStorage.setItem("wg_feedback_submitted", "true");

    void trackEvent({
      eventName: "feedback_submit",
      resultType: feedbackData.resultType,
      topRecommendation: feedbackData.topRecommendation,
      accuracy: feedbackData.accuracy,
      interest: feedbackData.interest,
      consultationIntent: feedbackData.consultationIntent,
      name: feedbackData.name,
      phone: feedbackData.phone,
    });

    setDone(true);
  }

  const canSubmit = !!accuracy && !!interest && !!intent;

  // 이미 제출한 경우
  if (alreadySubmitted && !done) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
      >
        <div className="text-3xl mb-3">✅</div>
        <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>
          이미 피드백을 제출했습니다
        </p>
        <p className="text-xs text-gray-400 mt-1">소중한 의견 감사합니다.</p>
      </div>
    );
  }

  // 제출 완료
  if (done) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: "var(--navy)", boxShadow: "0 4px 20px rgba(30,58,95,0.2)" }}
      >
        <div className="text-4xl mb-4">🙏</div>
        <p className="font-bold text-white text-base mb-2">소중한 의견 감사합니다.</p>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          더 정확한 추천을 만드는 데 반영하겠습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
    >
      {/* 카드 헤더 */}
      <div
        className="px-6 py-4"
        style={{ background: "var(--beige)", borderBottom: "1px solid rgba(212,168,83,0.2)" }}
      >
        <p className="text-xs font-black tracking-widest mb-0.5" style={{ color: "var(--amber)" }}>
          FEEDBACK
        </p>
        <p className="font-bold text-base" style={{ color: "var(--navy)" }}>
          이 결과가 도움이 되었나요?
        </p>
        <p className="text-xs text-gray-400 mt-0.5">1분 미만 · 3가지 질문</p>
      </div>

      <div className="p-6 space-y-7">
        {/* Q1 */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--navy)" }}>
            Q1. 이 결과가 얼마나 맞다고 느껴졌나요?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ACCURACY_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={accuracy === opt}
                onClick={() => setAccuracy(opt)}
              />
            ))}
          </div>
        </div>

        {/* Q2 */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--navy)" }}>
            Q2. 지금 가장 관심 있는 다이어트 방법은?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={interest === opt}
                onClick={() => setInterest(opt)}
              />
            ))}
          </div>
        </div>

        {/* Q3 */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--navy)" }}>
            Q3. 실제로 상담받아볼 의향이 있나요?
          </p>
          <div className="flex flex-col gap-2">
            {INTENT_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={intent === opt}
                onClick={() => setIntent(opt)}
              />
            ))}
          </div>
        </div>

        {/* 선택: 연락처 */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "var(--beige)", border: "1px solid rgba(212,168,83,0.18)" }}
        >
          <p className="text-xs font-bold" style={{ color: "var(--navy)" }}>
            연락을 받고 싶다면 남겨주세요{" "}
            <span className="font-normal text-gray-400">(선택)</span>
          </p>
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid rgba(30,58,95,0.12)", background: "white" }}
          />
          <input
            type="tel"
            placeholder="연락처 (숫자만)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid rgba(30,58,95,0.12)", background: "white" }}
          />
          <p className="text-xs text-gray-400">
            수집된 연락처는 서비스 개선 목적으로만 사용됩니다.
          </p>
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all"
          style={{
            background: canSubmit ? "var(--amber)" : "var(--beige-dark)",
            color: canSubmit ? "var(--navy)" : "#aaa",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          피드백 제출하기
        </button>

        {!canSubmit && (
          <p className="text-center text-xs text-gray-400 -mt-4">
            3가지 질문에 모두 답해주세요
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────
const RANK_LABELS = ["1순위 추천", "2순위 추천", "3순위 추천"];

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [recommendations, setRecommendations] = useState<ServiceType[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = localStorage.getItem("wg_answers");
    if (!raw) {
      router.push("/quiz");
      return;
    }
    const parsed: QuizAnswers = JSON.parse(raw);
    const recs = getRecommendations(parsed);

    const timer = setTimeout(() => {
      setAnswers(parsed);
      setRecommendations(recs);
      setLoading(false);

      void trackEvent({
        eventName: "result_reached",
        topRecommendation: recs[0],
        resultType: SERVICE_LABELS[recs[0]],
        selectedAnswers: parsed as unknown as Record<string, unknown>,
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "var(--navy)" }}
      >
        <div className="text-5xl" style={{ animation: "pulse 1.2s ease-in-out infinite" }}>
          📍
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-2">딱 맞는 곳을 찾고 있습니다</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>답변을 분석하는 중...</p>
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
        <style>{`
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        `}</style>
      </div>
    );
  }

  if (!answers || recommendations.length === 0) return null;

  const topType = recommendations[0];

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-12 pb-20 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            📍 분석 완료
          </p>
          <h1 className="text-2xl font-bold text-white mb-2 leading-snug">
            나에게 맞는 다이어트 유형
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            7가지 답변을 분석한 결과입니다
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">
        {/* 추천 카드 */}
        {recommendations.map((type, idx) => {
          const info = SERVICE_TYPE_INFO[type];
          const isOpen = expanded[type];
          return (
            <div
              key={type}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
            >
              <div
                className="px-6 py-3 flex items-center gap-2"
                style={{
                  background:
                    idx === 0 ? "var(--navy)" : idx === 1 ? "var(--beige-dark)" : "var(--beige)",
                }}
              >
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full"
                  style={{
                    background: idx === 0 ? "var(--amber)" : "rgba(30,58,95,0.15)",
                    color: "var(--navy)",
                  }}
                >
                  {RANK_LABELS[idx]}
                </span>
                <span className="text-lg">{SERVICE_ICONS[type]}</span>
                <span className="font-bold text-sm" style={{ color: "var(--navy)" }}>
                  {SERVICE_LABELS[type]}
                </span>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {SERVICE_DESCRIPTIONS[type]}
                </p>

                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.2)" }}
                >
                  <p className="text-xs font-bold mb-1.5" style={{ color: "var(--amber)" }}>추천 이유</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {getRecommendationReason(type, answers)}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-gray-50">
                  <span className="text-sm">💰</span>
                  <div>
                    <p className="text-xs text-gray-400">예상 비용</p>
                    <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>
                      {info.expectedCost}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setExpanded((e) => ({ ...e, [type]: !isOpen }))}
                  className="w-full text-xs font-semibold py-2 rounded-lg transition-colors mb-4"
                  style={{
                    color: "var(--navy)",
                    background: isOpen ? "var(--beige)" : "rgba(30,58,95,0.05)",
                  }}
                >
                  {isOpen ? "접기 ▲" : "맞는/안 맞는 사람 · 주의사항 보기 ▼"}
                </button>

                {isOpen && (
                  <div className="space-y-4 mb-4">
                    <div>
                      <p className="text-xs font-bold mb-2" style={{ color: "var(--amber)" }}>
                        이런 분께 맞아요
                      </p>
                      <ul className="space-y-1.5">
                        {info.suitableFor.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-xs text-gray-600">
                            <span style={{ color: "var(--amber)" }}>✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-2 text-gray-400">이런 분께는 안 맞을 수 있어요</p>
                      <ul className="space-y-1.5">
                        {info.notSuitableFor.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="text-gray-300">✗</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-2 text-red-400">주의사항</p>
                      <ul className="space-y-1.5">
                        {info.cautions.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="text-red-300">!</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {info.medicalNote && (
                      <div
                        className="p-3 rounded-xl text-xs leading-relaxed"
                        style={{
                          background: "rgba(212,168,83,0.08)",
                          border: "1px solid rgba(212,168,83,0.25)",
                          color: "#7a6520",
                        }}
                      >
                        <strong>의료 안내</strong> {info.medicalNote}
                      </div>
                    )}
                  </div>
                )}

                <Link
                  href={`/businesses?type=${type}`}
                  className="block w-full text-center py-3 rounded-xl font-bold text-sm transition-transform hover:scale-[1.02]"
                  style={{
                    background: idx === 0 ? "var(--navy)" : "var(--beige-dark)",
                    color: idx === 0 ? "white" : "var(--navy)",
                  }}
                >
                  {SERVICE_LABELS[type]} 업체 보기 →
                </Link>
              </div>
            </div>
          );
        })}

        {/* 전체 업체 보기 */}
        <div className="rounded-2xl p-6 text-center" style={{ background: "var(--navy)" }}>
          <p className="text-white font-semibold mb-2">모든 유형 업체를 비교하고 싶으신가요?</p>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            지역·가격대 필터로 조건에 맞는 업체를 찾을 수 있어요
          </p>
          <Link
            href="/businesses"
            className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            전체 업체 리스트 보기
          </Link>
        </div>

        {/* ── 피드백 미니 설문 ── */}
        <FeedbackForm topRecommendation={topType} />

        {/* 하단 액션 */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href={`/businesses?type=${topType}`}
              className="block w-full text-center py-4 rounded-2xl font-bold text-base transition-transform hover:scale-[1.02]"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            1순위 추천 업체 상세 보기 →
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("wg_answers");
              router.push("/quiz");
            }}
            className="w-full py-3 rounded-2xl text-sm font-medium text-gray-400"
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    </main>
  );
}
