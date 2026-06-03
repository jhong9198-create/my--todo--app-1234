import Link from "next/link";

const COACHING_FEATURES = [
  "무료 플랜 모든 기능",
  "1대1 맞춤 식단·운동 플래너",
  "4주 목표 설정 및 주간 점검",
  "폭식·야식 방지 전략",
  "카카오톡 코칭 상담",
  "다이어트 탐정 리포트 PDF",
];

const FAQ = [
  {
    q: "무료로 어디까지 이용할 수 있나요?",
    a: "원인 진단, 유형 분석, 핵심 규칙 3가지까지 무료로 확인하실 수 있습니다.",
  },
  {
    q: "7일 후에도 계속 이용할 수 있나요?",
    a: "네, 구독을 유지하면 매주 새로운 미션과 분석 리포트를 받으실 수 있습니다.",
  },
  {
    q: "언제든 취소할 수 있나요?",
    a: "네, 결제일 전 언제든지 취소 가능합니다. 취소 후에도 남은 기간은 이용 가능합니다.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-12 pb-16 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "var(--amber)" }}>
            🔍 다이어트 탐정
          </p>
          <h1 className="text-2xl font-black text-white mb-3 leading-snug">
            원인만 아는 것과<br />매일 무엇을 해야 하는지 아는 것은 다릅니다
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            7일 맞춤 루틴으로 실제 변화를 시작해보세요
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        {/* 코칭 상담 플랜 */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: "var(--navy)", boxShadow: "0 8px 32px rgba(30,58,95,0.25)" }}
        >
          {/* 추천 배지 */}
          <div
            className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-black"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            추천
          </div>

          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="font-black text-lg text-white">코칭 상담</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                1대1 플래너 · 4주
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">₩20,000</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>/4주</p>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6">
            {COACHING_FEATURES.map((f, i) => (
              <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: i === 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.85)" }}>
                <span className="text-base leading-none mt-0.5" style={{ color: "var(--amber)" }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            className="w-full py-4 rounded-xl font-black text-base transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            코칭 상담 신청하기
          </button>
          <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            4주 1대1 맞춤 플래너 · ₩20,000
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-black tracking-widest mb-5" style={{ color: "var(--amber)" }}>FAQ</p>
          <div className="flex flex-col gap-5">
            {FAQ.map((item) => (
              <div key={item.q}>
                <p className="font-bold text-sm mb-1.5" style={{ color: "var(--navy)" }}>Q. {item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="text-center pt-2">
          <Link href="/" className="text-sm text-gray-400 underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
