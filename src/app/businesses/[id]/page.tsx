"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  BUSINESSES,
  SERVICE_LABELS,
  SERVICE_ICONS,
  SERVICE_TYPE_INFO,
  Review,
} from "@/lib/recommendation";
import { trackEvent } from "@/lib/tracking";

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="text-sm" style={{ color: i <= value ? "var(--amber)" : "#ddd" }}>
          ★
        </span>
      ))}
    </div>
  );
}

function ConsultModal({ bizName, bizId, onClose }: { bizName: string; bizId: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    setLoading(true);

    const diagnosis = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("wg_diagnosis") ?? "{}")
      : {};

    await trackEvent({
      eventName: "consultation_request_submitted",
      name: name.trim(),
      resultType: bizId,
      consultationIntent: bizName,
      kakaoId: contact.trim().includes("@") ? undefined : contact.trim(),
      email: contact.trim().includes("@") ? contact.trim() : undefined,
      selectedAnswers: diagnosis,
    });

    setLoading(false);
    setDone(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl p-6 pb-10"
        style={{ background: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-lg font-black mb-2" style={{ color: "var(--navy)" }}>신청 완료!</p>
            <p className="text-sm text-gray-500 mb-6">
              {bizName}에 상담 신청이 접수되었습니다.<br />
              빠른 시일 내 연락드리겠습니다.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "var(--navy)", color: "white" }}
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6" />
            <p className="font-black text-base mb-1" style={{ color: "var(--navy)" }}>상담 신청</p>
            <p className="text-xs text-gray-400 mb-6">{bizName}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">이름 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력해주세요"
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{ borderColor: "rgba(212,168,83,0.4)", background: "var(--beige)" }}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                  카카오톡 ID 또는 이메일 *
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="카카오 ID 또는 이메일"
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{ borderColor: "rgba(212,168,83,0.4)", background: "var(--beige)" }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !name.trim() || !contact.trim()}
                className="w-full py-4 rounded-2xl font-bold text-base transition-opacity disabled:opacity-40"
                style={{ background: "var(--navy)", color: "white" }}
              >
                {loading ? "신청 중..." : "상담 신청하기"}
              </button>
            </form>
            <p className="text-center text-xs text-gray-300 mt-4">연락처는 상담 목적으로만 사용됩니다</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function BusinessDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const biz = BUSINESSES.find((b) => b.id === id);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!biz) return;
    const stored = localStorage.getItem(`wg_reviews_${id}`);
    if (stored) setReviews(JSON.parse(stored));
  }, [id, biz]);

  if (!biz) {
    notFound();
    return null;
  }

  const info = SERVICE_TYPE_INFO[biz.type];

  const avgKindness = reviews.length
    ? (reviews.reduce((s, r) => s + r.kindness, 0) / reviews.length).toFixed(1)
    : null;
  const avgCost = reviews.length
    ? (reviews.reduce((s, r) => s + r.costSatisfaction, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-10 pb-20">
        <div className="max-w-md mx-auto">
          <Link href="/businesses" className="inline-flex items-center gap-1 mb-6 opacity-60 hover:opacity-100">
            <span className="text-white text-xs">← 업체 목록</span>
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{SERVICE_ICONS[biz.type]}</span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
            >
              {SERVICE_LABELS[biz.type]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{biz.name}</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{biz.region}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">
        {/* 가격 + 통계 */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl" style={{ background: "var(--beige)" }}>
              <p className="text-xs text-gray-400 mb-1">가격대</p>
              <p className="text-xs font-bold" style={{ color: "var(--amber)" }}>{biz.priceRange}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "var(--beige)" }}>
              <p className="text-xs text-gray-400 mb-1">친절도</p>
              <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>
                {avgKindness ? `★ ${avgKindness}` : "—"}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "var(--beige)" }}>
              <p className="text-xs text-gray-400 mb-1">비용만족</p>
              <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>
                {avgCost ? `★ ${avgCost}` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* 제공 서비스 */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>제공 서비스</p>
          <div className="flex flex-wrap gap-2">
            {biz.features.map((f) => (
              <span
                key={f}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: "var(--beige)", color: "var(--navy)" }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* 장점 */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>장점</p>
          <ul className="space-y-2">
            {biz.pros.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                <span style={{ color: "var(--amber)" }}>✓</span> {p}
              </li>
            ))}
          </ul>
        </div>

        {/* 주의사항 */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-black tracking-widest mb-4 text-gray-400">주의사항</p>
          <ul className="space-y-2">
            {biz.cautions.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-gray-500">
                <span className="text-red-300">!</span> {c}
              </li>
            ))}
          </ul>
        </div>

        {/* 유형 특성 (맞는/안 맞는 사람) */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--navy)" }}>
            {SERVICE_LABELS[biz.type]} 유형 특성
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: "var(--amber)" }}>이런 분께 맞아요</p>
              <ul className="space-y-1.5">
                {info.suitableFor.map((s) => (
                  <li key={s} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span style={{ color: "var(--amber)" }}>✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold mb-2 text-gray-400">이런 분께는 안 맞을 수 있어요</p>
              <ul className="space-y-1.5">
                {info.notSuitableFor.map((s) => (
                  <li key={s} className="text-xs text-gray-500 flex items-start gap-1.5">
                    <span className="text-gray-300">✗</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 의료 면책 안내 (비만클리닉) */}
        {info.medicalNote && (
          <div
            className="rounded-2xl p-5 text-xs leading-relaxed"
            style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.3)", color: "#7a6520" }}
          >
            <p className="font-bold mb-1">의료 안내</p>
            {info.medicalNote}
          </div>
        )}

        {/* 후기 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>
              방문 후기 ({reviews.length})
            </p>
            <Link
              href={`/businesses/${id}/review`}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: "var(--amber)", color: "var(--navy)" }}
            >
              후기 작성
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <p className="text-sm text-gray-400 mb-1">아직 후기가 없습니다</p>
              <p className="text-xs text-gray-300">첫 번째 후기를 남겨주세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-5"
                  style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex flex-wrap gap-3 mb-3 text-xs">
                    <div>
                      <span className="text-gray-400">비용만족 </span>
                      <StarRating value={review.costSatisfaction} />
                    </div>
                    <div>
                      <span className="text-gray-400">친절도 </span>
                      <StarRating value={review.kindness} />
                    </div>
                    <div>
                      <span className="text-gray-400">관리강도 </span>
                      <StarRating value={review.intensity} />
                    </div>
                  </div>
                  {review.weightLoss && (
                    <p className="text-xs text-gray-500 mb-2">
                      감량: <strong>{review.weightLoss}</strong>
                    </p>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">{review.comment}</p>
                  {review.recommendFor && (
                    <p className="text-xs text-gray-400">
                      추천 대상: {review.recommendFor}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-300">{review.createdAt}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: review.revisit ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                        color: review.revisit ? "#16a34a" : "#dc2626",
                      }}
                    >
                      재방문 {review.revisit ? "의향 있음" : "의향 없음"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상담 버튼 */}
        <div className="pt-2">
          <button
            onClick={() => setShowModal(true)}
            className="block w-full text-center py-4 rounded-2xl font-bold text-base transition-transform hover:scale-[1.02]"
            style={{ background: "var(--navy)", color: "white" }}
          >
            상담 신청하기 →
          </button>
          <p className="text-center text-xs mt-3 text-gray-400">
            특정 업체를 무조건 추천하지 않습니다. 직접 상담 후 결정하세요.
          </p>
        </div>
      </div>

      {showModal && (
        <ConsultModal
          bizName={biz.name}
          bizId={biz.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
