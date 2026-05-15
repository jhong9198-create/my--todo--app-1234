export default function CalligraphyLogo() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden px-6 py-5 flex items-center gap-5"
      style={{
        background: "linear-gradient(135deg, #f5f0e8 0%, #ede8dc 60%, #e8e0d0 100%)",
        boxShadow: "0 2px 12px rgba(60,40,20,0.10), inset 0 1px 0 rgba(255,255,255,0.7)",
        border: "1px solid rgba(160,140,110,0.25)",
      }}
    >
      {/* 종이 텍스처 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 왼쪽: 붓글씨 "곁" */}
      <div className="relative shrink-0 flex flex-col items-center">
        <span
          className="text-[72px] leading-none text-stone-900 select-none"
          style={{
            fontFamily: "var(--font-brush), 'Nanum Brush Script', cursive",
            textShadow: "1px 2px 4px rgba(30,20,10,0.18)",
            letterSpacing: "-0.02em",
          }}
        >
          곁
        </span>

        {/* 수묵화 스타일 밑줄 */}
        <svg viewBox="0 0 80 10" className="w-16 mt-[-4px]" aria-hidden="true">
          <path
            d="M4 5 Q20 2 40 5 Q60 8 76 4"
            fill="none"
            stroke="#2a2010"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.45"
          />
        </svg>
      </div>

      {/* 구분선 */}
      <div
        className="self-stretch w-px shrink-0"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(100,80,50,0.25), transparent)" }}
      />

      {/* 오른쪽: 부제목 */}
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <p
          className="text-[15px] leading-relaxed text-stone-800"
          style={{
            fontFamily: "var(--font-brush), 'Nanum Brush Script', cursive",
            textShadow: "0 1px 2px rgba(30,20,10,0.10)",
          }}
        >
          나를 돌보고
        </p>
        <p
          className="text-[15px] leading-relaxed text-stone-800"
          style={{
            fontFamily: "var(--font-brush), 'Nanum Brush Script', cursive",
            textShadow: "0 1px 2px rgba(30,20,10,0.10)",
          }}
        >
          내 손을 잡는 건
        </p>
        <p
          className="text-[17px] leading-relaxed font-medium text-stone-900"
          style={{
            fontFamily: "var(--font-brush), 'Nanum Brush Script', cursive",
            textShadow: "0 1px 3px rgba(30,20,10,0.14)",
          }}
        >
          내 자신
        </p>
      </div>

      {/* 오른쪽 하단 잎새 장식 */}
      <svg
        viewBox="0 0 40 40"
        className="absolute bottom-2 right-3 w-8 h-8 opacity-30"
        aria-hidden="true"
      >
        <path d="M20 35 C20 35 8 25 10 15 C12 5 20 5 20 5 C20 5 28 5 30 15 C32 25 20 35 20 35Z"
          fill="#4a6741" />
        <path d="M20 35 L20 5" stroke="#3a5530" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M20 20 C15 18 12 14 13 11" stroke="#3a5530" strokeWidth="0.6" fill="none" opacity="0.5" />
        <path d="M20 25 C25 22 27 18 26 14" stroke="#3a5530" strokeWidth="0.6" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}
