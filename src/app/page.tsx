import Link from "next/link";
import { SERVICE_LABELS, SERVICE_ICONS, SERVICE_DESCRIPTIONS, ServiceType } from "@/lib/recommendation";

const SERVICE_TYPES: ServiceType[] = [
  'obesity_clinic',
  'oriental',
  'pt',
  'body_care',
  'meal_delivery',
  'online_coaching',
];

const STEPS = [
  { num: "01", title: "성향 테스트", desc: "운동, 식단, 기록, 비용 4가지 질문에 답합니다" },
  { num: "02", title: "맞춤 추천", desc: "답변을 분석해 나에게 맞는 다이어트 유형 TOP 3를 추천합니다" },
  { num: "03", title: "업체 탐색", desc: "추천 유형의 실제 업체 리스트와 상세 정보를 확인합니다" },
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
          <div
            className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
          >
            <span className="text-base">📍</span>
            <span className="text-white text-sm font-semibold tracking-widest">다이어트 어디가?</span>
          </div>

          <p className="text-lg font-semibold mb-4" style={{ color: "var(--amber)", letterSpacing: "0.01em" }}>
            살은 빼고 싶은데 뭘 해야 할 지 모르겠다면
          </p>

          <h1
            className="text-4xl font-bold text-white leading-tight mb-6"
            style={{ letterSpacing: "-0.025em" }}
          >
            다이어트 방법보다 먼저,<br />
            <span style={{ color: "var(--amber)" }}>나에게 맞는 선택지를</span><br />
            찾으세요
          </h1>

          <p className="text-lg leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.62)" }}>
            운동, 식단, 관리실, 병원 중<br />
            나에게 맞는 방법을 찾아드립니다
          </p>

          <p className="text-sm mb-12" style={{ color: "rgba(255,255,255,0.35)" }}>
            돈과 시간을 쓰기 전에 먼저 내 상황에 맞는<br />
            다이어트 유형과 업체를 확인하세요
          </p>

          <Link
            href="/quiz"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            내 다이어트 유형 찾기
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
            3단계로 끝납니다
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

      {/* ── 서비스 유형 미리보기 ── */}
      <section className="py-20 px-5" style={{ background: "var(--warm-white)" }}>
        <div className="max-w-md mx-auto">
          <p className="text-xs font-bold tracking-widest text-center mb-3" style={{ color: "var(--amber)" }}>
            6 TYPES
          </p>
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--navy)" }}>
            어떤 유형이 있나요?
          </h2>
          <p className="text-sm text-center mb-10 text-gray-400">
            사람마다 맞는 방법이 달라요
          </p>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {SERVICE_TYPES.map((type) => (
              <div
                key={type}
                className="p-4 rounded-xl"
                style={{
                  background: "#F9F6F0",
                  border: "1px solid rgba(212,168,83,0.22)",
                }}
              >
                <div className="text-2xl mb-2">{SERVICE_ICONS[type]}</div>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--navy)" }}>
                  {SERVICE_LABELS[type]}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">{SERVICE_DESCRIPTIONS[type]}</p>
              </div>
            ))}
          </div>

          <Link
            href="/quiz"
            className="block w-full text-center py-4 rounded-2xl font-bold text-base transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: "var(--navy)", color: "white" }}
          >
            내 유형 찾기 →
          </Link>
        </div>
      </section>

      {/* ── 타깃 공감 ── */}
      <section className="py-20 px-5" style={{ background: "var(--beige)" }}>
        <div className="max-w-md mx-auto">
          <p className="text-xs font-bold tracking-widest text-center mb-3" style={{ color: "var(--amber)" }}>
            이런 분들께 딱 맞아요
          </p>
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--navy)" }}>
            혹시 이런 고민 있으신가요?
          </h2>

          <div className="flex flex-col gap-3">
            {[
              { emoji: "😴", text: "운동하러 가기 귀찮아서 매번 미루고 있어요" },
              { emoji: "🍱", text: "식단 관리를 혼자 하면 항상 중간에 포기해요" },
              { emoji: "💉", text: "위고비·마운자로 같은 편한 방법에 관심이 있어요" },
              { emoji: "🤷", text: "PT, 클리닉, 한의원 중 어디 가야 할지 모르겠어요" },
              { emoji: "💸", text: "돈 아깝지 않은 곳, 효과 있는 곳을 찾고 있어요" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-start gap-4 p-4 rounded-xl bg-white"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section
        className="py-24 px-5 text-center"
        style={{ background: "var(--navy)" }}
      >
        <div className="max-w-md mx-auto">
          <div className="text-4xl mb-6">📍</div>
          <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
            돈 쓰기 전에 먼저<br />나에게 맞는 방법을 확인하세요
          </h2>
          <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
            7가지 질문으로 나에게 맞는 다이어트 유형과<br />실제 업체를 무료로 추천받으세요
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-transform hover:scale-105"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            무료로 시작하기 →
          </Link>
          <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            회원가입 없이 바로 이용 가능
          </p>
        </div>
      </section>
    </main>
  );
}
