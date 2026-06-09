"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DAYS,
  loadProgram,
  saveProgram,
  getOrCreateProgram,
  type DayRecord,
} from "@/lib/binge-program";
import { trackEvent } from "@/lib/tracking";

export default function DayPage() {
  const { day } = useParams<{ day: string }>();
  const router = useRouter();
  const dayNum = Number(day);
  const config = DAYS.find((d) => d.day === dayNum);

  const [cravingLevel, setCravingLevel] = useState<number>(5);
  const [emotion, setEmotion] = useState<string>("");
  const [actionTaken, setActionTaken] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const program = loadProgram();
    if (program?.days[dayNum]?.completed) {
      setAlreadyDone(true);
      const rec = program.days[dayNum]!;
      setCravingLevel(rec.craving_level ?? 5);
      setEmotion(rec.emotion ?? "");
      setActionTaken(rec.action_taken ?? "");
      setMemo(rec.memo ?? "");
    }
    trackEvent({ eventName: "binge_program_day_viewed", resultType: String(dayNum) });
  }, [dayNum]);

  if (!config) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <p className="text-gray-500">잘못된 경로입니다.</p>
      </main>
    );
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);

    const record: DayRecord = {
      completed: true,
      craving_level: cravingLevel,
      emotion: emotion || undefined,
      action_taken: actionTaken || undefined,
      memo: memo || undefined,
      completed_at: new Date().toISOString(),
    };

    const program = getOrCreateProgram();
    program.days[dayNum] = record;
    saveProgram(program);

    const sessionId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("wg_session_id") ?? undefined
        : undefined;

    // Supabase 저장 (fire-and-forget)
    fetch("/api/binge-program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        day_number: dayNum,
        craving_level: cravingLevel,
        emotion: emotion || null,
        action_taken: actionTaken || null,
        completed: true,
        memo: memo || null,
      }),
    }).catch(() => {});

    trackEvent({
      eventName: "binge_program_day_completed",
      resultType: String(dayNum),
    });
    if (cravingLevel) {
      trackEvent({ eventName: "binge_craving_recorded", resultType: String(dayNum) });
    }

    setSubmitting(false);
    setDone(true);
  }

  if (done || alreadyDone) {
    const isLast = dayNum === 7;
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center px-5">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✅
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            DAY {dayNum} 기록 완료!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isLast
              ? "7일 프로그램을 모두 마쳤습니다. 결과를 확인해보세요."
              : "오늘의 작은 기록이 패턴을 바꿉니다."}
          </p>
          {isLast ? (
            <button
              onClick={() => {
                trackEvent({ eventName: "binge_program_finished" });
                router.push("/binge-program/result");
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-bold"
            >
              📊 내 7일 패턴 결과 보기
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/binge-program/day/${dayNum + 1}`)}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-bold"
              >
                DAY {dayNum + 1} 미리보기 →
              </button>
              <button
                onClick={() => router.push("/binge-program")}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold"
              >
                전체 현황 보기
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-20">
      {/* 상단 헤더 */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 pt-12 pb-6">
        <button
          onClick={() => router.push("/binge-program")}
          className="text-orange-100 text-sm mb-3 flex items-center gap-1"
        >
          ← 전체 현황
        </button>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
            DAY {dayNum}
          </span>
          <span className="text-orange-100 text-xs">7일 프로그램</span>
        </div>
        <h1 className="text-xl font-bold">{config.title}</h1>
        <p className="text-orange-50 text-sm mt-2 leading-relaxed whitespace-pre-line">
          {config.mission}
        </p>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {/* 팁 카드 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3 items-start">
          <span className="text-lg">💡</span>
          <p className="text-amber-800 text-sm leading-relaxed">{config.tip}</p>
        </div>

        {/* 폭식 충동 강도 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-700 font-semibold text-sm mb-3">
            지금 폭식 충동 강도는? <span className="text-orange-500 font-bold">{cravingLevel}</span>/10
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCravingLevel(n)}
                className={`flex-1 min-w-0 py-2 rounded-lg text-sm font-semibold transition-all ${
                  cravingLevel === n
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-gray-400 text-xs">약함</span>
            <span className="text-gray-400 text-xs">매우 강함</span>
          </div>
        </div>

        {/* 감정 선택 (Day 2) */}
        {config.emotionOptions && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 font-semibold text-sm mb-3">지금 어떤 감정인가요?</p>
            <div className="flex flex-wrap gap-2">
              {config.emotionOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setEmotion(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    emotion === opt
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 행동 선택 (Day 3~6) */}
        {config.actionOptions && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 font-semibold text-sm mb-3">
              {dayNum === 3 && "어떤 행동을 해봤나요?"}
              {dayNum === 4 && "어떤 대체 음식을 선택했나요?"}
              {dayNum === 5 && "어떤 환경을 바꿨나요?"}
              {dayNum === 6 && "회복 루틴 중 실행한 것은?"}
            </p>
            <div className="space-y-2">
              {config.actionOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActionTaken(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    actionTaken === opt
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 메모 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-700 font-semibold text-sm mb-3">
            {dayNum === 7 ? "7일 소감 (선택사항)" : "오늘 기록 메모 (선택사항)"}
          </p>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder={
              dayNum === 1
                ? "예: 밤 11시쯤 가장 심했어요. 혼자 있을 때..."
                : dayNum === 7
                ? "7일 동안 가장 기억에 남는 변화가 있나요?"
                : "자유롭게 기록해보세요..."
            }
            rows={3}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg disabled:opacity-60"
        >
          {submitting ? "저장 중..." : "✅ 오늘 기록 완료하기"}
        </button>
      </div>
    </main>
  );
}
