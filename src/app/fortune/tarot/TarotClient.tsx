"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { getTarotReading, MAJOR_ARCANA, TarotCard, TarotResult } from "./tarot-action";

const POSITIONS = ["과거", "현재", "미래"] as const;
const POSITION_EMOJIS = ["🌑", "🌕", "🌟"];
const POSITION_DESC = ["지나온 길", "지금 이 순간", "펼쳐질 가능성"];

function FloatingParticles() {
  const items = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    symbol: ["✦", "✧", "⋆", "·", "★", "☽"][i % 6],
    left: `${(i * 41 + 7) % 100}%`,
    top: `${(i * 57 + 3) % 100}%`,
    delay: `${(i * 0.25) % 4}s`,
    duration: `${4 + (i % 4)}s`,
    size: [1.2, 0.7, 0.5][i % 3],
    opacity: 0.1 + (i % 5) * 0.06,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {items.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            fontSize: `${s.size}rem`,
            opacity: s.opacity,
            animation: `fortuneStar ${s.duration} ${s.delay} ease-in-out infinite alternate`,
            color: "#c4b5fd",
          }}
        >
          {s.symbol}
        </span>
      ))}
    </div>
  );
}

function CardBack({ onClick, label, idx }: { onClick: () => void; label: string; idx: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span style={{ color: "rgba(196,181,253,0.7)", fontSize: "0.75rem", fontWeight: 600 }}>
        {POSITION_EMOJIS[idx]} {label}
      </span>
      <span style={{ color: "rgba(196,181,253,0.5)", fontSize: "0.65rem" }}>
        {POSITION_DESC[idx]}
      </span>
      <button
        onClick={onClick}
        style={{
          width: 100,
          height: 168,
          borderRadius: "0.875rem",
          background: "linear-gradient(160deg, #2d1b69, #1a0a40, #0f172a)",
          border: "2px solid rgba(196,181,253,0.4)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: "0 8px 32px rgba(100,50,200,0.4), inset 0 1px 0 rgba(196,181,253,0.15)",
          transition: "transform 0.2s, box-shadow 0.2s",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px) scale(1.03)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(100,50,200,0.6), inset 0 1px 0 rgba(196,181,253,0.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(100,50,200,0.4), inset 0 1px 0 rgba(196,181,253,0.15)";
        }}
      >
        {/* 카드 뒷면 문양 */}
        <div style={{
          position: "absolute", inset: 6,
          border: "1px solid rgba(196,181,253,0.2)",
          borderRadius: "0.5rem",
        }} />
        <div style={{
          position: "absolute", inset: 12,
          border: "1px solid rgba(196,181,253,0.1)",
          borderRadius: "0.25rem",
        }} />
        <span style={{ fontSize: "2rem", filter: "drop-shadow(0 0 8px rgba(196,181,253,0.8))" }}>✦</span>
        <span style={{ color: "rgba(196,181,253,0.6)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em" }}>
          TAROT
        </span>
        <span style={{ color: "rgba(196,181,253,0.4)", fontSize: "0.6rem" }}>클릭하여 공개</span>
      </button>
    </div>
  );
}

function CardFace({ card, posLabel, idx }: { card: TarotCard; posLabel: string; idx: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span style={{ color: "rgba(196,181,253,0.7)", fontSize: "0.75rem", fontWeight: 600 }}>
        {POSITION_EMOJIS[idx]} {posLabel}
      </span>
      <span style={{ color: "rgba(196,181,253,0.5)", fontSize: "0.65rem" }}>
        {POSITION_DESC[idx]}
      </span>
      <div
        style={{
          width: 100,
          height: 168,
          borderRadius: "0.875rem",
          background: `linear-gradient(160deg, ${card.bgFrom}, ${card.bgTo})`,
          border: "2px solid rgba(255,255,255,0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          boxShadow: `0 8px 32px ${card.bgFrom}66, inset 0 1px 0 rgba(255,255,255,0.2)`,
          transform: card.reversed ? "rotate(180deg)" : "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 5,
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "0.5rem",
          pointerEvents: "none",
        }} />
        <span
          style={{
            fontSize: "2.25rem",
            filter: "drop-shadow(0 0 10px rgba(255,255,255,0.7))",
            transform: card.reversed ? "rotate(180deg)" : "none",
          }}
        >
          {card.emoji}
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: card.reversed ? "rotate(180deg)" : "none",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.8rem", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
            {card.name}
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.55rem", letterSpacing: "0.05em" }}>
            {card.nameEn}
          </span>
          {card.reversed && (
            <span style={{
              color: "rgba(255,200,200,0.9)",
              fontSize: "0.55rem",
              fontWeight: 700,
              marginTop: 2,
              background: "rgba(0,0,0,0.3)",
              borderRadius: "4px",
              padding: "1px 6px",
            }}>
              역방향
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function FlipCard({
  card,
  isFlipped,
  onClick,
  posLabel,
  idx,
}: {
  card: TarotCard;
  isFlipped: boolean;
  onClick: () => void;
  posLabel: string;
  idx: number;
}) {
  return (
    <div style={{ perspective: "1000px" }}>
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
        }}
      >
        {/* 뒷면 */}
        <div style={{ backfaceVisibility: "hidden" }}>
          <CardBack onClick={onClick} label={posLabel} idx={idx} />
        </div>
        {/* 앞면 */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <CardFace card={card} posLabel={posLabel} idx={idx} />
        </div>
      </div>
    </div>
  );
}

function ResultCard({ title, emoji, text, gradient }: { title: string; emoji: string; text: string; gradient: string }) {
  return (
    <div
      style={{
        background: gradient,
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "1.25rem",
        padding: "1.25rem",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: "1.25rem" }}>{emoji}</span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>{title}</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.875rem", lineHeight: 1.75 }}>{text}</p>
    </div>
  );
}

function drawCards(): TarotCard[] {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((c) => ({ ...c, reversed: Math.random() < 0.35 }));
}

export default function TarotClient() {
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<TarotCard[] | null>(null);
  const [flipped, setFlipped] = useState([false, false, false]);
  const [result, setResult] = useState<TarotResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const allFlipped = flipped.every(Boolean);

  // 마지막 카드 뒤집히면 자동으로 해석 요청
  useEffect(() => {
    if (allFlipped && cards && !result && !isPending) {
      startTransition(async () => {
        const data = await getTarotReading(cards, question);
        setResult(data);
      });
    }
  }, [allFlipped]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDraw = () => {
    setCards(drawCards());
    setFlipped([false, false, false]);
    setResult(null);
  };

  const handleFlip = (idx: number) => {
    // 순서대로만 뒤집기 가능 (이전 카드가 뒤집혀야 다음 카드 뒤집기 가능)
    if (idx > 0 && !flipped[idx - 1]) return;
    if (flipped[idx]) return;
    setFlipped((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };

  const handleReset = () => {
    setCards(null);
    setFlipped([false, false, false]);
    setResult(null);
    setQuestion("");
  };

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div
      className="relative min-h-screen flex flex-col items-center"
      style={{
        background: "linear-gradient(135deg, #0f0521 0%, #1a0a3d 25%, #0a1628 50%, #1a0536 75%, #0f0521 100%)",
        backgroundSize: "400% 400%",
        animation: "fortuneBg 10s ease infinite",
      }}
    >
      <FloatingParticles />

      {/* 헤더 */}
      <div className="relative z-10 w-full flex flex-col items-center pt-10 pb-4 px-4">
        <Link
          href="/fortune"
          style={{
            position: "absolute",
            left: 20,
            top: 20,
            color: "rgba(196,181,253,0.6)",
            fontSize: "0.8rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← 운세로
        </Link>

        <div
          style={{
            background: "linear-gradient(90deg, #c4b5fd, #f9a8d4, #c4b5fd, #a5f3fc, #c4b5fd)",
            backgroundSize: "300% 100%",
            animation: "rainbowShift 4s linear infinite",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "2.2rem",
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          🎴 타로 리딩
        </div>
        <p style={{ color: "rgba(196,181,253,0.5)", fontSize: "0.8rem", marginTop: 6 }}>{today}</p>
      </div>

      {/* 질문 입력 + 뽑기 */}
      {!cards && (
        <div
          className="relative z-10 w-full max-w-md mx-auto px-4"
          style={{ animation: "fadeInUp 0.5s ease both" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(196,181,253,0.2)",
              borderRadius: "1.5rem",
              padding: "2rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 40px rgba(100,50,200,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ color: "#e9d5ff", fontWeight: 700, fontSize: "1.1rem", marginBottom: 6, textAlign: "center" }}>
              마음속 질문을 담아보세요
            </h2>
            <p style={{ color: "rgba(196,181,253,0.5)", fontSize: "0.78rem", textAlign: "center", marginBottom: "1.5rem" }}>
              질문 없이도 괜찮아요 — 타로는 지금 당신에게 필요한 것을 알고 있습니다
            </p>

            <textarea
              placeholder="예) 이 관계는 어떻게 될까요? / 지금 내가 집중해야 할 것은? (선택사항)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(196,181,253,0.2)",
                borderRadius: "0.875rem",
                padding: "0.75rem 1rem",
                color: "#e9d5ff",
                fontSize: "0.875rem",
                resize: "none",
                outline: "none",
                marginBottom: "1.25rem",
                boxSizing: "border-box",
              }}
            />

            <button
              onClick={handleDraw}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5, #7c3aed)",
                backgroundSize: "200% 100%",
                animation: "rainbowShift 3s linear infinite",
                border: "none",
                borderRadius: "1rem",
                padding: "0.9rem",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.1rem",
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(124,58,237,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              🃏 카드 3장 뽑기
            </button>

            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.875rem",
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(196,181,253,0.15)",
                borderRadius: "0.875rem",
                color: "rgba(196,181,253,0.6)",
                fontSize: "0.75rem",
                lineHeight: 1.7,
                textAlign: "center",
              }}
            >
              22장의 메이저 아르카나 중 3장을 뽑아<br />
              <strong style={{ color: "rgba(196,181,253,0.8)" }}>과거 · 현재 · 미래</strong>를 읽어드립니다
            </div>
          </div>
        </div>
      )}

      {/* 카드 3장 */}
      {cards && (
        <div
          className="relative z-10 w-full max-w-md mx-auto px-4 flex flex-col gap-5"
          style={{ animation: "fadeInUp 0.5s ease both" }}
        >
          {/* 안내 메시지 */}
          {!allFlipped && (
            <p style={{ color: "rgba(196,181,253,0.6)", fontSize: "0.8rem", textAlign: "center" }}>
              {flipped.filter(Boolean).length === 0
                ? "첫 번째 카드를 클릭해 운명을 열어보세요"
                : flipped.filter(Boolean).length === 1
                ? "두 번째 카드를 확인하세요"
                : "마지막 카드를 공개하면 해석이 시작됩니다"}
            </p>
          )}
          {allFlipped && !result && (
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "rgba(196,181,253,0.7)", fontSize: "0.85rem", animation: "fortuneStar 1.5s ease-in-out infinite alternate" }}>
                ✦ 타로가 메시지를 읽는 중...
              </span>
            </div>
          )}

          {/* 카드 3장 */}
          <div className="flex justify-center gap-4 flex-wrap">
            {cards.map((card, idx) => (
              <FlipCard
                key={idx}
                card={card}
                isFlipped={flipped[idx]}
                onClick={() => handleFlip(idx)}
                posLabel={POSITIONS[idx]}
                idx={idx}
              />
            ))}
          </div>

          {/* 해석 결과 */}
          {result && (
            <div className="flex flex-col gap-3" style={{ animation: "fadeInUp 0.6s ease both" }}>
              <div
                style={{
                  textAlign: "center",
                  color: "#e9d5ff",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: "0.05em",
                }}
              >
                ✦ 타로가 전하는 이야기 ✦
              </div>

              {/* 뽑힌 카드 요약 */}
              <div
                style={{
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(196,181,253,0.2)",
                  borderRadius: "1rem",
                  padding: "0.875rem 1rem",
                  display: "flex",
                  justifyContent: "space-around",
                  gap: 4,
                }}
              >
                {cards.map((c, i) => (
                  <div key={i} style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: "1.25rem" }}>{c.emoji}</div>
                    <div style={{ color: "#e9d5ff", fontSize: "0.7rem", fontWeight: 700, marginTop: 2 }}>{c.name}</div>
                    <div style={{ color: "rgba(196,181,253,0.5)", fontSize: "0.6rem" }}>{POSITIONS[i]}</div>
                    {c.reversed && (
                      <div style={{ color: "rgba(255,180,180,0.8)", fontSize: "0.55rem" }}>역방향</div>
                    )}
                  </div>
                ))}
              </div>

              <ResultCard
                title={`🌑 과거 — ${cards[0].name}`}
                emoji=""
                text={result.past}
                gradient="linear-gradient(135deg, rgba(30,20,60,0.8), rgba(50,30,90,0.8))"
              />
              <ResultCard
                title={`🌕 현재 — ${cards[1].name}`}
                emoji=""
                text={result.present}
                gradient="linear-gradient(135deg, rgba(30,60,80,0.8), rgba(20,80,100,0.8))"
              />
              <ResultCard
                title={`🌟 미래 — ${cards[2].name}`}
                emoji=""
                text={result.future}
                gradient="linear-gradient(135deg, rgba(60,20,80,0.8), rgba(40,10,70,0.8))"
              />

              {/* 종합 해석 */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))",
                  border: "2px solid rgba(196,181,253,0.35)",
                  borderRadius: "1.25rem",
                  padding: "1.25rem",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.25)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: "1.25rem" }}>🔮</span>
                  <span style={{ color: "#e9d5ff", fontWeight: 700, fontSize: "0.95rem" }}>종합 해석</span>
                </div>
                <p style={{ color: "rgba(233,213,255,0.9)", fontSize: "0.875rem", lineHeight: 1.8 }}>
                  {result.overall}
                </p>
              </div>

              {/* 타로의 조언 카드 */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.2), rgba(236,72,153,0.2))",
                  border: "2px solid rgba(167,243,208,0.35)",
                  borderRadius: "1.5rem",
                  padding: "1.5rem",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 40px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: "1.5rem" }}>🎴</span>
                  <span style={{ color: "#a7f3d0", fontWeight: 800, fontSize: "1.05rem" }}>타로의 조언</span>
                </div>
                <div
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "1rem",
                    padding: "1rem",
                    borderLeft: "3px solid rgba(167,243,208,0.6)",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.92)",
                      fontSize: "0.9rem",
                      lineHeight: 1.85,
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;{result.advice}&rdquo;
                  </p>
                </div>
              </div>

              {/* 다시 뽑기 */}
              <button
                onClick={handleReset}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(196,181,253,0.2)",
                  borderRadius: "1rem",
                  padding: "0.75rem",
                  color: "rgba(196,181,253,0.7)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  marginBottom: 20,
                }}
              >
                🃏 다시 뽑기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
