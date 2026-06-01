import Link from "next/link";

const USER_TYPES = [
  { emoji: "🌙", label: "야식 반복형", desc: "밤마다 배달앱이 저절로 열려요" },
  { emoji: "⚡", label: "스트레스 폭식형", desc: "힘든 일이 생기면 먹게 돼요" },
  { emoji: "📋", label: "계획 과부화형", desc: "완벽하게 하려다 통째로 포기해요" },
  { emoji: "🔋", label: "의지소진형", desc: "저녁만 되면 의지가 사라져요" },
  { emoji: "📉", label: "체중 정체 좌절형", desc: "열심히 해도 체중이 안 빠져요" },
];

const STEPS = [
  { num: "01", title: "원인 진단", desc: "4가지 핵심 질문으로 당신의 다이어트 실패 패턴을 분석합니다" },
  { num: "02", title: "유형 분석", desc: "5가지 유형 중 당신에게 딱 맞는 유형과 핵심 원인을 찾아냅니다" },
  { num: "03", title: "맞춤 루틴 제공", desc: "유형별 3가지 핵심 규칙과 7일 실천 미션을 제공합니다" },
];

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="min-h-screen flex flex-col items-center justify-center px-5 py-24 text-center"
        style={{ background: "var(--navy)" }}
      >
        <div className="max-w-md w-full">
          {/* 배지 */}
          <div
            className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
          >
            <span className="text-base">🔍</span>
            <span className="text-white text-sm font-semibold tracking-widest">다이어트 탐정</span>
          </div>

          <h1
            className="text-4xl font-bold text-white leading-tight mb-6"
            style={{ letterSpacing: "-0.025em" }}
          >
            살이 안 빠지는 이유,<br />
            <span style={{ color: "var(--amber)" }}>당신 문제가 아닙니다</span>
          </h1>

          <p className="text-lg leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.62)" }}>
            반복되는 식습관 패턴을 찾아드립니다
          </p>

          <Link
            href="/diagnosis"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            내 다이어트 원인 분석하기
            <span className="text-lg">→</span>
          </Link>

          <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            4가지 질문 · 무료 · 2분 소요
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-5" style={{ background: "var(--beige)" }}>
        <div className="max-w-md mx-auto">
          <p className="text-xs font-bold tracking-widest text-center mb-3" style={{ color: "var(--amber)" }}>
            HOW IT WORKS
          </p>
          <h2 className="text-2xl font-bold text-center mb-12" style={{ color: "var(--navy)" }}>
            어떻게 작동하나요?
          </h2>

          <div className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="flex gap-5 items-start p-6 rounded-2xl bg-white"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <span
                  className="text-2xl font-black shrink-0 leading-none pt-0.5"
                  style={{ color: "var(--amber)" }}
                >
                  {step.num}
                </span>
                <div>
                  <p className="font-bold mb-1" style={{ color: "var(--navy)" }}>{step.title}</p>
                  <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 유형 미리보기 ── */}
      <section className="py-20 px-5" style={{ background: "var(--warm-white)" }}>
        <div className="max-w-md mx-auto">
          <p className="text-xs font-bold tracking-widest text-center mb-3" style={{ color: "var(--amber)" }}>
            5 TYPES
          </p>
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--navy)" }}>
            당신은 어떤 유형인가요?
          </h2>

          <div className="flex flex-col gap-3 mb-10">
            {USER_TYPES.map((type) => (
              <div
                key={type.label}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: "#F9F6F0",
                  border: "1px solid rgba(212,168,83,0.22)",
                }}
              >
                <span className="text-2xl">{type.emoji}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>{type.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/diagnosis"
            className="block w-full text-center py-4 rounded-2xl font-bold text-base transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: "var(--navy)", color: "white" }}
          >
            내 유형 찾기 →
          </Link>
        </div>
      </section>

      {/* ── 신뢰 지표 ── */}
      <section className="py-16 px-5" style={{ background: "var(--beige)" }}>
        <div className="max-w-md mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { num: "4가지", label: "핵심 질문" },
            { num: "5가지", label: "다이어트 유형" },
            { num: "7일", label: "맞춤 루틴" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-white" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p className="text-xl font-black mb-1" style={{ color: "var(--amber)" }}>{item.num}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section
        className="py-24 px-5 text-center"
        style={{ background: "var(--navy)" }}
      >
        <div className="max-w-md mx-auto">
          <div className="text-4xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
            지금 바로 원인을<br />찾아보세요
          </h2>
          <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
            4가지 질문으로 나만의 다이어트 실패 이유와<br />해결책을 무료로 확인하세요
          </p>
          <Link
            href="/diagnosis"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-transform hover:scale-105"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            내 다이어트 원인 분석하기 →
          </Link>
        </div>
      </section>
    </main>
  );
}
