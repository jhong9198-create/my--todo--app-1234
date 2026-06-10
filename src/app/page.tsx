"use client";

import { useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/tracking";

const EMPATHY_CARDS = [
  { emoji: "🤔", text: "분명 적게 먹는데 살이 잘 안 빠져요" },
  { emoji: "🌙", text: "밤마다 야식을 못 참겠어요" },
  { emoji: "📅", text: "항상 3일 하고 포기해요" },
  { emoji: "📊", text: "정체기만 오면 무너져요" },
  { emoji: "🍽️", text: "운동보다 먹는 게 문제 같아요" },
];

export default function HomePage() {
  useEffect(() => {
    void trackEvent({ eventName: "page_view_landing" });
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "var(--warm-white)" }}>
      {/* ── Hero ── */}
      <section
        className="relative px-5 pt-14 pb-16 flex flex-col items-center text-center"
        style={{ background: "var(--navy)" }}
      >
        <span
          className="text-xs font-black tracking-widest mb-5 px-3 py-1 rounded-full"
          style={{ color: "var(--amber)", background: "rgba(212,168,83,0.15)" }}
        >
          📍 다이어트 어디가?
        </span>

        {/* 소셜 프루프 배지 */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          지금까지 50명+ 진단 완료
        </div>

        <h1 className="text-2xl font-black text-white leading-snug mb-3 max-w-xs">
          다이어트, 왜 나만
          <br />
          <span style={{ color: "var(--amber)" }}>안 될까요?</span>
        </h1>

        <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
          의지가 약한 게 아닙니다.<br />
          <strong className="text-white">반복 실패에는 이유가 있습니다.</strong><br />
          3가지 질문으로 1분 안에 찾아드립니다.
        </p>

        {/* Primary CTA */}
        <Link
          href="/quiz"
          onClick={() => void trackEvent({ eventName: "hero_cta_click" })}
          data-event="hero_cta"
          className="w-full max-w-sm py-4 rounded-2xl font-black text-base transition-transform hover:scale-[1.03] text-center block"
          style={{ background: "var(--amber)", color: "var(--navy)", boxShadow: "0 4px 20px rgba(212,168,83,0.4)" }}
        >
          지금 바로 진단하기 →
        </Link>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
          무료 · 1분 이내 · 즉시 결과
        </p>

        {/* Secondary CTA */}
        <Link
          href="/binge-program"
          onClick={() => void trackEvent({ eventName: "hero_7day_cta_click" })}
          className="w-full max-w-sm py-3.5 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] text-center block mt-3"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1.5px solid rgba(255,255,255,0.15)" }}
        >
          7일 폭식 기록 시작하기
        </Link>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
          매일 2분 기록하면 내 폭식 패턴이 보여요.
        </p>

        <div
          className="absolute bottom-0 left-0 right-0 h-6"
          style={{ background: "var(--warm-white)", borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}
        />
      </section>

      {/* ── 공감 섹션 ── */}
      <section className="px-5 pt-10 pb-12 max-w-md mx-auto">
        <p className="text-xs font-black tracking-widest text-center mb-2" style={{ color: "var(--amber)" }}>
          COMMON STRUGGLES
        </p>
        <h2 className="text-lg font-black text-center mb-8" style={{ color: "var(--navy)" }}>
          혹시 이런 경험 있으신가요?
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {EMPATHY_CARDS.map((card, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 flex flex-col gap-2${i === 4 ? " col-span-2" : ""}`}
              style={{
                background: "white",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1px solid rgba(212,168,83,0.15)",
              }}
            >
              <span className="text-2xl">{card.emoji}</span>
              <p className="text-sm font-semibold leading-snug" style={{ color: "var(--navy)" }}>
                &ldquo;{card.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 진단 안내 ── */}
      <section className="px-4 pb-10 max-w-md mx-auto">
        <div className="rounded-3xl px-6 py-8" style={{ background: "var(--navy)" }}>
          <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
            HOW IT WORKS
          </p>
          <h3 className="text-base font-black text-white mb-6 leading-snug">
            야식 · 폭식 · 작심삼일 · 정체기 · 요요
            <br />
            <span style={{ color: "rgba(255,255,255,0.55)" }}>반복되는 실패의 원인을 분석해 드립니다</span>
          </h3>

          <div className="space-y-3 mb-8">
            {[
              { step: "01", text: "3가지 질문에 답하기" },
              { step: "02", text: "나의 실패 유형 확인하기" },
              { step: "03", text: "오늘 당장 할 수 있는 행동 받기" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className="text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(212,168,83,0.2)", color: "var(--amber)" }}
                >
                  {step}
                </span>
                <span className="text-sm text-white font-medium">{text}</span>
              </div>
            ))}
          </div>

          <Link
            href="/quiz"
            onClick={() => void trackEvent({ eventName: "how_it_works_cta_click" })}
            data-event="how_it_works_cta"
            className="block w-full text-center py-4 rounded-2xl font-black text-base"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            무료 원인 분석하기 →
          </Link>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="pb-10 text-center">
        <p className="text-xs text-gray-400 px-6 leading-relaxed">
          본 서비스는 정보 제공 목적이며 의료적 진단을 대체하지 않습니다.
        </p>
        <Link href="/businesses" className="inline-block mt-4 text-xs font-semibold" style={{ color: "var(--amber)" }}>
          업체 리스트 바로 보기 →
        </Link>
      </footer>
    </main>
  );
}
