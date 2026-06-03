"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BUSINESSES,
  REGIONS,
  PRICE_CATEGORIES,
  SERVICE_LABELS,
  SERVICE_ICONS,
  ServiceType,
  PriceCategory,
} from "@/lib/recommendation";

const ALL_TYPES: (ServiceType | "all")[] = [
  "all",
  "obesity_clinic",
  "oriental",
  "pt",
  "body_care",
  "meal_delivery",
  "online_coaching",
];

function BusinessesContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as ServiceType | null) ?? "all";

  const [activeType, setActiveType] = useState<ServiceType | "all">(initialType);
  const [activeRegion, setActiveRegion] = useState("전체");
  const [activePrice, setActivePrice] = useState<PriceCategory | "all">("all");

  const filtered = BUSINESSES.filter((b) => {
    const typeMatch = activeType === "all" || b.type === activeType;
    const regionMatch = activeRegion === "전체" || b.district === activeRegion;
    const priceMatch = activePrice === "all" || b.priceCategory === activePrice;
    return typeMatch && regionMatch && priceMatch;
  });

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-10 pb-16">
        <div className="max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 mb-5 opacity-60 hover:opacity-100">
            <span className="text-white text-xs">← 홈</span>
          </Link>
          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "var(--amber)" }}>
            📍 업체 리스트
          </p>
          <h1 className="text-2xl font-bold text-white leading-snug">
            조건에 맞는 업체를<br />찾아보세요
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        {/* 의료 면책 안내 */}
        <div
          className="rounded-xl p-4 text-xs text-gray-500 leading-relaxed"
          style={{ background: "white", border: "1px solid rgba(212,168,83,0.25)" }}
        >
          <span className="font-bold" style={{ color: "var(--amber)" }}>안내 </span>
          업체 정보는 참고용이며, 실제 효과는 개인에 따라 다를 수 있습니다.
          위고비·마운자로 등 <strong>약물 처방은 반드시 의료진과 상담</strong>하세요.
          광고 업체와 일반 후기를 구분해 표시합니다.
        </div>

        {/* 유형 필터 */}
        <div>
          <p className="text-xs font-bold mb-2 px-1" style={{ color: "var(--navy)" }}>유형</p>
          <div className="overflow-x-auto pb-1 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {ALL_TYPES.map((type) => {
                const isActive = activeType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold transition-all shrink-0"
                    style={{
                      background: isActive ? "var(--navy)" : "white",
                      color: isActive ? "white" : "var(--navy)",
                      border: `1.5px solid ${isActive ? "var(--navy)" : "rgba(30,58,95,0.12)"}`,
                    }}
                  >
                    {type !== "all" && <span>{SERVICE_ICONS[type as ServiceType]}</span>}
                    {type === "all" ? "전체" : SERVICE_LABELS[type as ServiceType]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 지역 필터 */}
        <div>
          <p className="text-xs font-bold mb-2 px-1" style={{ color: "var(--navy)" }}>지역</p>
          <div className="overflow-x-auto pb-1 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {REGIONS.map((region) => {
                const isActive = activeRegion === region;
                return (
                  <button
                    key={region}
                    onClick={() => setActiveRegion(region)}
                    className="px-3 py-2 rounded-full text-xs font-semibold transition-all shrink-0"
                    style={{
                      background: isActive ? "var(--amber)" : "white",
                      color: isActive ? "var(--navy)" : "var(--navy)",
                      border: `1.5px solid ${isActive ? "var(--amber)" : "rgba(30,58,95,0.12)"}`,
                    }}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 가격대 필터 */}
        <div>
          <p className="text-xs font-bold mb-2 px-1" style={{ color: "var(--navy)" }}>가격대</p>
          <div className="flex gap-2 flex-wrap">
            {PRICE_CATEGORIES.map(({ label, value }) => {
              const isActive = activePrice === value;
              return (
                <button
                  key={value}
                  onClick={() => setActivePrice(value as PriceCategory | "all")}
                  className="px-3 py-2 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: isActive ? "var(--navy)" : "white",
                    color: isActive ? "white" : "var(--navy)",
                    border: `1.5px solid ${isActive ? "var(--navy)" : "rgba(30,58,95,0.12)"}`,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 결과 수 */}
        <p className="text-xs text-gray-400 pt-1">
          {filtered.length}개 업체 검색됨
        </p>

        {/* 업체 카드 목록 */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">조건에 맞는 업체가 없습니다.</p>
            <p className="text-gray-300 text-xs mt-2">필터를 바꿔 다시 검색해보세요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((biz) => (
              <Link
                key={biz.id}
                href={`/businesses/${biz.id}`}
                className="bg-white rounded-2xl overflow-hidden block hover:shadow-lg transition-shadow"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{SERVICE_ICONS[biz.type]}</span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "var(--beige)", color: "var(--navy)" }}
                      >
                        {SERVICE_LABELS[biz.type]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{biz.region}</span>
                  </div>

                  <h3 className="font-bold text-base mb-1" style={{ color: "var(--navy)" }}>
                    {biz.name}
                  </h3>
                  <p className="text-xs font-semibold mb-3" style={{ color: "var(--amber)" }}>
                    {biz.priceRange}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {biz.features.map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: "var(--beige)", color: "var(--navy)", opacity: 0.85 }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <p
                    className="text-xs leading-relaxed italic text-gray-400 p-3 rounded-xl"
                    style={{ background: "rgba(245,237,216,0.4)" }}
                  >
                    {biz.reviewSummary}
                  </p>

                  <div className="mt-3 text-right">
                    <span className="text-xs font-semibold" style={{ color: "var(--amber)" }}>
                      상세보기 →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 하단 CTA */}
        <div className="pt-4">
          <Link
            href="/quiz"
            className="block w-full text-center py-4 rounded-2xl font-bold text-sm"
            style={{ background: "var(--navy)", color: "white" }}
          >
            테스트로 맞춤 추천 받기 →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--beige)" }}>
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        </div>
      }
    >
      <BusinessesContent />
    </Suspense>
  );
}
