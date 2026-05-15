export default function CalligraphyLogo() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden px-6 py-7 flex flex-col items-center gap-4"
      style={{
        background: "linear-gradient(160deg, #f7f2e9 0%, #ede8dc 55%, #e5ddd0 100%)",
        boxShadow: "0 2px 16px rgba(60,40,20,0.10), inset 0 1px 0 rgba(255,255,255,0.75)",
        border: "1px solid rgba(160,140,110,0.22)",
      }}
    >
      {/* 종이 텍스처 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
          opacity: 0.35,
        }}
      />

      {/* 잎새 장식 — 우상단 */}
      <svg
        viewBox="0 0 60 60"
        className="absolute top-3 right-4 w-10 h-10 opacity-20"
        aria-hidden="true"
      >
        <path d="M30 52 C30 52 12 38 15 22 C18 8 30 8 30 8 C30 8 42 8 45 22 C48 38 30 52 30 52Z" fill="#4a6741"/>
        <path d="M30 52 L30 8" stroke="#3a5530" strokeWidth="1" fill="none" opacity="0.55"/>
        <path d="M30 30 C22 27 18 20 20 15" stroke="#3a5530" strokeWidth="0.8" fill="none" opacity="0.45"/>
        <path d="M30 38 C38 34 41 27 39 21" stroke="#3a5530" strokeWidth="0.8" fill="none" opacity="0.45"/>
      </svg>

      {/* 붓글씨 "곁" */}
      <div className="relative flex flex-col items-center">
        <span
          className="leading-none text-stone-900 select-none"
          style={{
            fontFamily: "var(--font-brush), 'Nanum Brush Script', cursive",
            fontSize: "clamp(72px, 20vw, 96px)",
            textShadow: "2px 3px 6px rgba(30,20,10,0.20)",
            letterSpacing: "-0.02em",
          }}
        >
          곁
        </span>

        {/* 수묵 밑줄 */}
        <svg viewBox="0 0 120 10" className="w-28 mt-[-6px]" aria-hidden="true">
          <path
            d="M6 5 Q30 2 60 5.5 Q90 8.5 114 4"
            fill="none"
            stroke="#2a2010"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.35"
          />
        </svg>
      </div>

      {/* 구분 — 짧은 점선 */}
      <div className="flex items-center gap-1.5 opacity-30">
        {[0,1,2].map(i => (
          <div key={i} className="w-1 h-1 rounded-full bg-stone-600" />
        ))}
      </div>

      {/* 메인 문구 */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p
          className="leading-snug text-stone-800"
          style={{
            fontFamily: "var(--font-brush), 'Nanum Brush Script', cursive",
            fontSize: "clamp(22px, 6vw, 30px)",
            textShadow: "0 1px 3px rgba(30,20,10,0.12)",
          }}
        >
          나를 돌보는 건
        </p>
        <p
          className="text-stone-900"
          style={{
            fontFamily: "var(--font-brush), 'Nanum Brush Script', cursive",
            fontSize: "clamp(28px, 8vw, 38px)",
            textShadow: "1px 2px 5px rgba(30,20,10,0.18)",
            letterSpacing: "0.02em",
          }}
        >
          나 자신
        </p>
      </div>
    </div>
  );
}
