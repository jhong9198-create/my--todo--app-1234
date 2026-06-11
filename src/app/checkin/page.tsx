"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/tracking";

const EMOTIONS = [
  { key: "배고픔", emoji: "🍽️" },
  { key: "스트레스", emoji: "😤" },
  { key: "심심함", emoji: "😐" },
  { key: "피로", emoji: "😴" },
  { key: "습관", emoji: "🔄" },
];

function getDeviceId(): string {
  const KEY = "wg_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

function getTodayKST(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export default function CheckinPage() {
  const [score, setScore] = useState<number | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = getTodayKST();
    if (localStorage.getItem("wg_checkin_last_date") === today) {
      setAlreadyDone(true);
    }
    setStreak(parseInt(localStorage.getItem("wg_checkin_streak") ?? "0"));
  }, []);

  async function handleSubmit() {
    if (!score || !emotion || loading) return;
    setLoading(true);

    const deviceId = getDeviceId();
    const today = getTodayKST();

    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, craving_score: score, emotion, date_kst: today }),
    });

    const newStreak = streak + 1;
    localStorage.setItem("wg_checkin_last_date", today);
    localStorage.setItem("wg_checkin_streak", String(newStreak));
    setStreak(newStreak);

    void trackEvent({ eventName: "checkin_submitted", interest: emotion, accuracy: String(score) });
    setSubmitted(true);
    setLoading(false);
  }

  if (alreadyDone || submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: "var(--beige)" }}>
        <div className="w-full max-w-sm">
          <div className="rounded-3xl overflow-hidden" style={{ border: "2px solid var(--navy)" }}>
            <div className="px-6 py-10 text-center" style={{ background: "var(--navy)" }}>
              <div className="text-5xl mb-4">🔥</div>
              <p className="font-black text-white text-xl">오늘 기록 완료!</p>
              <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                {streak}일째 기록 중이에요
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--amber)" }} />
                ))}
                {streak < 7 && Array.from({ length: 7 - streak }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                ))}
              </div>
            </div>
            <div className="bg-white px-6 py-6 flex flex-col gap-3">
              {streak >= 3 ? (
                <Link
                  href="/checkin/report"
                  className="w-full py-4 rounded-xl font-black text-base text-center block"
                  style={{ background: "var(--amber)", color: "var(--navy)" }}
                >
                  내 패턴 리포트 보기 →
                </Link>
              ) : (
                <div className="rounded-xl p-5 text-center" style={{ background: "var(--beige)" }}>
                  <p className="text-sm font-black" style={{ color: "var(--navy)" }}>
                    {3 - streak}일 더 기록하면
                  </p>
                  <p className="text-sm font-black mt-0.5" style={{ color: "var(--amber)" }}>
                    나의 패턴 리포트가 열려요
                  </p>
                </div>
              )}
              <Link href="/" className="w-full py-3 rounded-xl text-sm text-center block font-semibold text-gray-400">
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-12" style={{ background: "var(--beige)" }}>
      <div className="max-w-sm mx-auto">
        <Link href="/" className="text-xs text-gray-400 mb-8 block">← 홈</Link>

        <p className="text-xs font-black tracking-widest mb-2 text-center" style={{ color: "var(--amber)" }}>
          DAILY CHECK-IN
        </p>
        <h1 className="text-2xl font-black text-center mb-1" style={{ color: "var(--navy)" }}>
          지금 폭식 충동<br />몇 점이에요?
        </h1>
        <p className="text-xs text-center text-gray-400 mb-8">
          하루 5초 기록 → 7일 후 내 패턴이 보여요
        </p>

        {/* 점수 그리드 */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setScore(n)}
              className="aspect-square rounded-xl font-black text-base transition-all"
              style={{
                background: score === n ? "var(--navy)" : "white",
                color: score === n ? "var(--amber)" : "var(--navy)",
                border: "2px solid",
                borderColor: score === n ? "var(--navy)" : "rgba(30,58,95,0.12)",
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-8 px-1">
          <span>충동 없음</span>
          <span>참기 힘들어요</span>
        </div>

        {/* 감정 선택 */}
        <p className="font-black text-base mb-3" style={{ color: "var(--navy)" }}>
          지금 감정이 뭐예요?
        </p>
        <div className="flex flex-wrap gap-2 mb-10">
          {EMOTIONS.map((e) => (
            <button
              key={e.key}
              onClick={() => setEmotion(e.key)}
              className="px-4 py-2.5 rounded-full font-bold text-sm transition-all"
              style={{
                background: emotion === e.key ? "var(--navy)" : "white",
                color: emotion === e.key ? "var(--amber)" : "var(--navy)",
                border: "2px solid",
                borderColor: emotion === e.key ? "var(--navy)" : "rgba(30,58,95,0.12)",
              }}
            >
              {e.emoji} {e.key}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!score || !emotion || loading}
          className="w-full py-4 rounded-2xl font-black text-base transition-all"
          style={{
            background: score && emotion ? "var(--amber)" : "rgba(0,0,0,0.08)",
            color: score && emotion ? "var(--navy)" : "rgba(0,0,0,0.3)",
          }}
        >
          {loading ? "저장 중..." : "오늘 기록하기"}
        </button>

        {streak > 0 && (
          <p className="text-xs text-center text-gray-400 mt-4">
            🔥 {streak}일째 연속 기록 중
          </p>
        )}
      </div>
    </main>
  );
}
