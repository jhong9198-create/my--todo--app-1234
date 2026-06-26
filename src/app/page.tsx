"use client";

import { useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/tracking";

const BENEFIT_CARDS = [
  { emoji: "🎯", title: "실패 원인 파악", text: "왜 반복해서 실패하는지 드디어 알게 돼요" },
  { emoji: "🗓️", title: "위험 패턴 발견", text: "내가 무너지는 요일·시간대가 데이터로 보여요" },
  { emoji: "🧠", title: "자책에서 해방", text: "의지 문제가 아니었음을 확인하고 마음이 편해져요" },
  { emoji: "💬", title: "같은 사람들과 연결", text: "같은 유형끼리 오픈채팅에서 솔직하게 이야기해요" },
  { emoji: "📊", title: "폭식 트리거 리포트", text: "7일 기록하면 나만의 충동 패턴 리포트가 생겨요" },
  { emoji: "🔄", title: "반복 실수 방지", text: "다음 다이어트에서 같은 실수를 반복하지 않아요" },
];

const EMPATHY_SCENARIOS = [
  { emoji: "🌙", label: "야식 반복형", hook: "밤만 되면 먹고 싶어져요", detail: "낮엔 잘 참는데 밤 10시만 넘으면 무너져요. 배가 고픈 게 아닌데도요.", risk: 82 },
  { emoji: "😤", label: "스트레스 폭식형", hook: "힘든 날엔 결국 먹게 돼요", detail: "스트레스받으면 뭘 먹어야 풀려요. 먹고 나면 자책하는데 또 반복돼요.", risk: 88 },
  { emoji: "📅", label: "작심삼일형", hook: "3일은 버티는데 그 다음이 문제", detail: "시작은 매번 독하게 해요. 근데 딱 3~5일 지나면 흐지부지돼요.", risk: 74 },
  { emoji: "📊", label: "정체기 좌절형", hook: "열심히 했는데 왜 안 빠지죠?", detail: "2주는 잘 빠지다가 갑자기 멈춰요. 그 순간부터 의욕이 사라져요.", risk: 68 },
  { emoji: "🍻", label: "회식 무너짐형", hook: "혼자선 잘 참는데 술자리에서...", detail: "분위기상 어쩔 수 없잖아요. 근데 그 다음 날부터 며칠이 망가져요.", risk: 71 },
  { emoji: "🏃", label: "운동 회피형", hook: "식단은 하는데 운동은 도저히", detail: "헬스장 등록해놓고 안 가요. 식단만으로 버티다가 요요가 와요.", risk: 62 },
];

const STATS = [
  { num: "10명 중 9명", desc: "다이어트 실패 후\n'의지가 약해서'라고 자책합니다", sub: "실제 원인은 따로 있어요" },
  { num: "평균 3.2회", desc: "같은 방식으로\n반복 실패하는 횟수", sub: "패턴을 모르면 계속 반복돼요" },
  { num: "88%", desc: "스트레스 폭식형이\n3개월 내 재발하는 비율", sub: "원인을 알면 막을 수 있어요" },
];

export default function HomePage() {
  useEffect(() => {
    void trackEvent({ eventName: "page_view_landing" });
    const startTime = Date.now();

    const handleUnload = () => {
      const seconds = Math.round((Date.now() - startTime) / 1000);
      const payload = JSON.stringify({ eventName: "page_exit_landing", interest: String(seconds) });
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "var(--warm-white)" }}>
      {/* ── Hero ── */}
      <section
        className="relative px-5 pt-14 pb-20 flex flex-col items-center text-center"
        style={{ background: "var(--navy)" }}
      >
        <span
          className="text-xs font-black tracking-widest mb-5 px-3 py-1 rounded-full"
          style={{ color: "var(--amber)", background: "rgba(212,168,83,0.15)" }}
        >
          📍 다이어트 어디가?
        </span>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          지금까지 50명+ 진단 완료
        </div>

        <h1 className="text-2xl font-black text-white leading-snug mb-3 max-w-xs">
          또 참았는데<br />
          <span style={{ color: "var(--amber)" }}>결국 먹었죠?</span>
        </h1>

        <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
          배가 고픈 게 아닌데 손이 가요.<br />
          의지 문제가 아니에요 —<br />
          <strong className="text-white">이게 반복되는 데는 당신만의 패턴이 있어요.</strong>
        </p>

        {/* 혜택 체크리스트 */}
        <div className="w-full max-w-sm mb-8 text-left space-y-2.5">
          {[
            "왜 그 순간 무너지는지 원인을 알게 돼요",
            "내가 취약한 시간대·상황이 데이터로 보여요",
            "패턴을 알면 다음엔 막을 수 있어요",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                style={{ background: "var(--amber)", color: "var(--navy)" }}
              >✓</span>
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <Link
          href="/quiz"
          onClick={() => void trackEvent({ eventName: "hero_cta_click" })}
          data-event="hero_cta"
          className="w-full max-w-sm py-4 rounded-2xl font-black text-base transition-transform hover:scale-[1.03] text-center block"
          style={{ background: "var(--amber)", color: "var(--navy)", boxShadow: "0 4px 20px rgba(212,168,83,0.4)" }}
        >
          내 실패 패턴 1분에 찾기 →
        </Link>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
          무료 · 1분 이내 · 즉시 결과
        </p>

        {/* Secondary CTA */}
        <Link
          href="/checkin"
          onClick={() => void trackEvent({ eventName: "hero_checkin_cta_click" })}
          className="w-full max-w-sm py-3.5 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] text-center block mt-3"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1.5px solid rgba(255,255,255,0.15)" }}
        >
          오늘 폭식 충동 기록하기
        </Link>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
          하루 5초 기록 → 7일 후 나만의 패턴 리포트
        </p>

        <div
          className="absolute bottom-0 left-0 right-0 h-6"
          style={{ background: "var(--warm-white)", borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}
        />
      </section>

      {/* ── 공감 훅 섹션 ── */}
      <section className="pt-10 pb-4 max-w-md mx-auto">
        <p className="text-xs font-black tracking-widest text-center mb-2 px-5" style={{ color: "var(--amber)" }}>
          혹시 이런 경험 있으세요?
        </p>
        <h2 className="text-lg font-black text-center mb-1 px-5" style={{ color: "var(--navy)" }}>
          읽다가 내 얘기 나옵니다
        </h2>
        <p className="text-xs text-center text-gray-400 mb-6 px-5">← 밀어서 보기</p>

        <div className="flex gap-3 overflow-x-auto pb-4 px-5 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
          {EMPATHY_SCENARIOS.map((s, i) => (
            <div key={i} className="rounded-2xl p-5 flex-shrink-0 w-64 snap-start flex flex-col gap-3"
              style={{ background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid rgba(212,168,83,0.15)" }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
                <span className="text-xs font-black px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(212,168,83,0.12)", color: "var(--amber)" }}>
                  {s.label}
                </span>
              </div>
              <p className="font-black text-sm leading-snug" style={{ color: "var(--navy)" }}>
                "{s.hook}"
              </p>
              <p className="text-xs leading-relaxed text-gray-500">{s.detail}</p>
              <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-xs text-gray-400 mb-1">이 유형 재발 가능성</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)", height: 5 }}>
                    <div className="h-full rounded-full" style={{ width: `${s.risk}%`, background: s.risk >= 80 ? "#E05252" : s.risk >= 70 ? "#E67E22" : "var(--amber)" }} />
                  </div>
                  <span className="text-xs font-black shrink-0" style={{ color: s.risk >= 80 ? "#E05252" : s.risk >= 70 ? "#E67E22" : "var(--amber)" }}>
                    {s.risk}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 mt-2">
          <Link
            href="/quiz"
            onClick={() => void trackEvent({ eventName: "empathy_section_cta_click" })}
            className="block w-full text-center py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
            style={{ background: "var(--navy)", color: "var(--amber)" }}
          >
            내 유형이 뭔지 1분 진단하기 →
          </Link>
        </div>
      </section>

      {/* ── 통계 훅 섹션 ── */}
      <section className="px-5 pt-8 pb-10 max-w-md mx-auto">
        <p className="text-xs font-black tracking-widest text-center mb-6" style={{ color: "var(--amber)" }}>
          데이터로 보면 이렇습니다
        </p>
        <div className="space-y-3">
          {STATS.map((stat, i) => (
            <div key={i} className="rounded-2xl p-5 flex items-center gap-5"
              style={{ background: i === 1 ? "var(--navy)" : "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="shrink-0 text-center w-24">
                <p className="text-xl font-black leading-tight" style={{ color: i === 1 ? "var(--amber)" : "var(--navy)" }}>
                  {stat.num}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold leading-snug mb-1 whitespace-pre-line"
                  style={{ color: i === 1 ? "rgba(255,255,255,0.85)" : "var(--navy)" }}>
                  {stat.desc}
                </p>
                <p className="text-xs" style={{ color: i === 1 ? "rgba(255,255,255,0.4)" : "var(--amber)" }}>
                  {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 혜택 섹션 ── */}
      <section className="px-5 pt-10 pb-12 max-w-md mx-auto">
        <p className="text-xs font-black tracking-widest text-center mb-2" style={{ color: "var(--amber)" }}>
          WHAT YOU GET
        </p>
        <h2 className="text-lg font-black text-center mb-2" style={{ color: "var(--navy)" }}>
          이걸 알게 되면 달라져요
        </h2>
        <p className="text-xs text-center text-gray-400 mb-8">진단 + 매일 체크인으로 얻는 변화</p>

        <div className="grid grid-cols-2 gap-3">
          {BENEFIT_CARDS.map((card, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 flex flex-col gap-2"
              style={{
                background: "white",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1px solid rgba(212,168,83,0.15)",
              }}
            >
              <span className="text-2xl">{card.emoji}</span>
              <p className="text-xs font-black" style={{ color: "var(--amber)" }}>{card.title}</p>
              <p className="text-xs leading-snug" style={{ color: "var(--navy)" }}>{card.text}</p>
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

      {/* ── 카카오 오픈채팅 ── */}
      <section className="px-4 pb-10 max-w-md mx-auto">
        <div className="rounded-3xl overflow-hidden" style={{ border: "2px solid var(--navy)" }}>
          <div className="px-6 py-5" style={{ background: "var(--navy)" }}>
            <p className="text-xs font-black tracking-widest mb-1" style={{ color: "var(--amber)" }}>FREE COMMUNITY</p>
            <p className="font-black text-white text-base leading-snug">
              다이어트 고민, 혼자 하지 마세요
            </p>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              오픈채팅에서 같이 이야기해요
            </p>
          </div>
          <div className="bg-white px-6 py-5">
            <a
              href="https://open.kakao.com/o/pJpkL2yi"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void trackEvent({ eventName: "kakao_openchat_landing_clicked" })}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
              style={{ background: "#FEE500", color: "#3A1D1D" }}
            >
              <span className="text-xl">💬</span>
              <span>카카오 오픈채팅 참여하기</span>
            </a>
            <p className="text-xs text-gray-400 text-center mt-3">무료 · 부담 없음 · 언제든 나갈 수 있어요</p>
          </div>
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
