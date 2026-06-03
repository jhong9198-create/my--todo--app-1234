"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizAnswers, Budget, QUIZ_QUESTIONS } from "@/lib/recommendation";
import { trackEvent } from "@/lib/tracking";

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(boolean | Budget)[]>([]);
  const [selected, setSelected] = useState<boolean | Budget | null>(null);

  // 퀴즈 시작 이벤트 (세션당 1회)
  useEffect(() => {
    void trackEvent({ eventName: "quiz_start" });
  }, []);

  const question = QUIZ_QUESTIONS[step];
  const progressPct = ((step + 1) / QUIZ_QUESTIONS.length) * 100;
  const isLast = step === QUIZ_QUESTIONS.length - 1;

  function handleNext() {
    if (selected === null) return;
    const next = [...answers, selected];

    if (isLast) {
      const [exerciseHate, dietSelf, recordHate, budget, wantFast, drugInterest, deliveryIssue] = next;
      const quizAnswers: QuizAnswers = {
        exerciseHate: exerciseHate as boolean,
        dietSelf: dietSelf as boolean,
        recordHate: recordHate as boolean,
        budget: budget as Budget,
        wantFast: wantFast as boolean,
        drugInterest: drugInterest as boolean,
        deliveryIssue: deliveryIssue as boolean,
      };
      localStorage.setItem("wg_answers", JSON.stringify(quizAnswers));

      // 퀴즈 완료 이벤트 (매 완료마다 기록)
      void trackEvent({
        eventName: "quiz_complete",
        selectedAnswers: quizAnswers as unknown as Record<string, unknown>,
      });

      router.push("/result");
    } else {
      setAnswers(next);
      setStep(step + 1);
      setSelected(null);
    }
  }

  function handleBack() {
    if (step === 0) return;
    const prevAnswers = answers.slice(0, -1);
    setAnswers(prevAnswers);
    setStep(step - 1);
    setSelected(prevAnswers[prevAnswers.length - 1] ?? null);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-base">📍</span>
            <span className="text-white text-sm font-bold tracking-widest">다이어트 어디가?</span>
          </Link>
          {step > 0 && (
            <button
              onClick={handleBack}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.1)" }}
            >
              ← 이전
            </button>
          )}
        </div>
      </div>

      {/* 진행바 */}
      <div className="h-1.5" style={{ background: "var(--beige-dark)" }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%`, background: "var(--amber)" }}
        />
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-10">
        <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "var(--amber)" }}>
          질문 {step + 1} / {QUIZ_QUESTIONS.length}
        </p>

        <h2 className="text-xl font-bold mb-2 leading-snug" style={{ color: "var(--navy)" }}>
          {question.text}
        </h2>
        {question.sub && (
          <p className="text-sm mb-8 leading-relaxed text-gray-400">{question.sub}</p>
        )}

        <div className="flex flex-col gap-3 mb-10">
          {question.options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => setSelected(opt.value)}
                className="text-left px-5 py-4 rounded-xl font-medium text-sm transition-all"
                style={{
                  background: isSelected ? "var(--navy)" : "white",
                  color: isSelected ? "white" : "var(--navy)",
                  border: `2px solid ${isSelected ? "var(--navy)" : "rgba(30,58,95,0.12)"}`,
                  boxShadow: isSelected ? "0 4px 14px rgba(30,58,95,0.18)" : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.15)" : "rgba(30,58,95,0.07)",
                    color: isSelected ? "white" : "var(--navy)",
                  }}
                >
                  {isSelected ? "✓" : ""}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={selected === null}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all"
          style={{
            background: selected !== null ? "var(--amber)" : "var(--beige-dark)",
            color: selected !== null ? "var(--navy)" : "#aaa",
            cursor: selected !== null ? "pointer" : "not-allowed",
          }}
        >
          {isLast ? "추천 결과 보기 →" : "다음 질문"}
        </button>

        {/* 스텝 도트 */}
        <div className="flex justify-center gap-1.5 mt-8 flex-wrap">
          {QUIZ_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 18 : 7,
                height: 7,
                background:
                  i < step
                    ? "var(--amber)"
                    : i === step
                    ? "var(--navy)"
                    : "rgba(30,58,95,0.15)",
              }}
            />
          ))}
        </div>

        {/* 의료 면책 안내 */}
        {step === 5 && (
          <div
            className="mt-8 p-4 rounded-xl text-xs leading-relaxed text-gray-500"
            style={{ background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.2)" }}
          >
            <strong style={{ color: "var(--amber)" }}>안내</strong> 약물·주사 치료는 의료진 처방이 필수입니다.
            본 서비스는 정보 제공 목적이며 의료적 효과를 보장하지 않습니다.
          </div>
        )}
      </div>
    </div>
  );
}
