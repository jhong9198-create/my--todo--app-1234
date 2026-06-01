import Image from "next/image";

export default function CalligraphyLogo() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shrink-0"
      style={{
        width: 112,
        height: 112,
        background: "#f5f0e8",
        boxShadow: "0 1px 8px rgba(60,40,10,0.09), inset 0 1px 0 rgba(255,255,255,0.7)",
        border: "1px solid rgba(160,140,110,0.18)",
      }}
    >
      <Image
        src="/KakaoTalk_20260516_032731172.png"
        alt="다이어트 탐정"
        fill
        priority
        sizes="112px"
        className="object-contain"
      />
    </div>
  );
}
