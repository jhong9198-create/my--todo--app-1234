import Image from "next/image";

export default function CalligraphyLogo() {
  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 캘리그라피 이미지 */}
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-lg"
        style={{
          background: "linear-gradient(160deg, #f5f0e6 0%, #ece5d8 100%)",
          boxShadow: "0 4px 24px rgba(60,40,10,0.13), inset 0 1px 0 rgba(255,255,255,0.8)",
          border: "1px solid rgba(160,140,110,0.18)",
        }}
      >
        <Image
          src="/KakaoTalk_20260516_032731172.png"
          alt="곁 — 나를 돌보고 내 손을 잡는건 자기 자신"
          width={1080}
          height={1080}
          priority
          className="w-full h-auto object-contain"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
