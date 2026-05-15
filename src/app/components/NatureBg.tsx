export default function NatureBg() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    >
      {/* 웜그레이 베이스 */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(170deg, #f2ede8 0%, #eae5df 40%, #e3ddd6 100%)",
        }}
      />
      {/* 다크모드 */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(170deg, #1c1917 0%, #191613 100%)",
        }}
      />
      {/* 종이 그레인 */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
