"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, determineUserType } from "@/types/diagnosis";

export default function DiagnosisPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const question = QUESTIONS[step];
  const progressPct = (step / QUESTIONS.length) * 100;
  const isLast = step === QUESTIONS.length - 1;

  function handleNext() {
    if (selected === null) return;
    const next = [...answers, selected];

    if (isLast) {
      const type = determineUserType(next);
      localStorage.setItem("dd_answers", JSON.stringify(next));
      localStorage.setItem("dd_type", type);
      router.push("/result");
    } else {
      setAnswers(next);
      setStep(step + 1);
      setSelected(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <span className="text-base">🔍</span>
          <span className="text-white text-sm font-bold tracking-widest">다이어트 탐정</span>
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
          질문 {step + 1} / {QUESTIONS.length}
        </p>

        <h2 className="text-xl font-bold mb-8 leading-snug" style={{ color: "var(--navy)" }}>
          {question.text}
        </h2>

        <div className="flex flex-col gap-3 mb-10">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className="text-left px-5 py-4 rounded-xl font-medium text-sm transition-all"
              style={{
                background: selected === idx ? "var(--navy)" : "white",
                color: selected === idx ? "white" : "var(--navy)",
                border: `2px solid ${selected === idx ? "var(--navy)" : "rgba(30,58,95,0.12)"}`,
                boxShadow: selected === idx ? "0 4px 14px rgba(30,58,95,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3"
                style={{
                  background: selected === idx ? "rgba(255,255,255,0.15)" : "rgba(30,58,95,0.07)",
                  color: selected === idx ? "white" : "var(--navy)",
                }}
              >
                {idx + 1}
              </span>
              {opt}
            </button>
          ))}
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
          {isLast ? "분석 결과 보기 →" : "다음 질문"}
        </button>

        {/* 스텝 도트 */}
        <div className="flex justify-center gap-2 mt-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                background: i < step ? "var(--amber)" : i === step ? "var(--navy)" : "rgba(30,58,95,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
