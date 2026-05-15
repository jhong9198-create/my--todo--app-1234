"use client";

import Image from "next/image";

// 교체하려면 아래 URL만 바꾸면 됩니다
// Unsplash 포맷: https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&w=1440&q=85
const PHOTO_URL =
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1440&q=85";

export default function NatureBg() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* 실제 자연 사진 */}
      <Image
        src={PHOTO_URL}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* 라이트 모드 오버레이 — 화이트 안개 느낌 */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.40) 100%)",
        }}
      />

      {/* 다크 모드 오버레이 — 깊은 숲 밤 */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,20,10,0.72) 0%, rgba(5,20,10,0.55) 50%, rgba(5,20,10,0.78) 100%)",
        }}
      />

      {/* 하단 그라디언트 — 콘텐츠 가독성 보조 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.25) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
