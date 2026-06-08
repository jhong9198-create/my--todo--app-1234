"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/tracking";

// Q1-Q4: 객관식
const MC_QUESTIONS = [
  {
    id: "mainConcern",
    text: "현재 가장 고민인 것은 무엇인가요?",
    options: [
      { label: "쪘다가 잘 안 빠진다", value: "안빠짐" },
      { label: "빠졌다가 다시 찐다", value: "요요" },
      { label: "운동이 꾸준히 안 된다", value: "운동지속실패" },
      { label: "식단 유지가 어렵다", value: "식단유지어려움" },
      { label: "정체기가 왔다", value: "정체기" },
      { label: "의지가 자꾸 꺾인다", value: "의지부족" },
      { label: "기타", value: "기타" },
    ],
  },
  {
    id: "failureCount",
    text: "최근 1년 안에 다이어트에 실패한 적 있나요?",
    options: [
      { label: "1회", value: "1회" },
      { label: "1~3회", value: "1-3회" },
      { label: "4회 이상", value: "4회이상" },
      { label: "항상 반복된다", value: "항상반복" },
    ],
  },
  {
    id: "failureReason",
    text: "실패 원인이 무엇이라고 생각하나요?",
    options: [
      { label: "폭식", value: "폭식" },
      { label: "야식", value: "야식" },
      { label: "회식", value: "회식" },
      { label: "스트레스", value: "스트레스" },
      { label: "운동 부족", value: "운동부족" },
      { label: "시간 부족", value: "시간부족" },
      { label: "귀찮음", value: "귀찮음" },
      { label: "의지 부족", value: "의지부족" },
      { label: "모르겠다", value: "모르겠다" },
      { label: "기타", value: "기타" },
    ],
  },
  {
    id: "hardestMoment",
    text: "가장 힘든 순간은 언제인가요?",
    options: [
      { label: "시작하기 전", value: "시작전" },
      { label: "1주일 이내", value: "1주일이내" },
      { label: "2~4주차", value: "2-4주" },
      { label: "정체기", value: "정체기" },
      { label: "목표 체중 근처", value: "목표근처" },
      { label: "감량 후 유지", value: "감량후유지" },
    ],
  },
];

const TOTAL_STEPS = 7; // Q1~Q7

type Answers = {
  mainConcern?: string;
  failureCount?: string;
  failureReason?: string;
  hardestMoment?: string;
  wantsAnalysis?: "yes" | "no";
  quittingWord?: string;
  kakaoId?: string;
  email?: string;
};

export default function SurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-6
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void trackEvent({ eventName: "survey_start" });
  }, []);

  const progressPct = done ? 100 : ((step + 1) / TOTAL_STEPS) * 100;

  function goBack() {
    if (step === 0) return;
    if (step <= 3) {
      const prevKey = MC_QUESTIONS[step - 1].id as keyof Answers;
      setSelected((answers[prevKey] as string) ?? null);
    } else {
      setSelected(null);
    }
    setStep(step - 1);
  }

  function handleMCNext() {
    if (!selected) return;
    const q = MC_QUESTIONS[step];
    setAnswers((prev) => ({ ...prev, [q.id]: selected }));
    setStep(step + 1);
    setSelected(null);
  }

  function handleWantsAnalysis(val: "yes" | "no") {
    setAnswers((prev) => ({ ...prev, wantsAnalysis: val }));
    setStep(5); // Q6(주관식)으로 이동 — 이전에 6으로 잘못 설정되어 Q6가 스킵되던 버그 수정
  }

  function handleQuittingWordNext(text: string) {
    setAnswers((prev) => ({ ...prev, quittingWord: text.trim() }));
    setStep(6);
  }

  function handleContactSubmit(kakaoId: string, email: string) {
    const final: Answers = { ...answers, kakaoId: kakaoId.trim() || undefined, email: email.trim() || undefined };
    setAnswers(final);
    localStorage.setItem("wg_survey", JSON.stringify(final));
    void trackEvent({
      eventName: "survey_complete",
      selectedAnswers: final as unknown as Record<string, unknown>,
      kakaoId: final.kakaoId,
      email: final.email,
      quittingWord: final.quittingWord,
    });
    setDone(true);
  }

  if (done) {
    return <DoneScreen wantsAnalysis={answers.wantsAnalysis} router={router} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-black">다이어트 실패 설문</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              질문 {step + 1} / {TOTAL_STEPS}
            </p>
          </div>
          {step > 0 && (
            <button
              onClick={goBack}
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

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-10">
        {/* Q1~Q4: 객관식 */}
        {step <= 3 && (
          <MCStep
            step={step}
            question={MC_QUESTIONS[step]}
            selected={selected}
            setSelected={setSelected}
            onNext={handleMCNext}
            totalSteps={TOTAL_STEPS}
          />
        )}

        {/* Q5: 예/아니요 */}
        {step === 4 && <Q5Step onAnswer={handleWantsAnalysis} />}

        {/* Q6: 주관식 */}
        {step === 5 && <Q6Step onNext={handleQuittingWordNext} />}

        {/* Q7: 연락처 */}
        {step === 6 && <Q7Step onSubmit={handleContactSubmit} />}

        {/* 스텝 도트 (Q7 제외) */}
        {step < 6 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
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
        )}
      </div>
    </div>
  );
}

// ── 객관식 스텝 ──────────────────────────────────────────────────
function MCStep({
  step, question, selected, setSelected, onNext, totalSteps,
}: {
  step: number;
  question: (typeof MC_QUESTIONS)[0];
  selected: string | null;
  setSelected: (v: string) => void;
  onNext: () => void;
  totalSteps: number;
}) {
  const isLast = step === MC_QUESTIONS.length - 1;
  return (
    <>
      <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
        질문 {step + 1} / {totalSteps}
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
        onClick={onNext}
        disabled={!selected}
        className="w-full py-4 rounded-2xl font-black text-base transition-all"
        style={{
          background: selected ? "var(--amber)" : "rgba(30,58,95,0.1)",
          color: selected ? "var(--navy)" : "#aaa",
          cursor: selected ? "pointer" : "not-allowed",
        }}
      >
        {isLast ? "다음 질문으로 →" : "다음"}
      </button>
    </>
  );
}

// ── Q5: 예/아니요 ────────────────────────────────────────────────
function Q5Step({ onAnswer }: { onAnswer: (v: "yes" | "no") => void }) {
  return (
    <>
      <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
        질문 5 / 7
      </p>
      <h2 className="text-xl font-black mb-3 leading-snug" style={{ color: "var(--navy)" }}>
        만약 당신만의 실패 원인을<br />분석해준다면 받아보고 싶나요?
      </h2>
      <p className="text-sm mb-8" style={{ color: "rgba(30,58,95,0.5)" }}>
        3가지 질문으로 내 패턴을 정확히 짚어드려요
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAnswer("yes")}
          className="py-5 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
          style={{ background: "var(--amber)", color: "var(--navy)" }}
        >
          예, 받고 싶어요 👍
        </button>
        <button
          onClick={() => onAnswer("no")}
          className="py-5 rounded-2xl font-bold text-base transition-all"
          style={{
            background: "white",
            color: "var(--navy)",
            border: "2px solid rgba(30,58,95,0.12)",
          }}
        >
          아니요 🙅
        </button>
      </div>
    </>
  );
}

// ── Q6: 주관식 ───────────────────────────────────────────────────
function Q6Step({ onNext }: { onNext: (text: string) => void }) {
  const [text, setText] = useState("");

  return (
    <>
      <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
        질문 6 / 7
      </p>
      <h2 className="text-xl font-black mb-2 leading-snug" style={{ color: "var(--navy)" }}>
        다이어트를 포기하게 만드는
        <br />결정적 한마디를 적어주세요
      </h2>
      <p className="text-sm mb-6" style={{ color: "rgba(30,58,95,0.5)" }}>
        스스로에게 하는 말, 주변의 말 모두 괜찮아요
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`예시: "오늘 하루 쯤은 괜찮아"\n"어차피 나는 안 돼"\n"한 입만 먹어도 되잖아"`}
        rows={4}
        className="w-full rounded-2xl px-4 py-4 text-sm leading-relaxed resize-none mb-6 outline-none"
        style={{
          background: "white",
          border: "2px solid rgba(30,58,95,0.1)",
          color: "var(--navy)",
        }}
      />
      <button
        onClick={() => onNext(text)}
        className="w-full py-4 rounded-2xl font-black text-base transition-all"
        style={{
          background: text.trim() ? "var(--amber)" : "rgba(30,58,95,0.1)",
          color: text.trim() ? "var(--navy)" : "#aaa",
          cursor: text.trim() ? "pointer" : "not-allowed",
        }}
        disabled={!text.trim()}
      >
        다음 →
      </button>
      <button
        onClick={() => onNext("")}
        className="w-full py-3 mt-2 text-xs text-gray-400 font-medium"
      >
        건너뛰기
      </button>
    </>
  );
}

// ── Q7: 연락처 ───────────────────────────────────────────────────
function Q7Step({ onSubmit }: { onSubmit: (kakaoId: string, email: string) => void }) {
  const [kakaoId, setKakaoId] = useState("");
  const [email, setEmail] = useState("");

  const hasContact = kakaoId.trim() || email.trim();

  return (
    <>
      <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
        질문 7 / 7
      </p>
      <h2 className="text-xl font-black mb-2 leading-snug" style={{ color: "var(--navy)" }}>
        원인 분석 결과와 해결책을
        <br />받아보고 싶다면 연락처를 남겨주세요
      </h2>
      <p className="text-xs mb-7 px-0.5" style={{ color: "rgba(30,58,95,0.45)" }}>
        선택사항입니다 · 스팸 없음 · 분석 결과 전달 목적으로만 사용
      </p>

      <div className="space-y-3 mb-6">
        <div>
          <label className="text-xs font-bold block mb-1.5" style={{ color: "var(--navy)" }}>
            카카오톡 ID
          </label>
          <input
            type="text"
            value={kakaoId}
            onChange={(e) => setKakaoId(e.target.value)}
            placeholder="카카오톡 ID 입력 (선택)"
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
            style={{
              background: "white",
              border: "2px solid rgba(30,58,95,0.1)",
              color: "var(--navy)",
            }}
          />
        </div>
        <div>
          <label className="text-xs font-bold block mb-1.5" style={{ color: "var(--navy)" }}>
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 입력 (선택)"
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
            style={{
              background: "white",
              border: "2px solid rgba(30,58,95,0.1)",
              color: "var(--navy)",
            }}
          />
        </div>
      </div>

      <button
        onClick={() => onSubmit(kakaoId, email)}
        className="w-full py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
        style={{ background: "var(--amber)", color: "var(--navy)" }}
      >
        {hasContact ? "설문 제출하기 →" : "연락처 없이 제출하기 →"}
      </button>
    </>
  );
}

// ── 완료 화면 ────────────────────────────────────────────────────
function DoneScreen({
  wantsAnalysis,
  router,
}: {
  wantsAnalysis?: "yes" | "no";
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: "var(--beige)" }}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl">🎉</div>
        <div>
          <p className="text-xl font-black mb-2" style={{ color: "var(--navy)" }}>설문 완료!</p>
          <p className="text-sm leading-relaxed text-gray-500">
            소중한 답변 감사해요.
            {wantsAnalysis === "yes" && (
              <>
                <br />지금 바로 내 실패 원인을 분석해볼 수 있어요.
              </>
            )}
          </p>
        </div>

        {wantsAnalysis === "yes" ? (
          <button
            onClick={() => router.push("/quiz")}
            className="w-full py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            지금 내 실패 원인 분석하기 →
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 rounded-2xl font-black text-base"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            홈으로 돌아가기
          </button>
        )}

        <p className="text-xs text-gray-400">
          마음이 바뀌면 언제든지 분석을 받을 수 있어요
        </p>
      </div>
    </div>
  );
}
