"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getFortune, FortuneResult } from "./fortune-action";

const STAR_COLORS = ["#ff4444", "#ff8800", "#ffcc00", "#00cc44", "#0088ff"];

function Stars({ score }: { score: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: "1.25rem",
            filter: i <= score ? "none" : "grayscale(1) opacity(0.3)",
            color: STAR_COLORS[Math.min(score - 1, 4)],
            textShadow: i <= score ? `0 0 8px ${STAR_COLORS[Math.min(score - 1, 4)]}` : "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const CATEGORY_CONFIG = [
  { key: "love" as const, emoji: "💕", label: "애정운", gradient: "from-pink-500 via-rose-400 to-red-500" },
  { key: "money" as const, emoji: "💰", label: "재물운", gradient: "from-yellow-400 via-amber-400 to-orange-500" },
  { key: "career" as const, emoji: "🚀", label: "직업운", gradient: "from-blue-500 via-indigo-400 to-purple-500" },
  { key: "health" as const, emoji: "🌿", label: "건강운", gradient: "from-green-400 via-emerald-400 to-teal-500" },
];

function FloatingStars() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 10) % 100}%`,
    top: `${(i * 53 + 5) % 100}%`,
    delay: `${(i * 0.3) % 3}s`,
    duration: `${3 + (i % 3)}s`,
    size: i % 3 === 0 ? "1.2rem" : i % 3 === 1 ? "0.8rem" : "0.5rem",
    opacity: 0.15 + (i % 5) * 0.07,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            fontSize: s.size,
            opacity: s.opacity,
            animation: `fortuneStar ${s.duration} ${s.delay} ease-in-out infinite alternate`,
            color: "#fff",
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 5) * 100;
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  const colors =
    score >= 4 ? "#22c55e" : score === 3 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 112, height: 112 }}>
      <svg width="112" height="112" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="56" cy="56" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke={colors}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${colors})`, transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>/5</span>
      </div>
    </div>
  );
}

export default function FortuneClient() {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (!y || !m || !d || y < 1900 || y > 2099 || m < 1 || m > 12 || d < 1 || d > 31) return;
    startTransition(async () => {
      const data = await getFortune(y, m, d);
      setResult(data);
    });
  };

  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  return (
    <div
      className="relative min-h-screen flex flex-col items-center"
      style={{
        background: "linear-gradient(135deg, #1a0533 0%, #0d1b6e 20%, #1a004d 40%, #003366 60%, #001a33 80%, #1a0533 100%)",
        backgroundSize: "400% 400%",
        animation: "fortuneBg 8s ease infinite",
      }}
    >
      <FloatingStars />

      {/* 헤더 */}
      <div className="relative z-10 w-full flex flex-col items-center pt-10 pb-6 px-4">
        <div
          style={{
            background: "linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff, #ff6b6b)",
            backgroundSize: "300% 100%",
            animation: "rainbowShift 4s linear infinite",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "2.5rem",
            fontWeight: 900,
            letterSpacing: "0.05em",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          ✨ 오늘의 운세 ✨
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginTop: 6 }}>{today}</p>

        {/* 타로 바로가기 */}
        <Link
          href="/fortune/tarot"
          style={{
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.4))",
            border: "1px solid rgba(196,181,253,0.35)",
            borderRadius: "999px",
            padding: "0.4rem 1.1rem",
            color: "#e9d5ff",
            fontWeight: 600,
            fontSize: "0.85rem",
            textDecoration: "none",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 12px rgba(124,58,237,0.3)",
            transition: "all 0.2s",
          }}
        >
          🎴 타로 리딩 보러가기
        </Link>
      </div>

      {/* 입력 폼 */}
      {!result && (
        <div
          className="relative z-10 w-full max-w-md mx-auto px-4"
          style={{ animation: "fadeInUp 0.6s ease both" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "1.5rem",
              padding: "2rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.5rem", textAlign: "center" }}>
              생년월일을 입력해주세요
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textAlign: "center", marginBottom: "1.5rem" }}>
              별자리와 띠를 바탕으로 오늘의 운세를 봐드립니다
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2">
                {/* 년도 */}
                <div className="flex-1">
                  <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginBottom: 4, display: "block" }}>
                    년
                  </label>
                  <input
                    type="number"
                    placeholder="1990"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min={1900}
                    max={2099}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "0.75rem",
                      padding: "0.6rem 0.8rem",
                      color: "#fff",
                      fontSize: "1rem",
                      outline: "none",
                    }}
                    required
                  />
                </div>
                {/* 월 */}
                <div style={{ width: 72 }}>
                  <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginBottom: 4, display: "block" }}>
                    월
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    min={1}
                    max={12}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "0.75rem",
                      padding: "0.6rem 0.8rem",
                      color: "#fff",
                      fontSize: "1rem",
                      outline: "none",
                    }}
                    required
                  />
                </div>
                {/* 일 */}
                <div style={{ width: 72 }}>
                  <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginBottom: 4, display: "block" }}>
                    일
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    min={1}
                    max={31}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "0.75rem",
                      padding: "0.6rem 0.8rem",
                      color: "#fff",
                      fontSize: "1rem",
                      outline: "none",
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: isPending
                    ? "rgba(255,255,255,0.2)"
                    : "linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff)",
                  backgroundSize: "300% 100%",
                  animation: isPending ? "none" : "rainbowShift 3s linear infinite",
                  border: "none",
                  borderRadius: "1rem",
                  padding: "0.9rem",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  cursor: isPending ? "not-allowed" : "pointer",
                  transition: "transform 0.1s",
                  boxShadow: isPending ? "none" : "0 4px 20px rgba(255,100,100,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isPending ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⭐</span>
                    운세 보는 중...
                  </>
                ) : (
                  "🔮 운세 보기"
                )}
              </button>
            </form>
          </div>

          {/* 장식 원들 */}
          <div style={{ position: "absolute", top: -30, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,100,100,0.3), transparent)", filter: "blur(20px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(100,100,255,0.3), transparent)", filter: "blur(16px)", pointerEvents: "none" }} />
        </div>
      )}

      {/* 결과 화면 */}
      {result && (
        <div
          className="relative z-10 w-full max-w-md mx-auto px-4 pb-16 flex flex-col gap-4"
          style={{ animation: "fadeInUp 0.5s ease both" }}
        >
          {/* 별자리 / 띠 뱃지 */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[result.zodiac, result.chineseZodiac].map((label) => (
              <span
                key={label}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: "999px",
                  padding: "0.3rem 1rem",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  backdropFilter: "blur(8px)",
                }}
              >
                {label}
              </span>
            ))}
            <span
              style={{
                background: "linear-gradient(135deg, rgba(255,107,107,0.4), rgba(78,150,255,0.4))",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "999px",
                padding: "0.3rem 1rem",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              오늘의 키워드: {result.todayKeyword}
            </span>
          </div>

          {/* 종합운 카드 */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(120,50,200,0.6), rgba(30,60,180,0.6))",
              border: "1px solid rgba(200,150,255,0.4)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(100,0,200,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex items-center gap-4">
              <ScoreRing score={result.overall.score} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: "1.5rem" }}>🌟</span>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem" }}>종합운</span>
                </div>
                <Stars score={result.overall.score} />
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.875rem", marginTop: 8, lineHeight: 1.6 }}>
                  {result.overall.text}
                </p>
              </div>
            </div>
          </div>

          {/* 카테고리 카드 4개 */}
          <div className="grid grid-cols-2 gap-3">
            {CATEGORY_CONFIG.map((cat) => {
              const data = result[cat.key];
              return (
                <div
                  key={cat.key}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "1.25rem",
                    padding: "1rem",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* 배경 그라디언트 블러 */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, transparent 60%, rgba(255,255,255,0.04))`,
                      borderRadius: "1.25rem",
                    }}
                  />
                  <div className="relative">
                    <div style={{ fontSize: "1.75rem", marginBottom: 4 }}>{cat.emoji}</div>
                    <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>
                      {cat.label}
                    </div>
                    <Stars score={data.score} />
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", marginTop: 6, lineHeight: 1.5 }}>
                      {data.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 행운 아이템 카드 */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,200,50,0.2), rgba(255,100,150,0.2), rgba(100,150,255,0.2))",
              border: "1px solid rgba(255,220,100,0.4)",
              borderRadius: "1.5rem",
              padding: "1.25rem",
              backdropFilter: "blur(16px)",
              boxShadow: "0 4px 24px rgba(255,200,50,0.15)",
            }}
          >
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", marginBottom: "0.75rem", textAlign: "center" }}>
              🍀 오늘의 행운 아이템
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div style={{ fontSize: "1.5rem" }}>🎨</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", marginTop: 2 }}>행운 색상</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", marginTop: 1 }}>{result.luckyColor}</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem" }}>🔢</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", marginTop: 2 }}>행운 숫자</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", marginTop: 1 }}>{result.luckyNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem" }}>✨</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", marginTop: 2 }}>행운 아이템</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", marginTop: 1 }}>{result.luckyItem}</div>
              </div>
            </div>
          </div>

          {/* 멘토링 카드 */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(20,180,120,0.25), rgba(50,100,200,0.25), rgba(150,50,200,0.25))",
              border: "2px solid rgba(100,255,180,0.4)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 40px rgba(0,200,150,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 빛나는 테두리 효과 */}
            <div
              style={{
                position: "absolute",
                top: -1,
                left: -1,
                right: -1,
                bottom: -1,
                borderRadius: "1.5rem",
                background: "linear-gradient(135deg, rgba(100,255,180,0.5), rgba(78,150,255,0.5), rgba(200,100,255,0.5))",
                zIndex: -1,
                filter: "blur(4px)",
              }}
            />
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: "1.5rem" }}>🎴</span>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem" }}>오늘의 멘토링 카드</span>
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.2)",
                borderRadius: "1rem",
                padding: "1rem",
                borderLeft: "3px solid rgba(100,255,180,0.7)",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{result.mentoring}&rdquo;
              </p>
            </div>
          </div>

          {/* 다시 보기 버튼 */}
          <button
            onClick={() => setResult(null)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "1rem",
              padding: "0.75rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            🔮 다른 생년월일로 보기
          </button>
        </div>
      )}
    </div>
  );
}
