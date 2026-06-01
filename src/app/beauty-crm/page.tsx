"use client";

import { useState } from "react";

interface CRMResult {
  kakao: string[];
  sms: string[];
  reservation: string | null;
  avoid: string | null;
}

const 업종Options = ["피부관리샵", "네일샵", "왁싱샵", "눈썹·속눈썹샵", "헤어샵", "기타"];
const 고객유형Options = ["신규 고객", "단골 고객", "장기 미방문 고객", "VIP 고객"];
const 마지막방문Options = ["1주일 이내", "2~4주", "1~2개월", "3~6개월", "6개월 이상"];
const 연락목적Options = ["재방문 유도", "프로모션 안내", "생일 축하", "계절 케어 안내", "신메뉴 안내", "감사 인사"];
const 응대톤Options = [
  { label: "따뜻하고 친근하게", emoji: "🤗" },
  { label: "정중하고 공손하게", emoji: "🙏" },
  { label: "캐주얼하고 밝게", emoji: "😊" },
  { label: "전문적으로", emoji: "💼" },
];

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="px-3 py-1.5 rounded-full text-sm transition-all"
          style={{
            background: value === opt ? "#8a6e5a" : "rgba(255,255,255,0.5)",
            color: value === opt ? "#fff" : "var(--muted)",
            border: `1px solid ${value === opt ? "#8a6e5a" : "var(--border)"}`,
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function CopyButton({ text, id }: { text: string; id: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs shrink-0 transition-colors px-2 py-1 rounded-lg"
      style={{
        color: copied ? "#5a8a6e" : "var(--muted)",
        background: copied ? "rgba(90,138,110,0.1)" : "transparent",
      }}
      aria-label={`${id} 복사`}
    >
      {copied ? "✓ 복사됨" : "복사"}
    </button>
  );
}

function MessageCard({
  text,
  id,
  badge,
  badgeColor,
}: {
  text: string;
  id: string;
  badge: string;
  badgeColor: { bg: string; text: string };
}) {
  return (
    <div className="organic-card p-4 space-y-2 bubble-slide-up">
      <div className="flex justify-between items-center">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: badgeColor.bg, color: badgeColor.text }}
        >
          {badge}
        </span>
        <CopyButton text={text} id={id} />
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--foreground)" }}>
        {text}
      </p>
    </div>
  );
}

export default function BeautyCRMPage() {
  const [form, setForm] = useState({
    업종: "",
    고객유형: "",
    마지막방문: "",
    받은서비스: "",
    고객상황: "",
    연락목적: "",
    응대톤: "",
    주의사항: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CRMResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const isValid =
    form.업종 &&
    form.고객유형 &&
    form.마지막방문 &&
    form.받은서비스.trim() &&
    form.고객상황.trim() &&
    form.연락목적 &&
    form.응대톤;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/beauty-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        setTimeout(() => {
          document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        setError(data.error || "오류가 발생했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const kakaoBadge = { bg: "rgba(254,229,107,0.3)", text: "#8a6e1a" };
  const smsBadge = { bg: "rgba(90,138,110,0.15)", text: "#3a7a5a" };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-3xl">✂️</p>
          <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            뷰티샵 고객 연락 문구 만들기
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            방문 상황을 입력하면 바로 보낼 수 있는 문구를 만들어드려요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="organic-card p-6 space-y-6">
          {/* 업종 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              업종
            </label>
            <ChipGroup options={업종Options} value={form.업종} onChange={set("업종")} />
          </div>

          {/* 고객 유형 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              고객 유형
            </label>
            <ChipGroup options={고객유형Options} value={form.고객유형} onChange={set("고객유형")} />
          </div>

          {/* 마지막 방문 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              마지막 방문
            </label>
            <ChipGroup options={마지막방문Options} value={form.마지막방문} onChange={set("마지막방문")} />
          </div>

          {/* 받은 서비스 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              받은 서비스
            </label>
            <input
              type="text"
              value={form.받은서비스}
              onChange={(e) => setForm((f) => ({ ...f, 받은서비스: e.target.value }))}
              placeholder="예: 기본 클렌징 + 수분 관리 케어"
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#8a6e5a")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* 고객 상황 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              고객 상황
            </label>
            <textarea
              value={form.고객상황}
              onChange={(e) => setForm((f) => ({ ...f, 고객상황: e.target.value }))}
              placeholder="예: 처음 방문 후 만족해하심, 바쁜 직장인이라 주말에만 방문 가능하다고 하심"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors resize-none"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#8a6e5a")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* 연락 목적 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              연락 목적
            </label>
            <ChipGroup options={연락목적Options} value={form.연락목적} onChange={set("연락목적")} />
          </div>

          {/* 응대 톤 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              응대 톤
            </label>
            <div className="grid grid-cols-2 gap-2">
              {응대톤Options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, 응대톤: opt.label }))}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                  style={{
                    background: form.응대톤 === opt.label ? "#8a6e5a" : "rgba(255,255,255,0.5)",
                    color: form.응대톤 === opt.label ? "#fff" : "var(--muted)",
                    border: `1px solid ${form.응대톤 === opt.label ? "#8a6e5a" : "var(--border)"}`,
                  }}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 주의 사항 (선택) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              주의 사항{" "}
              <span className="font-normal text-xs" style={{ color: "var(--muted)" }}>
                (선택)
              </span>
            </label>
            <textarea
              value={form.주의사항}
              onChange={(e) => setForm((f) => ({ ...f, 주의사항: e.target.value }))}
              placeholder="예: 연락을 자주 안 받으시는 편, 할인 관련 언급은 피할 것"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors resize-none"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#8a6e5a")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* 버튼 */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all"
            style={{
              background: isValid && !loading ? "#8a6e5a" : "rgba(175,155,130,0.25)",
              color: isValid && !loading ? "#fff" : "var(--muted)",
              cursor: !isValid || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                문구 생성 중...
              </span>
            ) : (
              "문구 만들기"
            )}
          </button>
        </form>

        {/* 에러 */}
        {error && (
          <div
            className="organic-card p-4 text-sm text-center"
            style={{ color: "#c9534f", borderColor: "rgba(201,83,79,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div id="result-section" className="space-y-5 pb-10">
            {/* 카카오톡 문구 */}
            {result.kakao.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  💬 카카오톡 문구
                </h2>
                {result.kakao.map((msg, i) => (
                  <MessageCard
                    key={i}
                    text={msg}
                    id={`kakao-${i}`}
                    badge={`버전 ${i + 1}`}
                    badgeColor={kakaoBadge}
                  />
                ))}
              </section>
            )}

            {/* 짧은 문자 */}
            {result.sms.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  📱 짧은 문자 버전
                </h2>
                {result.sms.map((msg, i) => (
                  <MessageCard
                    key={i}
                    text={msg}
                    id={`sms-${i}`}
                    badge={`버전 ${i + 1}`}
                    badgeColor={smsBadge}
                  />
                ))}
              </section>
            )}

            {/* 예약 유도 */}
            {result.reservation && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  📅 예약 유도 문장
                </h2>
                <div className="premium-card p-4 space-y-2 bubble-slide-up">
                  <div className="flex justify-end">
                    <CopyButton text={result.reservation} id="reservation" />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                    {result.reservation}
                  </p>
                </div>
              </section>
            )}

            {/* 피해야 할 표현 */}
            {result.avoid && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  ⚠️ 피해야 할 표현
                </h2>
                <div className="organic-card p-4 bubble-slide-up">
                  <div className="space-y-3">
                    {result.avoid
                      .split("\n")
                      .filter((l) => l.trim())
                      .map((line, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <span style={{ color: "#c9534f" }} className="shrink-0 mt-0.5">
                            ✗
                          </span>
                          <span style={{ color: "var(--muted)" }}>{line}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            )}

            {/* 다시 만들기 */}
            <button
              onClick={() => {
                setResult(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full py-2.5 rounded-xl text-sm transition-all"
              style={{
                border: "1px solid var(--border)",
                color: "var(--muted)",
                background: "transparent",
              }}
            >
              다시 만들기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
