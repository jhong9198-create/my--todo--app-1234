"use client";

import { useState } from "react";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";

const FREE_FEATURES = [
  "오늘 상태 체크인 (기분/수면/스트레스)",
  "식사 & 감정 기록 (왜 먹었나요?)",
  "요일별 5분 지방태우기 운동",
  "AI 영양 코칭 (살찌는 요인/대체음식)",
  "AI 폭식 멘토링",
  "체중 그래프",
  "주간 학점 리포트 (A+~F)",
];

const PREMIUM_FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 8H4M20 8C20 8 21 9 21 12C21 15 20 16 20 16H4C4 16 3 15 3 12C3 9 4 8 4 8" strokeLinecap="round"/>
        <path d="M12 8V5M9 8V6M15 8V6" strokeLinecap="round"/>
        <path d="M8 16V19M16 16V19" strokeLinecap="round"/>
      </svg>
    ),
    color: "from-indigo-500 to-violet-600",
    title: "AI 공감 메시지",
    desc: "오늘 기분·스트레스·수면을 분석해 나에게 꼭 맞는 따뜻한 메시지 생성",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" strokeLinejoin="round"/>
      </svg>
    ),
    color: "from-rose-500 to-red-600",
    title: "폭식 위험 예측",
    desc: "스트레스·수면·기분 데이터로 오늘 폭식 가능성을 미리 파악하고 예방",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 6H21M3 12H21M3 18H21" strokeLinecap="round"/>
        <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
        <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
        <circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"/>
      </svg>
    ),
    color: "from-amber-500 to-orange-500",
    title: "스트레스 & 식습관 연결",
    desc: "스트레스 수준별 폭식 발생률 분석 — 내 패턴의 숨겨진 원인 발견",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M9.5 2C9.5 2 8 6 8 9.5C8 13 10 15 12 15C14 15 16 13 16 9.5C16 6 14.5 2 14.5 2" strokeLinecap="round"/>
        <path d="M12 15V22M8 22H16" strokeLinecap="round"/>
        <path d="M5 9C5 9 3 10 3 12.5C3 15 5 16 7 15.5" strokeLinecap="round"/>
        <path d="M19 9C19 9 21 10 21 12.5C21 15 19 16 17 15.5" strokeLinecap="round"/>
      </svg>
    ),
    color: "from-emerald-500 to-teal-600",
    title: "AI 심층 감정패턴 분석",
    desc: "스트레스 연관성 · 수면 부족 패턴 · 특정 장소 연관성",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9L12 4L21 9L12 14L3 9Z" strokeLinejoin="round"/>
        <path d="M3 14L12 19L21 14" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "from-sky-500 to-blue-600",
    title: "주간 회복 리포트",
    desc: "가장 지친 요일 · 반복 감정 · 식습관 변화 흐름 종합 분석",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3C7 3 4 7 4 12C4 16 7 20 12 20C12 20 14 18 14 15C14 12 12 11 12 8C12 5.5 13.5 3.5 16 3C14.8 3.1 12 3 12 3Z" strokeLinejoin="round"/>
        <path d="M16 3C18 5 20 8 20 12C20 16 17.5 19.5 14 21" strokeLinecap="round"/>
      </svg>
    ),
    color: "from-green-500 to-emerald-600",
    title: "AI 회복 루틴 추천",
    desc: "수면 회복 플랜 · 저강도 운동 · 현실 식단 제안",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 2V6M16 2V6M3 10H21" strokeLinecap="round"/>
        <path d="M8 14H8.01M12 14H12.01M16 14H16.01M8 17H8.01M12 17H12.01" strokeLinecap="round" strokeWidth="2.5"/>
      </svg>
    ),
    color: "from-fuchsia-500 to-purple-600",
    title: "감정기록 타임라인",
    desc: "모든 감정 기록을 시간순으로 — 내가 왜 무너지는지 이해",
  },
];

const TESTIMONIALS = [
  { quote: "왜 또 야식을 시켰는지 이해가 안 돼", answer: "AI가 패턴을 찾아줘요" },
  { quote: "의지력 문제가 아닌 것 같은데", answer: "수면·스트레스 연관성을 분석해줘요" },
  { quote: "기록은 하는데 뭐가 달라지는지 모르겠어", answer: "타임라인으로 변화 흐름을 보여줘요" },
];

export default function PremiumPage() {
  const { isPremium, loading, activate, deactivate, daysLeft } = useSubscription();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleActivate() {
    if (!code.trim()) { setError("코드를 입력해주세요"); return; }
    const ok = activate(code);
    if (ok) {
      setSuccess(true);
      setError("");
    } else {
      setError("유효하지 않은 코드예요. 다시 확인해주세요.");
    }
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-all backdrop-blur-sm"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">프리미엄 플랜</h1>
            <p className="text-xs text-stone-400 mt-0.5">내가 왜 무너지는지 이해하는 앱</p>
          </div>
        </div>

        {/* 구독 중 배너 */}
        {!loading && isPremium && (
          <div className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 13L9 17L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">프리미엄 구독 중</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">만료까지 {daysLeft()}일 남았어요</p>
                </div>
              </div>
              <button
                onClick={deactivate}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                해지
              </button>
            </div>
          </div>
        )}

        {/* 히어로 — 자연 숲속 글래스 카드 */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* 배경 레이어: 숲 그라디언트 */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, #1a4731 0%, #2d6a4f 30%, #40916c 55%, #74c69d 80%, #b7e4c7 100%)",
            }}
          />
          {/* 나뭇잎 SVG 장식 */}
          <svg
            viewBox="0 0 420 260"
            className="absolute inset-0 w-full h-full opacity-[0.18]"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <ellipse cx="370" cy="30" rx="110" ry="55" fill="white" transform="rotate(-30 370 30)"/>
            <ellipse cx="50" cy="200" rx="90" ry="45" fill="white" transform="rotate(20 50 200)"/>
            <ellipse cx="210" cy="240" rx="70" ry="35" fill="white" transform="rotate(-15 210 240)"/>
            <circle cx="340" cy="180" r="55" fill="white" opacity="0.5"/>
            <circle cx="80" cy="60" r="40" fill="white" opacity="0.4"/>
          </svg>
          {/* 실제 콘텐츠 */}
          <div className="relative px-7 py-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-3">월간 플랜</p>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-6xl font-black tracking-tight">4,900</span>
              <span className="text-lg font-semibold text-white/75">원/월</span>
            </div>
            <p className="text-sm text-white/65 mb-1">하루 163원 — 커피 한 잔보다 저렴하게</p>
            <p className="text-xs text-white/45">언제든 해지 가능 · 7일 무료 체험</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#52b788","#74c69d","#95d5b2"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white/40"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/60">지금 함께하는 회복 중인 사람들</p>
            </div>
          </div>

          {/* 하단 화이트 글래스 — 기능 목록 */}
          <div className="relative bg-white/[0.12] backdrop-blur-md border-t border-white/[0.18] px-7 py-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-4">프리미엄 전용</p>
            <div className="space-y-3.5">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{f.title}</p>
                    <p className="text-xs text-white/55 leading-snug mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 결제 / 코드 영역 */}
        {!isPremium && (
          <div className="organic-card p-5 space-y-4">
            {success ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13L9 17L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-base font-bold text-green-700 dark:text-green-400">프리미엄이 활성화됐어요!</p>
                <p className="text-xs text-stone-400">이제 모든 기능을 자유롭게 사용하세요</p>
                <Link
                  href="/"
                  className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors"
                >
                  홈으로 돌아가기 →
                </Link>
              </div>
            ) : (
              <>
                {/* 결제 CTA */}
                <button
                  onClick={() => alert("결제 연동 준비 중이에요!\n아래 테스트 코드로 체험해보세요 → PREMIUM4900")}
                  className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl transition-all active:scale-[0.98] overflow-hidden relative"
                  style={{
                    background: "linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #52b788 100%)",
                  }}
                >
                  <span className="relative z-10">지금 시작하기 — 4,900원/월</span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"/>
                </button>
                <p className="text-xs text-stone-400 text-center">카카오페이 · 토스페이 · 신용카드</p>

                {/* 구분선 */}
                <div className="relative flex items-center">
                  <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700"/>
                  <span className="px-3 text-xs text-stone-400">또는 코드로 시작</span>
                  <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700"/>
                </div>

                {/* 코드 입력 */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setError(""); }}
                      placeholder="활성화 코드 입력"
                      className="flex-1 px-4 py-3 text-sm border border-stone-200 dark:border-stone-700 rounded-xl bg-white/60 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-shadow"
                      onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                    />
                    <button
                      onClick={handleActivate}
                      className="px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
                      style={{ background: "linear-gradient(135deg, #2d6a4f, #52b788)" }}
                    >
                      확인
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span>✕</span>{error}
                    </p>
                  )}
                  <p className="text-xs text-stone-400">
                    테스트 코드:{" "}
                    <button
                      onClick={() => setCode("PREMIUM4900")}
                      className="text-emerald-600 dark:text-emerald-400 font-mono underline underline-offset-2 hover:text-emerald-800"
                    >
                      PREMIUM4900
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* 공감 카드 */}
        <div className="organic-card p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">이런 분께 맞아요</p>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(82,183,136,0.08) 0%, rgba(64,145,108,0.05) 100%)",
                border: "1px solid rgba(82,183,136,0.15)",
              }}
            >
              <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-emerald-600 dark:text-emerald-400" stroke="currentColor" strokeWidth="2.5">
                  <path d="M8 12L10.5 14.5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">"{t.quote}"</p>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">→ {t.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 무료 플랜 포함 목록 */}
        <div className="organic-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4">무료 플랜에도 포함돼요</p>
          <div className="grid grid-cols-1 gap-2">
            {FREE_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full border border-green-300 dark:border-green-700 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"/>
                </div>
                <span className="text-xs text-stone-600 dark:text-stone-400">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-4"/>
      </div>
    </main>
  );
}
