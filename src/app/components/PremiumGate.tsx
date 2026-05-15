"use client";

import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";

interface Props {
  children: React.ReactNode;
  feature?: string;
  description?: string;
}

export default function PremiumGate({ children, feature = "프리미엄 기능", description }: Props) {
  const { isPremium, loading } = useSubscription();

  if (loading) {
    return (
      <div className="organic-card p-8 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (isPremium) return <>{children}</>;

  return (
    <div className="organic-card overflow-hidden">
      {/* 블러 프리뷰 */}
      <div className="relative">
        <div className="p-5 blur-sm opacity-30 pointer-events-none select-none">
          {children}
        </div>

        {/* 잠금 오버레이 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6 text-center"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.82) 40%, rgba(255,255,255,0.95) 100%)",
          }}
        >
          {/* 숲 잠금 아이콘 */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-3"
            style={{ background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" strokeLinecap="round"/>
            </svg>
          </div>

          <p className="text-sm font-bold text-stone-800 mb-1">{feature}</p>
          {description && (
            <p className="text-xs text-stone-500 mb-4 max-w-[200px] leading-relaxed">{description}</p>
          )}
          {!description && <div className="mb-4"/>}

          <Link
            href="/premium"
            className="px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)" }}
          >
            프리미엄 시작 — 4,900원/월
          </Link>
          <p className="text-[10px] text-stone-400 mt-2">7일 무료 체험 · 언제든 해지</p>
        </div>
      </div>
    </div>
  );
}
