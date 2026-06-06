"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DIAGNOSIS_QUESTIONS, DiagnosisAnswers } from "@/lib/diagnosis";
import { trackEvent } from "@/lib/tracking";

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<DiagnosisAnswers>>({});
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    void trackEvent({ eventName: "diagnosis_start" });
  }, []);

  const question = DIAGNOSIS_QUESTIONS[step];
  const isLast = step === DIAGNOSIS_QUESTIONS.length - 1;
  const progressPct = ((step + 1) / DIAGNOSIS_QUESTIONS.length) * 100;

  function handleNext() {
    if (!selected) return;
    const next = { ...answers, [question.id]: selected };

    if (isLast) {
      const complete = next as DiagnosisAnswers;
      localStorage.setItem("wg_diagnosis", JSON.stringify(complete));
      void trackEvent({
        eventName: "diagnosis_complete",
        selectedAnswers: complete as unknown as Record<string, unknown>,
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
    const key = DIAGNOSIS_QUESTIONS[step - 1].id;
    setSelected((answers[key] as string) ?? null);
    setStep(step - 1);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-black">다이어트 실패 원인 분석</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>3가지 질문 · 무료</p>
          </div>
          {step > 0 && (
            <button
              onClick={handleBack}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.1)" }}
            >
              ← 이전
            </button>
          )}
        </div>
      </div>

      {/* 진행바 */}
      <div className="h-1.5" style={{ background: "rgba(30,58,95,0.1)" }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progressPct}%`, background: "var(--amber)" }}
        />
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-10">
        <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
          질문 {step + 1} / {DIAGNOSIS_QUESTIONS.length}
        </p>

        <h2 className="text-xl font-black mb-8 leading-snug" style={{ color: "var(--navy)" }}>
          {question.text}
        </h2>

        <div className="grid grid-cols-2 gap-2.5 mb-10">
          {question.options.map((opt) => {
            const isActive = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className="px-4 py-3.5 rounded-xl font-semibold text-sm transition-all text-left"
                style={{
                  background: isActive ? "var(--navy)" : "white",
                  color: isActive ? "white" : "var(--navy)",
                  border: `2px solid ${isActive ? "var(--navy)" : "rgba(30,58,95,0.1)"}`,
                  boxShadow: isActive ? "0 4px 14px rgba(30,58,95,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {isActive && <span className="mr-1.5 text-xs">✓</span>}
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={!selected}
          className="w-full py-4 rounded-2xl font-black text-base transition-all"
          style={{
            background: selected ? "var(--amber)" : "rgba(30,58,95,0.1)",
            color: selected ? "var(--navy)" : "#aaa",
            cursor: selected ? "pointer" : "not-allowed",
          }}
        >
          {isLast ? "내 실패 유형 분석하기 →" : "다음"}
        </button>

        {/* 스텝 도트 */}
        <div className="flex justify-center gap-2 mt-8">
          {DIAGNOSIS_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                background:
                  i < step ? "var(--amber)" : i === step ? "var(--navy)" : "rgba(30,58,95,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
