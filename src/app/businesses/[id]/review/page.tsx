"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BUSINESSES, Review } from "@/lib/recommendation";

function RatingPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold mb-2" style={{ color: "var(--navy)" }}>{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="text-2xl transition-transform hover:scale-110"
            style={{ color: i <= value ? "var(--amber)" : "#ddd" }}
          >
            ★
          </button>
        ))}
        <span className="text-sm text-gray-400 self-center ml-1">{value}/5</span>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const biz = BUSINESSES.find((b) => b.id === id);

  const [weightLoss, setWeightLoss] = useState("");
  const [costSatisfaction, setCostSatisfaction] = useState(3);
  const [intensity, setIntensity] = useState(3);
  const [kindness, setKindness] = useState(3);
  const [revisit, setRevisit] = useState<boolean | null>(null);
  const [recommendFor, setRecommendFor] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!biz) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--beige)" }}>
        <p className="text-gray-400">업체를 찾을 수 없습니다.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (revisit === null || !comment.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      businessId: id,
      weightLoss,
      costSatisfaction,
      intensity,
      kindness,
      revisit,
      recommendFor,
      comment: comment.trim(),
      createdAt: new Date().toLocaleDateString("ko-KR"),
    };

    const stored = localStorage.getItem(`wg_reviews_${id}`);
    const existing: Review[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem(`wg_reviews_${id}`, JSON.stringify([review, ...existing]));
    setSubmitted(true);

    setTimeout(() => {
      router.push(`/businesses/${id}`);
    }, 1800);
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--navy)" }}
      >
        <div className="text-5xl">🙏</div>
        <p className="text-white font-bold text-lg">후기가 등록되었습니다</p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>잠시 후 업체 페이지로 이동합니다</p>
      </div>
    );
  }

  const canSubmit = revisit !== null && comment.trim().length > 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--beige)" }}>
      {/* 헤더 */}
      <div style={{ background: "var(--navy)" }} className="px-5 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href={`/businesses/${id}`} className="text-white text-xs opacity-60 hover:opacity-100">
            ← 업체로 돌아가기
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-8 pb-24">
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "var(--amber)" }}>
          후기 작성
        </p>
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--navy)" }}>
          {biz.name}
        </h1>
        <p className="text-xs text-gray-400 mb-8">{biz.region}</p>

        {/* 의료 면책 */}
        <div
          className="rounded-xl p-4 mb-8 text-xs text-gray-500 leading-relaxed"
          style={{ background: "white", border: "1px solid rgba(212,168,83,0.2)" }}
        >
          후기는 개인의 경험이며, 의료적 효과를 보장하지 않습니다.
          특정 약물 효과에 대한 단정적 표현은 삼가주세요.
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          {/* 감량 여부 */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--navy)" }}>
              감량 결과 <span className="text-gray-400 font-normal text-xs">(선택)</span>
            </p>
            <input
              type="text"
              placeholder="예: 2개월에 3kg 감량, 변화 없었음 등"
              value={weightLoss}
              onChange={(e) => setWeightLoss(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid rgba(30,58,95,0.12)", background: "white" }}
            />
          </div>

          <RatingPicker label="비용 만족도" value={costSatisfaction} onChange={setCostSatisfaction} />
          <RatingPicker label="관리 강도 (높을수록 강함)" value={intensity} onChange={setIntensity} />
          <RatingPicker label="친절도" value={kindness} onChange={setKindness} />

          {/* 재방문 의사 */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--navy)" }}>재방문 의사</p>
            <div className="flex gap-3">
              {[
                { label: "재방문 의향 있어요", value: true },
                { label: "재방문 안 할 것 같아요", value: false },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setRevisit(opt.value)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: revisit === opt.value ? "var(--navy)" : "white",
                    color: revisit === opt.value ? "white" : "var(--navy)",
                    border: `1.5px solid ${revisit === opt.value ? "var(--navy)" : "rgba(30,58,95,0.12)"}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 추천 대상 */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--navy)" }}>
              추천 대상 <span className="text-gray-400 font-normal text-xs">(선택)</span>
            </p>
            <input
              type="text"
              placeholder="예: 운동 싫어하는 분, 빠른 결과 원하는 분 등"
              value={recommendFor}
              onChange={(e) => setRecommendFor(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid rgba(30,58,95,0.12)", background: "white" }}
            />
          </div>

          {/* 한줄 후기 */}
          <div className="mb-8">
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--navy)" }}>
              후기 <span className="text-red-400 text-xs">*필수</span>
            </p>
            <textarea
              placeholder="솔직한 경험을 공유해주세요 (최소 10자)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ border: "1.5px solid rgba(30,58,95,0.12)", background: "white" }}
            />
            <p className="text-xs text-gray-300 mt-1 text-right">{comment.length}자</p>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all"
            style={{
              background: canSubmit ? "var(--navy)" : "var(--beige-dark)",
              color: canSubmit ? "white" : "#aaa",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            후기 등록하기
          </button>
        </form>
      </div>
    </div>
  );
}
