"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DiagnosisAnswers,
  FailureType,
  FAILURE_TYPE_INFO,
  PATTERN_SCENARIOS,
  getDiagnosisResult,
} from "@/lib/diagnosis";
import { trackEvent } from "@/lib/tracking";

const SITE_URL = "https://my-todo-app-three-woad.vercel.app";
const KAKAO_OPENCHAT_URL = "https://open.kakao.com/o/pJpkL2yi";

// ── 공유 ─────────────────────────────────────────────────────────
function ShareSection({ info }: { info: (typeof FAILURE_TYPE_INFO)[FailureType] }) {
  const [copied, setCopied] = useState(false);
  const shareText = `나의 다이어트 실패 유형은 ${info.emoji} ${info.label}\n\n왜 반복해서 실패하는지 3가지 질문으로 알아봤어요.\n너도 해봐 👇\n${SITE_URL}`;

  async function handleShare() {
    void trackEvent({ eventName: "result_share_click", resultType: info.label });
    if (navigator.share) {
      try { await navigator.share({ title: `나의 다이어트 실패 유형: ${info.label}`, text: shareText, url: SITE_URL }); }
      catch { /* 취소 */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
      <p className="text-xs font-black tracking-widest mb-2" style={{ color: "var(--amber)" }}>SHARE</p>
      <p className="font-black text-base mb-1" style={{ color: "var(--navy)" }}>친구도 궁금하지 않나요?</p>
      <p className="text-xs text-gray-400 mb-5">공유하면 친구의 실패 유형도 알 수 있어요</p>
      <div className="rounded-xl p-4 mb-5 text-left text-xs leading-relaxed text-gray-500" style={{ background: "var(--beige)", border: "1px solid rgba(212,168,83,0.2)" }}>
        나의 다이어트 실패 유형은 {info.emoji} <strong style={{ color: "var(--navy)" }}>{info.label}</strong>
        <br />왜 반복해서 실패하는지 3가지 질문으로 알아봤어요.
        <br /><span style={{ color: "var(--amber)" }}>너도 해봐 👇</span>
      </div>
      <button
        onClick={handleShare}
        data-event="share_button"
        className="w-full py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
        style={{ background: copied ? "var(--navy)" : "var(--amber)", color: copied ? "white" : "var(--navy)" }}
      >
        {copied ? "✓ 링크가 복사됐어요!" : "카카오톡·인스타에 공유하기 →"}
      </button>
    </div>
  );
}

// ── 정확도 피드백 ────────────────────────────────────────────────
const ACCURACY_OPTIONS = [
  { emoji: "😮", label: "완전 나야", value: "완전맞음" },
  { emoji: "🤔", label: "어느 정도", value: "어느정도" },
  { emoji: "😐", label: "잘 모르겠어", value: "모르겠음" },
  { emoji: "😕", label: "아닌 것 같아", value: "안맞음" },
];

function AccuracyFeedback({ resultType }: { resultType: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { const s = localStorage.getItem("wg_accuracy_feedback"); if (s) setSelected(s); }, []);

  function handleSelect(value: string) {
    if (selected) return;
    setSelected(value);
    localStorage.setItem("wg_accuracy_feedback", value);
    void trackEvent({ eventName: "accuracy_feedback", accuracy: value, resultType });
  }

  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <p className="text-sm font-black mb-4" style={{ color: "var(--navy)" }}>이 분석 결과가 나에게 얼마나 맞나요?</p>
      <div className="grid grid-cols-4 gap-2">
        {ACCURACY_OPTIONS.map((opt) => {
          const isChosen = selected === opt.value;
          return (
            <button key={opt.value} onClick={() => handleSelect(opt.value)} disabled={!!selected}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
              style={{ background: isChosen ? "var(--navy)" : "var(--beige)", border: `2px solid ${isChosen ? "var(--navy)" : "transparent"}`, opacity: selected && !isChosen ? 0.4 : 1 }}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-xs font-semibold" style={{ color: isChosen ? "white" : "var(--navy)" }}>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {selected && <p className="text-xs text-gray-400 mt-3">피드백 감사해요. 더 정확한 분석에 반영할게요. 🙏</p>}
    </div>
  );
}

// ── 30일 후 미리보기 ─────────────────────────────────────────────
const DAY_STYLES: Record<number, { bg: string; badge: string; badgeText: string; text: string }> = {
  3:  { bg: "rgba(245,237,216,0.9)", badge: "rgba(212,168,83,0.25)", badgeText: "var(--navy)", text: "var(--navy)" },
  7:  { bg: "rgba(212,168,83,0.15)", badge: "rgba(212,168,83,0.5)", badgeText: "var(--navy)", text: "var(--navy)" },
  14: { bg: "rgba(212,168,83,0.28)", badge: "var(--amber)", badgeText: "var(--navy)", text: "var(--navy)" },
  30: { bg: "var(--navy)", badge: "var(--amber)", badgeText: "var(--navy)", text: "white" },
};

function PreviewSection({ failureType }: { failureType: FailureType }) {
  const scenario = PATTERN_SCENARIOS[failureType];
  const info = FAILURE_TYPE_INFO[failureType];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{info.emoji}</span>
          <span className="text-sm font-black" style={{ color: "var(--amber)" }}>{info.label}</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>
          {scenario.humorousDescription}
        </p>
      </div>

      <div>
        <p className="text-sm font-black mb-3 px-1" style={{ color: "var(--navy)" }}>
          🔮 현재 패턴이 유지된다면?
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory">
          {scenario.timeline.map(({ day, scenario: text }) => {
            const s = DAY_STYLES[day];
            return (
              <div key={day} className="rounded-2xl p-4 flex-shrink-0 w-52 snap-start" style={{ background: s.bg }}>
                <span className="text-xs font-black px-2.5 py-1 rounded-full mb-3 inline-block" style={{ background: s.badge, color: s.badgeText }}>
                  D+{day}일 후
                </span>
                <p className="text-xs leading-relaxed mt-1" style={{ color: s.text }}>{text}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">← 밀어서 더 보기</p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "var(--navy)" }}>
        <p className="text-xs font-black tracking-widest mb-2" style={{ color: "var(--amber)" }}>
          지금 당장 이것만 해보세요
        </p>
        <p className="font-black text-white text-base mb-3 leading-snug">{scenario.keyAction}</p>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          {scenario.keyActionDescription}
        </p>
      </div>
    </div>
  );
}

// ── 스트레스 폭식형 전용 후킹 ────────────────────────────────────
function StressBingeHookSection() {
  return (
    <div className="rounded-2xl p-6" style={{ background: "rgba(254,248,238,1)", border: "2px solid rgba(212,168,83,0.35)" }}>
      <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>
        잠깐, 이것 먼저 읽어보세요
      </p>
      <p className="font-black text-lg leading-snug mb-4" style={{ color: "var(--navy)" }}>
        당신은 의지력이 약한 사람이 아닙니다.
      </p>
      <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(30,58,95,0.78)" }}>
        스트레스를 음식으로 해소하는 패턴이 반복되고 있습니다. 문제는 식욕이 아니라, 스트레스가 올라왔을 때 자동으로 먹는 쪽으로 풀리는 <strong>습관</strong>입니다. 이 패턴을 모르면 다이어트를 다시 시작해도 같은 지점에서 무너질 가능성이 높습니다.
      </p>
      <div className="rounded-xl px-4 py-3.5" style={{ background: "rgba(30,58,95,0.07)" }}>
        <p className="text-sm font-black leading-snug" style={{ color: "var(--navy)" }}>
          💡 핵심은 덜 먹는 것이 아니라,<br />언제 무너지는지 아는 것입니다.
        </p>
      </div>
    </div>
  );
}

// ── 잠금 전 공유 버튼 ─────────────────────────────────────────────
function LockedShareButton({ info }: { info: (typeof FAILURE_TYPE_INFO)[FailureType] }) {
  const [copied, setCopied] = useState(false);
  const shareText = `나의 다이어트 실패 유형은 ${info.emoji} ${info.label}\n\n3가지 질문으로 내 실패 패턴을 알아봤어요.\n너도 해봐 👇\n${SITE_URL}`;

  async function handleShare() {
    void trackEvent({ eventName: "locked_share_click", resultType: info.label });
    if (navigator.share) {
      try { await navigator.share({ title: `나의 다이어트 실패 유형: ${info.label}`, text: shareText, url: SITE_URL }); }
      catch { /* 취소 */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(254,248,238,1)", border: "2px solid rgba(212,168,83,0.4)" }}>
      <p className="text-sm font-black mb-1" style={{ color: "var(--navy)" }}>
        {info.emoji} 나는 <span style={{ color: "var(--amber)" }}>{info.label}</span>이래!
      </p>
      <p className="text-xs text-gray-400 mb-4">친구한테 공유하면 친구 유형도 알 수 있어요</p>
      <button
        onClick={handleShare}
        className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        style={{ background: copied ? "var(--navy)" : "#FEE500", color: "#3A1D1D" }}
      >
        <span className="text-base">💬</span>
        <span>{copied ? "✓ 링크 복사됨!" : "카카오톡으로 공유하기"}</span>
      </button>
    </div>
  );
}

// ── 카카오 오픈채팅 게이트 ────────────────────────────────────────
function KakaoOpenChatGate({ failureType, resultLabel, onUnlock }: {
  failureType: FailureType;
  resultLabel: string;
  onUnlock: () => void;
}) {
  function handleJoin() {
    void trackEvent({
      eventName: "kakao_openchat_join_clicked",
      resultType: failureType,
      consultationIntent: resultLabel,
    });
    localStorage.setItem("wg_direct_lead_done", "1");
    window.open(KAKAO_OPENCHAT_URL, "_blank");
    setTimeout(() => onUnlock(), 400);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "2px solid var(--navy)", boxShadow: "0 4px 24px rgba(30,58,95,0.15)" }}>
      <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
        <p className="text-xs font-black tracking-widest mb-1.5" style={{ color: "var(--amber)" }}>전체 분석 결과 보기</p>
        <p className="font-black text-white text-base leading-snug">
          실패 원인 · 반복 패턴 · 오늘 바로 할 수 있는 행동 3가지
        </p>
        <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
          카카오 오픈채팅 참여 시 무료로 전체 결과를 공개합니다
        </p>
      </div>
      <div className="bg-white px-5 py-5">
        <button
          onClick={handleJoin}
          className="w-full py-4 rounded-xl font-black text-base transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
          style={{ background: "#FEE500", color: "#3A1D1D" }}
        >
          <span className="text-xl">💬</span>
          <span>카카오 오픈채팅 참여하기</span>
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">무료 · 광고 없음 · 언제든 나갈 수 있어요</p>
      </div>
    </div>
  );
}

// ── 신규 수익화 CTA ──────────────────────────────────────────────
const NEW_CTAS = [
  { label: "내 폭식 위험도 분석 보기", eventName: "binge_risk_cta_clicked", icon: "🔥", primary: true },
  { label: "7일 후 재발 가능성 보기", eventName: "relapse_7day_cta_click", icon: "📅", primary: false },
  { label: "심층 리포트 오픈 시 알림받기", eventName: "deep_report_notify_clicked", icon: "🔔", primary: false },
  { label: "베타테스터 신청하기", eventName: "beta_tester_clicked", icon: "⭐", primary: false },
];

function NewCTASection({ resultType }: { resultType: string }) {
  const [toast, setToast] = useState(false);

  function handleClick(eventName: string) {
    void trackEvent({
      eventName,
      resultType,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    });
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(30,58,95,0.12)" }}>
        <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
          <p className="font-black text-white text-sm">더 깊이 알고 싶으신가요?</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            지금 패턴을 알아야 다음엔 달라질 수 있습니다
          </p>
        </div>
        <div className="bg-white px-5 py-4 space-y-2.5">
          {NEW_CTAS.map(({ label, eventName, icon, primary }) => (
            <button
              key={eventName}
              onClick={() => handleClick(eventName)}
              data-event={eventName}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-left px-4 transition-all hover:scale-[1.01] flex items-center gap-2.5"
              style={
                primary
                  ? { background: "var(--amber)", color: "var(--navy)" }
                  : { background: "rgba(30,58,95,0.05)", color: "var(--navy)", border: "1.5px solid rgba(30,58,95,0.1)" }
              }
            >
              <span className="text-base">{icon}</span>
              <span className="flex-1">{label}</span>
              <span className="text-xs opacity-40">→</span>
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 w-[88vw] max-w-sm rounded-2xl px-5 py-4"
          style={{ transform: "translateX(-50%)", background: "var(--navy)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
        >
          <p className="text-white text-sm font-black mb-1">준비 중입니다 🛠️</p>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            현재 심층 분석 기능을 준비 중입니다.<br />
            알림 신청을 남기면 오픈 시 가장 먼저 안내드릴게요.
          </p>
        </div>
      )}
    </>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
const HELP_LABELS: Record<string, string> = {
  obesity_clinic: "비만클리닉", oriental: "한의원", pt: "PT",
  body_care: "바디관리실", meal_delivery: "식단 배송", online_coaching: "온라인 코칭",
};

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [failureType, setFailureType] = useState<FailureType | null>(null);
  const [answers, setAnswers] = useState<DiagnosisAnswers | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("wg_diagnosis");
    if (!raw) { router.push("/quiz"); return; }
    const parsed: DiagnosisAnswers = JSON.parse(raw);
    const type = getDiagnosisResult(parsed);
    const alreadyDone = localStorage.getItem("wg_direct_lead_done") === "1";

    const timer = setTimeout(() => {
      setFailureType(type);
      setAnswers(parsed);
      setIsUnlocked(alreadyDone);
      setLoading(false);
      void trackEvent({
        eventName: "diagnosis_result_viewed",
        resultType: FAILURE_TYPE_INFO[type].label,
        topRecommendation: type,
        selectedAnswers: parsed as unknown as Record<string, unknown>,
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "var(--navy)" }}>
        <div className="text-5xl" style={{ animation: "pulse 1.2s ease-in-out infinite" }}>🔍</div>
        <div className="text-center">
          <p className="text-white font-black text-lg mb-2">패턴 분석 중</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>30일 후의 나를 예측하는 중...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full"
              style={{ background: "var(--amber)", animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
        <style>{`
          @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
          @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        `}</style>
      </div>
    );
  }

  if (!failureType || !answers) return null;
  const info = FAILURE_TYPE_INFO[failureType];

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--beige)" }}>
      {/* 헤더 — 항상 표시 */}
      <div style={{ background: "var(--navy)" }} className="px-5 pt-12 pb-20 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            📍 패턴 분석 완료
          </p>
          <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            당신의 다이어트 실패 패턴은
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-3" style={{ background: "rgba(212,168,83,0.2)" }}>
            <span className="text-2xl">{info.emoji}</span>
            <span className="text-xl font-black" style={{ color: "var(--amber)" }}>{info.label}</span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>5가지 답변 분석 결과</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">

        {/* 스트레스 폭식형 훅 — 항상 표시 */}
        {failureType === "stress_binge" && <StressBingeHookSection />}

        {/* 잠금 상태: 티저 + 리드 캡처 폼 */}
        {!isUnlocked && (
          <>
            {/* 실패 원인 티저 */}
            <div className="bg-white rounded-2xl p-6 relative overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>나의 실패 원인</p>
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--navy)" }}>{info.cause}</p>
              <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: "linear-gradient(transparent, white)" }} />
            </div>

            {/* 카카오톡 공유 버튼 (잠금 전) */}
            <LockedShareButton info={info} />

            {/* 카카오 오픈채팅 게이트 */}
            <KakaoOpenChatGate
              failureType={failureType}
              resultLabel={info.label}
              onUnlock={() => setIsUnlocked(true)}
            />
          </>
        )}

        {/* 잠금 해제: 전체 콘텐츠 */}
        {isUnlocked && (
          <>
            <PreviewSection failureType={failureType} />
            <NewCTASection resultType={info.label} />
            <ShareSection info={info} />
            <AccuracyFeedback resultType={info.label} />

            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>나의 실패 원인</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>{info.cause}</p>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "rgba(30,58,95,0.04)", border: "1px solid rgba(30,58,95,0.08)" }}>
              <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--navy)" }}>반복되는 패턴</p>
              <p className="text-sm leading-relaxed text-gray-600">{info.pattern}</p>
            </div>

            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>
                오늘 당장 할 수 있는 무료 행동 3가지
              </p>
              <div className="space-y-3">
                {info.freeActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                      style={{ background: "var(--amber)", color: "var(--navy)" }}>{i + 1}</span>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>{action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "var(--beige)", border: "1px solid rgba(212,168,83,0.25)" }}>
              <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--navy)" }}>필요한 경우 추천되는 도움</p>
              <div className="flex flex-wrap gap-2">
                {info.helpTypes.map((type) => (
                  <Link key={type} href={`/businesses?type=${type}`}
                    onClick={() => void trackEvent({ eventName: "help_type_click", topRecommendation: type, resultType: info.label })}
                    className="px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "var(--navy)", color: "white" }}
                  >
                    {HELP_LABELS[type] ?? type}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(30,58,95,0.1)" }}>
              <div className="bg-white px-5 pt-5 pb-4 space-y-2.5">
                <p className="text-xs font-black tracking-widest mb-3" style={{ color: "rgba(30,58,95,0.35)" }}>기타 옵션</p>
                <button
                  onClick={() => { localStorage.removeItem("wg_diagnosis"); void trackEvent({ eventName: "cta_retry", resultType: info.label }); router.push("/quiz"); }}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-center transition-all"
                  style={{ background: "rgba(30,58,95,0.05)", color: "var(--navy)", border: "1.5px solid rgba(30,58,95,0.1)" }}
                >
                  내 실패 원인 다시 분석하기
                </button>
                <Link
                  href={`/businesses?type=${info.helpTypes[0]}`}
                  onClick={() => void trackEvent({ eventName: "cta_my_solution", resultType: info.label })}
                  className="block w-full text-center py-3 rounded-xl font-semibold text-sm"
                  style={{ background: "rgba(30,58,95,0.05)", color: "var(--navy)", border: "1.5px solid rgba(30,58,95,0.1)" }}
                >
                  나에게 맞는 해결법 보기
                </Link>
                <Link
                  href="/businesses"
                  onClick={() => void trackEvent({ eventName: "cta_nearby", resultType: info.label })}
                  className="block w-full text-center py-3 rounded-xl font-semibold text-sm text-gray-400"
                  style={{ border: "1.5px solid rgba(0,0,0,0.06)" }}
                >
                  근처 다이어트 도움 찾기
                </Link>
              </div>
            </div>
          </>
        )}

        {/* 7일 기록 유도 CTA */}
        <div className="rounded-2xl p-6" style={{ background: "var(--navy)", boxShadow: "0 4px 20px rgba(30,58,95,0.18)" }}>
          <p className="text-xs font-black tracking-widest mb-2" style={{ color: "var(--amber)" }}>더 정확한 리포트 받기</p>
          <p className="font-black text-white text-base leading-snug mb-2">내 폭식 패턴 7일 기록하기</p>
          <p className="text-xs leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
            하루 2분만 기록하면, 어떤 감정과 시간대에<br />폭식이 반복되는지 볼 수 있어요.
          </p>
          <Link
            href="/binge-program"
            onClick={() => void trackEvent({ eventName: "result_7day_program_click", resultType: info.label })}
            className="block w-full text-center py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02]"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            7일 기록으로 더 정확한 리포트 받기 →
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center leading-relaxed px-2 pb-2">
          본 결과는 생활습관 기반의 자기 점검 리포트입니다.
          의료적 진단을 대체하지 않으며, 개인에 따라 다를 수 있습니다.
        </p>
      </div>
    </main>
  );
}
