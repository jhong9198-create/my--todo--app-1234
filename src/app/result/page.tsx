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

// ── 포트원 v1 SDK 타입 ─────────────────────────────────────────────
interface PortOneResponse {
  success: boolean;
  error_msg?: string;
  imp_uid?: string;
  merchant_uid?: string;
  paid_amount?: number;
}
type ImpWindow = typeof window & {
  IMP?: {
    init: (impCode: string) => void;
    request_pay: (params: Record<string, unknown>, callback: (rsp: PortOneResponse) => void) => void;
  };
};

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

// ── 무료 리포트 콘텐츠 데이터 ────────────────────────────────────
type ReportType = "relapse_risk" | "binge_risk" | "deep_report";

const REPORT_META: Record<ReportType, { icon: string; label: string; eventName: string }> = {
  binge_risk:   { icon: "🔥", label: "내 폭식 위험도 분석 보기",  eventName: "binge_risk_cta_clicked" },
  relapse_risk: { icon: "📅", label: "7일 후 재발 가능성 보기",   eventName: "relapse_7day_cta_click" },
  deep_report:  { icon: "📋", label: "심층 리포트 보기",           eventName: "deep_report_notify_clicked" },
};

const RELAPSE_DATA: Record<FailureType, { level: string; pct: number; color: string; mainRisk: string; warnings: string[]; prevention: string }> = {
  night_eating:      { level: "높음",     pct: 82, color: "#E05252", mainRisk: "수면 전 야식 루틴이 몸에 각인되어 있습니다. 환경이 바뀌지 않으면 같은 시간에 배고픔이 자동으로 찾아옵니다.", warnings: ["밤 10시 이후 TV·유튜브를 켜는 순간", "스트레스로 잠이 오지 않는 날 밤", "다이어트 시작 후 첫 주말"], prevention: "야식 시간에 '먹는 것' 말고 '하는 것' 대체 루틴을 1가지만 정하세요. (양치, 따뜻한 물, 스트레칭)" },
  stress_binge:      { level: "매우 높음", pct: 88, color: "#C0392B", mainRisk: "스트레스가 올라오면 음식으로 해소하는 패턴이 자동화되어 있습니다. 스트레스 원인이 해결되지 않으면 반드시 재발합니다.", warnings: ["직장 스트레스가 최고조인 날", "혼자 있는 저녁 시간", "억울하거나 화가 나는 상황"], prevention: "충동이 오면 10분 타이머를 재세요. '지금 나 스트레스받고 있다'고 인식하는 것부터 시작하면 됩니다." },
  three_day_quit:    { level: "높음",     pct: 74, color: "#E05252", mainRisk: "처음 의욕이 넘치다가 3~7일 후 작은 실수 하나에 전체를 포기하는 패턴이 반복됩니다.", warnings: ["다이어트 시작 후 첫 번째 치팅", "계획한 운동을 하루 빠진 날", "주변 사람들이 먹는 걸 보는 날"], prevention: "완벽한 하루보다 '나쁘지 않은 한 주'를 목표로 바꾸세요. 실수 한 번이 전체 포기가 아닙니다." },
  plateau_despair:   { level: "중간",     pct: 68, color: "#E67E22", mainRisk: "2~3주 잘 되다가 체중이 멈추는 순간 의욕을 잃습니다. 정체기 대응 전략 없으면 그 지점에서 반드시 무너집니다.", warnings: ["2주 이상 체중계 숫자가 안 바뀌는 날", "열심히 했는데 결과가 없다는 느낌", "주변에 빨리 빠지는 사람을 볼 때"], prevention: "정체기는 실패가 아닙니다. 3주 이상 버티는 사람이 최종 성공합니다. 체중 측정을 주 1회로 줄이세요." },
  social_collapse:   { level: "높음",     pct: 71, color: "#E05252", mainRisk: "술자리·회식 환경이 바뀌지 않으면 사회적 압력에 의한 재발이 반복됩니다. '한 번만'이 계속 반복됩니다.", warnings: ["예상 못 한 회식이 잡히는 날", "거절했을 때 눈치가 보이는 상황", "술과 함께 고칼로리 안주가 나오는 순간"], prevention: "완전 절제 대신 '이 자리에서 지킬 수 있는 최소 1가지'를 미리 정하고 참석하세요." },
  exercise_avoidance:{ level: "보통",     pct: 62, color: "#E67E22", mainRisk: "식단만으로 체중을 조절하면 근육량이 줄면서 대사량이 낮아지고, 이후 정상 식사만 해도 살이 찌는 요요가 옵니다.", warnings: ["식단 제한이 너무 타이트해져 스트레스받을 때", "체중은 빠졌지만 몸이 더 쉽게 피곤할 때", "다이어트 끝나고 원래 식사량으로 돌아가는 시점"], prevention: "운동은 칼로리 소모보다 근육 유지가 목적입니다. 걷기 30분부터 시작해도 충분합니다." },
};

const BINGE_DATA: Record<FailureType, { score: number; label: string; color: string; description: string; triggers: string[]; tip: string }> = {
  stress_binge:      { score: 9, label: "매우 위험", color: "#C0392B", description: "감정 자극에 즉각 음식으로 반응하는 패턴이 강하게 형성되어 있습니다. 스트레스·불안·외로움이 올라오는 즉시 폭식 충동이 발생합니다.", triggers: ["직장 스트레스", "혼자 있는 저녁", "누군가와의 갈등"], tip: "식욕이 아닌 감정 신호임을 인식하는 것이 핵심입니다. 충동이 오면 10분 기다려보세요." },
  night_eating:      { score: 7, label: "위험",     color: "#E05252", description: "밤 10시~새벽 2시에 자동으로 식욕이 폭발합니다. 배가 고프지 않아도 그 시간만 되면 먹고 싶어지는 패턴입니다.", triggers: ["밤 10시 이후", "TV·유튜브 시청 중", "잠들기 어려운 날 밤"], tip: "야식 시간대에 다른 루틴(산책, 양치, 따뜻한 물 마시기)을 끼워 넣으세요." },
  social_collapse:   { score: 7, label: "위험",     color: "#E05252", description: "혼자서는 잘 참다가 회식·술자리 환경에 놓이면 통제가 어려워집니다. 외부 환경이 강한 트리거가 됩니다.", triggers: ["술자리·회식", "타인이 먹는 모습", "거절하기 어려운 상황"], tip: "사전에 '이것만은 참겠다'는 기준 1개를 미리 정하고 자리에 참석하세요." },
  plateau_despair:   { score: 5, label: "주의",     color: "#E67E22", description: "평소엔 잘 참지만 노력이 보상받지 못한다는 느낌이 들면 통제가 풀리는 패턴입니다.", triggers: ["체중 정체 후 며칠째", "열심히 했는데 결과가 없는 느낌", "주변 비교"], tip: "정체기는 패턴이 맞다는 신호입니다. 숫자 대신 다른 변화(체력, 몸 변화)에 집중하세요." },
  three_day_quit:    { score: 5, label: "주의",     color: "#E67E22", description: "'에라 모르겠다'식의 포기성 폭식이 나타납니다. 작은 실수가 전체 포기로 이어지는 순간 폭식이 발생합니다.", triggers: ["계획 실패 직후", "첫 치팅 이후", "'어차피 망했다'는 생각"], tip: "실수는 폭식의 신호가 아닙니다. '오늘 하나 틀렸다'와 '다이어트 전체 실패'는 다릅니다." },
  exercise_avoidance:{ score: 4, label: "양호",     color: "#27AE60", description: "직접적인 폭식보다 식단 제한이 너무 타이트해졌을 때의 반동 위험이 있습니다.", triggers: ["너무 엄격한 식단 유지 중", "운동 없이 굶기만 하는 날", "체중 정체로 더 줄이려 할 때"], tip: "굶는 식단보다 단백질 섭취로 포만감을 유지하는 것이 폭식 예방에 효과적입니다." },
};

const DEEP_DATA: Record<FailureType, { rootCause: string; triggerAnalysis: { trigger: string; description: string }[]; environmentChange: string; weekPlan: string[] }> = {
  night_eating:      { rootCause: "야식 행동이 수면 루틴에 결합되어 있습니다. 몸이 '밤 → 먹기'를 자동 연결해 배가 고프지 않아도 식욕이 생깁니다.", triggerAnalysis: [{ trigger: "시간 트리거", description: "밤 10시가 넘으면 자동으로 냉장고로 향하는 패턴" }, { trigger: "미디어 트리거", description: "TV·유튜브 시청이 야식 욕구를 강화하는 습관적 연결" }, { trigger: "지루함 트리거", description: "밤에 할 일이 없을 때 음식이 유일한 자극이 되는 상황" }], environmentChange: "밤 9시 이후 주방 접근을 물리적으로 차단하거나, 야식 대신 할 '대체 루틴' 1가지를 정해두세요.", weekPlan: ["1-2일차: 밤 9시에 양치하기 (심리적 마감 신호)", "3-4일차: 야식 욕구 느낄 때 따뜻한 물 한 잔 마시기", "5-7일차: 밤 루틴 (스트레칭 10분 + 독서) 정착시키기"] },
  stress_binge:      { rootCause: "스트레스 → 음식 해소 회로가 자동화되어 있습니다. 도파민이 음식에 연결되어 있어 부정적 감정이 오면 즉각 먹고 싶어집니다.", triggerAnalysis: [{ trigger: "감정 트리거", description: "불안·분노·외로움이 올라올 때 음식으로 달래려는 즉각 반응" }, { trigger: "직장 트리거", description: "업무 스트레스 피크인 날 퇴근 후 보상 심리 폭식" }, { trigger: "고독 트리거", description: "혼자 있는 저녁, 감정을 나눌 곳이 없을 때 음식이 위안" }], environmentChange: "스트레스 해소 방법 목록을 3가지 미리 만들어두세요. 음식이 아닌 것으로 (산책, 음악, 통화 등)", weekPlan: ["1-2일차: 폭식 전 '지금 나 스트레스받고 있다'고 인식하기", "3-4일차: 충동이 오면 10분 타이머 재기", "5-7일차: 스트레스 해소 대체 행동 1가지 실행해보기"] },
  three_day_quit:    { rootCause: "완벽주의적 다이어트 패턴입니다. 계획이 조금이라도 어긋나면 전체를 포기하는 '0 아니면 100' 사고방식이 반복을 만들고 있습니다.", triggerAnalysis: [{ trigger: "완벽주의 트리거", description: "계획한 식단에서 조금만 벗어나도 '망했다'고 판단" }, { trigger: "첫 실수 트리거", description: "첫 번째 치팅 후 자포자기 폭식" }, { trigger: "비교 트리거", description: "다른 사람 결과와 비교해 의욕 상실 → 포기" }], environmentChange: "주간 단위로 계획하세요. '주간 80%' 목표로 바꾸면 하루 실수가 일주일을 망치지 않습니다.", weekPlan: ["1-2일차: 오늘 목표를 '완벽'이 아닌 '70%'로 낮추기", "3-4일차: 실수했을 때 '오늘 하나 틀렸다'고만 메모하기", "5-7일차: 포기하고 싶은 순간 24시간 유예하기"] },
  plateau_despair:   { rootCause: "초기 성공에 익숙해진 몸이 더 이상 쉽게 반응하지 않는 정체기에서 심리적 무너짐이 시작됩니다. 숫자에 지나치게 의존하는 것이 문제입니다.", triggerAnalysis: [{ trigger: "숫자 집착 트리거", description: "매일 체중계에 올라가 조금이라도 안 빠지면 좌절" }, { trigger: "기대 불일치 트리거", description: "열심히 했는데 결과가 없다는 느낌이 의욕을 꺾음" }, { trigger: "비교 트리거", description: "빠르게 빠지는 다른 사람을 보며 내 방법이 틀렸다고 판단" }], environmentChange: "체중 측정 주기를 매일 → 주 1회로 바꾸세요. 숫자 대신 '이번 주 내가 지킨 것'을 기록하세요.", weekPlan: ["1-2일차: 체중계 측정 빈도 줄이기 (매일 → 격일 → 주 1회)", "3-4일차: 체중 외 변화 기록하기 (허리, 컨디션, 지구력)", "5-7일차: 정체기 3주 버티기 도전 (지나면 반드시 빠짐)"] },
  social_collapse:   { rootCause: "사회적 상황에서의 거절 능력과 자기 조절 전략이 없습니다. 외부 환경이 바뀌지 않으면 같은 상황이 올 때마다 무너집니다.", triggerAnalysis: [{ trigger: "회식 트리거", description: "예상치 못한 회식에서 분위기에 휩쓸려 절제 포기" }, { trigger: "눈치 트리거", description: "거절했을 때 이상하게 볼까봐 맞춰주다 과식" }, { trigger: "알코올 트리거", description: "술 한 잔 후 판단력 저하로 안주 통제 불가" }], environmentChange: "회식 전 '이것만 지킨다' 규칙 1개를 미리 정하세요. (예: 술은 2잔까지, 안주는 단백질 위주)", weekPlan: ["1-2일차: 다음 회식 전 나만의 규칙 1개 정하기", "3-4일차: 술자리에서 물·음료 섞어 마시는 전략 써보기", "5-7일차: 회식 후 다음 날 식사로 균형 잡기 (자책 금지)"] },
  exercise_avoidance:{ rootCause: "운동 없이 식단만으로 유지하려 합니다. 단기적으론 효과가 있지만, 근육량 감소 → 대사 저하 → 요요의 악순환이 반복됩니다.", triggerAnalysis: [{ trigger: "귀찮음 트리거", description: "운동 시작의 심리적 장벽이 높아 계속 미루게 됨" }, { trigger: "극단적 식단 트리거", description: "운동 안 하는 대신 식단을 너무 타이트하게 → 반동 폭식" }, { trigger: "근손실 트리거", description: "굶기로 살을 빼면 지방보다 근육이 먼저 빠져 요요 위험" }], environmentChange: "운동을 '살 빼는 것'이 아닌 '근육 유지'로 목적을 바꾸세요. 30분 걷기부터 충분합니다.", weekPlan: ["1-2일차: 매일 10~15분 걷기부터 시작", "3-4일차: 식단에 단백질 1가지씩 추가하기 (근손실 방지)", "5-7일차: 계단 오르기·스트레칭 등 일상 활동 늘리기"] },
};

// ── 무료 리포트 UI 컴포넌트 ──────────────────────────────────────
function RelapseRiskReport({ failureType }: { failureType: FailureType }) {
  const d = RELAPSE_DATA[failureType];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${d.color}20` }}>
      <div className="px-5 py-4" style={{ background: d.color }}>
        <p className="text-xs font-black tracking-widest text-white opacity-80 mb-1">재발 가능성 분석</p>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-white">{d.pct}%</span>
          <span className="text-sm font-black text-white opacity-90 mb-1">{d.level}</span>
        </div>
        <div className="mt-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)", height: 6 }}>
          <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: "white" }} />
        </div>
      </div>
      <div className="bg-white px-5 py-4 space-y-4">
        <div>
          <p className="text-xs font-black mb-1.5" style={{ color: d.color }}>왜 재발하나요?</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>{d.mainRisk}</p>
        </div>
        <div>
          <p className="text-xs font-black mb-2" style={{ color: "var(--navy)" }}>⚠ 이 순간 특히 조심하세요</p>
          <div className="space-y-1.5">
            {d.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-black w-4 shrink-0" style={{ color: d.color }}>•</span>
                <span className="text-xs leading-snug text-gray-600">{w}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "rgba(30,58,95,0.04)", border: "1px solid rgba(30,58,95,0.08)" }}>
          <p className="text-xs font-black mb-1.5" style={{ color: "var(--navy)" }}>💡 지금 당장 할 수 있는 예방법</p>
          <p className="text-xs leading-relaxed text-gray-600">{d.prevention}</p>
        </div>
      </div>
    </div>
  );
}

function BingeRiskReport({ failureType }: { failureType: FailureType }) {
  const d = BINGE_DATA[failureType];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "2px solid rgba(30,58,95,0.1)" }}>
      <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
        <p className="text-xs font-black tracking-widest mb-2" style={{ color: "var(--amber)" }}>폭식 위험도</p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-sm" style={{ background: i < d.score ? d.color : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
        </div>
        <div className="flex items-end gap-2 mt-2">
          <span className="text-3xl font-black text-white">{d.score}<span className="text-lg">/10</span></span>
          <span className="text-sm font-black mb-1" style={{ color: d.color }}>{d.label}</span>
        </div>
      </div>
      <div className="bg-white px-5 py-4 space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>{d.description}</p>
        <div>
          <p className="text-xs font-black mb-2" style={{ color: "var(--navy)" }}>주요 폭식 트리거</p>
          <div className="flex flex-wrap gap-2">
            {d.triggers.map((t, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: "var(--beige)", color: "var(--navy)" }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "rgba(30,58,95,0.04)", border: "1px solid rgba(30,58,95,0.08)" }}>
          <p className="text-xs font-black mb-1.5" style={{ color: "var(--navy)" }}>💡 핵심 대처법</p>
          <p className="text-xs leading-relaxed text-gray-600">{d.tip}</p>
        </div>
      </div>
    </div>
  );
}

function DeepReportContent({ failureType }: { failureType: FailureType }) {
  const d = DEEP_DATA[failureType];
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>핵심 원인 분석</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--navy)" }}>{d.rootCause}</p>
      </div>
      <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>트리거 심층 분석</p>
        <div className="space-y-3">
          {d.triggerAnalysis.map(({ trigger, description }, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-xs font-black px-2.5 py-1 rounded-full shrink-0 h-fit" style={{ background: "rgba(212,168,83,0.15)", color: "var(--amber)" }}>{trigger}</span>
              <p className="text-xs leading-relaxed text-gray-500 pt-1">{description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-5" style={{ background: "var(--navy)" }}>
        <p className="text-xs font-black tracking-widest mb-2" style={{ color: "var(--amber)" }}>지금 바꿔야 할 환경</p>
        <p className="text-sm leading-relaxed text-white">{d.environmentChange}</p>
      </div>
      <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <p className="text-xs font-black tracking-widest mb-3" style={{ color: "var(--amber)" }}>이번 주 실천 계획</p>
        <div className="space-y-2.5">
          {d.weekPlan.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5" style={{ background: "var(--amber)", color: "var(--navy)" }}>{i + 1}</span>
              <p className="text-xs leading-snug text-gray-600">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 연락처 수집 모달 ──────────────────────────────────────────────
function LeadCaptureModal({ reportType, failureType, onSubmit, onClose }: {
  reportType: ReportType;
  failureType: FailureType;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [kakaoId, setKakaoId] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const LABELS: Record<ReportType, string> = {
    relapse_risk: "재발 가능성 분석",
    binge_risk: "폭식 위험도 분석",
    deep_report: "심층 리포트",
  };

  async function handleSubmit() {
    if (!name.trim()) { setError("이름을 입력해주세요"); return; }
    if (!phone.trim() && !kakaoId.trim()) { setError("전화번호 또는 카카오ID 중 하나를 입력해주세요"); return; }
    if (!consent) { setError("개인정보 수집 동의가 필요합니다"); return; }
    setError("");
    setSubmitting(true);
    await trackEvent({
      eventName: "free_report_lead_captured",
      resultType: FAILURE_TYPE_INFO[failureType].label,
      interest: reportType,
      name: name.trim(),
      phone: phone.trim() || undefined,
      kakaoId: kakaoId.trim() || undefined,
    });
    localStorage.setItem("wg_free_report_lead_done", "1");
    setSubmitting(false);
    onSubmit();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl p-6 pb-10" style={{ background: "white" }} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(0,0,0,0.15)" }} />
        <p className="text-xs font-black tracking-widest mb-1" style={{ color: "var(--amber)" }}>1개월 무료 제공</p>
        <p className="font-black text-lg mb-0.5" style={{ color: "var(--navy)" }}>연락처를 남기면 바로 공개돼요</p>
        <p className="text-xs text-gray-400 mb-5">{LABELS[reportType]} · 광고 없음</p>

        <div className="space-y-2.5 mb-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="이름 (필수)" className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid rgba(30,58,95,0.15)", outline: "none", fontFamily: "inherit" }} />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="전화번호 (선택)" type="tel" className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid rgba(30,58,95,0.15)", outline: "none", fontFamily: "inherit" }} />
          <input value={kakaoId} onChange={e => setKakaoId(e.target.value)} placeholder="카카오톡 ID (선택)" className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: "1.5px solid rgba(30,58,95,0.15)", outline: "none", fontFamily: "inherit" }} />
          <p className="text-xs text-gray-400 pl-1">※ 전화번호·카카오ID 중 하나는 필요해요</p>
        </div>

        <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0" />
          <span className="text-xs text-gray-500 leading-relaxed">
            개인정보(이름·연락처) 수집 및 이용에 동의합니다.
            수집 목적: 무료 리포트 제공. 보유 기간: 서비스 종료 시까지.{" "}
            <span style={{ color: "var(--amber)" }}>삭제 요청: jhong9198@gmail.com</span>
          </span>
        </label>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 rounded-2xl font-black text-base" style={{ background: "var(--amber)", color: "var(--navy)" }}>
          {submitting ? "저장 중..." : "무료로 분석 결과 보기 →"}
        </button>
        <button onClick={onClose} className="w-full py-3 text-xs text-center" style={{ color: "rgba(0,0,0,0.3)" }}>닫기</button>
      </div>
    </div>
  );
}

// ── 무료 리포트 섹션 ─────────────────────────────────────────────
function FreeReportSection({ failureType }: { failureType: FailureType }) {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);

  function handleClick(key: ReportType) {
    void trackEvent({ eventName: REPORT_META[key].eventName, resultType: FAILURE_TYPE_INFO[failureType].label });
    setActiveReport(prev => prev === key ? null : key);
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(30,58,95,0.12)" }}>
        <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
          <p className="font-black text-white text-sm">더 깊이 알고 싶으신가요?</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            무료로 더 자세한 분석을 볼 수 있어요
          </p>
        </div>
        <div className="bg-white px-5 py-4 space-y-2.5">
          {(Object.entries(REPORT_META) as [ReportType, typeof REPORT_META[ReportType]][]).map(([key, meta], idx) => (
            <button
              key={key}
              onClick={() => handleClick(key)}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-left px-4 transition-all hover:scale-[1.01] flex items-center gap-2.5"
              style={
                activeReport === key
                  ? { background: "var(--navy)", color: "var(--amber)" }
                  : idx === 0
                  ? { background: "var(--amber)", color: "var(--navy)" }
                  : { background: "rgba(30,58,95,0.05)", color: "var(--navy)", border: "1.5px solid rgba(30,58,95,0.1)" }
              }
            >
              <span className="text-base">{meta.icon}</span>
              <span className="flex-1">{meta.label}</span>
              <span className="text-xs opacity-50">{activeReport === key ? "▲" : "→"}</span>
            </button>
          ))}
        </div>
      </div>

      {activeReport === "binge_risk"   && <BingeRiskReport failureType={failureType} />}
      {activeReport === "relapse_risk" && <RelapseRiskReport failureType={failureType} />}
      {activeReport === "deep_report"  && <DeepReportContent failureType={failureType} />}
    </>
  );
}

// ── 7일 점수 추적 ─────────────────────────────────────────────────
interface DiagnosisSnapshot {
  date: string;
  failureType: FailureType;
  bingeScore: number;
  relapseRisk: number;
}

function loadDiagnosisSnapshot(): DiagnosisSnapshot | null {
  try {
    const raw = localStorage.getItem("wg_diagnosis_snapshot");
    return raw ? (JSON.parse(raw) as DiagnosisSnapshot) : null;
  } catch { return null; }
}

function saveDiagnosisSnapshot(snap: DiagnosisSnapshot) {
  localStorage.setItem("wg_diagnosis_snapshot", JSON.stringify(snap));
}

function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

type ComparisonState =
  | { kind: "first" }
  | { kind: "waiting"; daysLeft: number }
  | { kind: "ready"; prev: DiagnosisSnapshot };

// ── 7일 비교 배너 ─────────────────────────────────────────────────
function ScoreComparisonBanner({
  prev,
  curr,
  onClose,
}: {
  prev: DiagnosisSnapshot;
  curr: { failureType: FailureType; bingeScore: number; relapseRisk: number };
  onClose: () => void;
}) {
  const bingeDelta = curr.bingeScore - prev.bingeScore;
  const improved = bingeDelta <= 0;
  const daysAgo = daysSince(prev.date);
  const prevInfo = FAILURE_TYPE_INFO[prev.failureType];
  const currInfo = FAILURE_TYPE_INFO[curr.failureType];
  const accentColor = improved ? "#27AE60" : "#E05252";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${accentColor}`, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
      <div className="px-5 py-4" style={{ background: accentColor }}>
        <p className="text-xs font-black tracking-widest text-white opacity-80 mb-1">
          {daysAgo}일 전 결과와 비교
        </p>
        <p className="font-black text-white text-lg leading-snug">
          {improved ? "점수가 개선됐어요! 🎉" : "위험도가 높아졌어요 ⚠️"}
        </p>
      </div>
      <div className="bg-white px-5 py-5 space-y-4">
        {prev.failureType !== curr.failureType && (
          <div className="flex items-center gap-2 text-sm">
            <span>{prevInfo.emoji} <span style={{ color: "var(--navy)" }}>{prevInfo.label}</span></span>
            <span className="text-gray-400">→</span>
            <span>{currInfo.emoji} <span style={{ color: accentColor }}>{currInfo.label}</span></span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--beige)" }}>
            <p className="text-xs text-gray-400 mb-1">{daysAgo}일 전</p>
            <p className="text-2xl font-black" style={{ color: "var(--navy)" }}>
              {prev.bingeScore}<span className="text-sm font-semibold">/10</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">폭식 위험도</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: improved ? "rgba(39,174,96,0.1)" : "rgba(224,82,82,0.1)" }}>
            <p className="text-xs text-gray-400 mb-1">지금</p>
            <p className="text-2xl font-black" style={{ color: accentColor }}>
              {curr.bingeScore}<span className="text-sm font-semibold">/10</span>
            </p>
            <p className="text-xs font-bold mt-0.5" style={{ color: accentColor }}>
              {bingeDelta > 0 ? `+${bingeDelta}점 상승` : bingeDelta < 0 ? `${Math.abs(bingeDelta)}점 하락` : "변화 없음"}
            </p>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--navy)" }}>
          <p className="text-xs font-black mb-1.5" style={{ color: "var(--amber)" }}>
            {improved ? "이 흐름을 계속 유지하려면" : "지금 바로 개입이 필요해요"}
          </p>
          <p className="text-sm text-white leading-snug mb-3">
            {improved
              ? "7일마다 추적하면 어떤 습관이 효과 있는지 정확히 알 수 있어요."
              : "위험도가 올라가고 있어요. 패턴을 추적하면 언제, 왜 올라가는지 보이기 시작합니다."}
          </p>
          <button
            onClick={() => {
              void trackEvent({ eventName: "score_comparison_subscribe_click" });
              window.open(KAKAO_OPENCHAT_URL, "_blank");
            }}
            className="w-full py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02]"
            style={{ background: "var(--amber)", color: "var(--navy)" }}
          >
            7일마다 변화 추적하기 →
          </button>
        </div>
        <button onClick={onClose} className="w-full py-2 text-xs text-center text-gray-400">
          닫기
        </button>
      </div>
    </div>
  );
}

// ── 7일 후 재진단 유도 뱃지 ──────────────────────────────────────
function SevenDayReminderBadge({ state }: { state: ComparisonState }) {
  if (state.kind === "ready") return null;
  const isFirst = state.kind === "first";
  const daysLeft = state.kind === "waiting" ? state.daysLeft : 7;

  return (
    <div className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: "rgba(212,168,83,0.1)", border: "1.5px solid rgba(212,168,83,0.35)" }}>
      <span className="text-3xl shrink-0">📊</span>
      <div>
        <p className="font-black text-sm" style={{ color: "var(--navy)" }}>
          {isFirst ? "오늘 결과가 저장됐어요" : `D-${daysLeft} · 비교 결과 준비 중`}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {isFirst
            ? "7일 뒤 다시 진단하면 점수 변화를 비교해 드려요"
            : `${daysLeft}일 뒤 진단하면 지금 결과와 비교해 드려요`}
        </p>
      </div>
    </div>
  );
}

// ── 유료 심층 리포트 CTA ──────────────────────────────────────────
function PaidReportCTA({ failureType }: { failureType: FailureType }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const info = FAILURE_TYPE_INFO[failureType];

  useEffect(() => {
    setAlreadyPaid(!!localStorage.getItem("wg_paid_report_unlocked"));
  }, []);

  async function handlePayment() {
    void trackEvent({ eventName: "payment_cta_click", resultType: info.label });
    setLoading(true);

    const merchantUid = `wg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem("wg_pending_merchant_uid", merchantUid);
    localStorage.setItem("wg_pending_failure_type", failureType);

    const impCode = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE ?? "";
    if (!impCode) {
      console.error(
        "[Payment] NEXT_PUBLIC_PORTONE_IMP_CODE 환경변수가 설정되지 않았습니다.\n" +
        "  1. .env.local 에 NEXT_PUBLIC_PORTONE_IMP_CODE=impXXXXXXXX 추가\n" +
        "  2. Vercel 대시보드 → Settings → Environment Variables 에도 동일하게 추가 후 재배포"
      );
      alert("결제창을 열 수 없습니다.\n잠시 후 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        if ((window as ImpWindow).IMP) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://cdn.iamport.kr/v1/iamport.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("SDK 로드 실패"));
        document.head.appendChild(s);
      });
    } catch {
      setLoading(false);
      return;
    }

    const IMP = (window as ImpWindow).IMP;
    if (!IMP) { setLoading(false); return; }

    IMP.init(impCode);
    void trackEvent({ eventName: "payment_started", resultType: info.label });

    IMP.request_pay(
      {
        pay_method: "card",
        merchant_uid: merchantUid,
        name: "식습관 분석 리포트",
        amount: 4900,
        buyer_name: "고객",
        buyer_tel: "01000000000",
      },
      async (rsp) => {
        if (rsp.success) {
          const res = await fetch("/api/payment/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imp_uid: rsp.imp_uid, merchant_uid: rsp.merchant_uid, amount: 4900 }),
          });
          if (res.ok) {
            void trackEvent({ eventName: "payment_success", resultType: info.label });
            localStorage.setItem("wg_paid_report_unlocked", merchantUid);
            router.push("/payment-success");
          } else {
            void trackEvent({ eventName: "payment_failed", resultType: info.label });
            localStorage.setItem("wg_last_payment_error", "결제 검증에 실패했습니다. 다시 시도해주세요.");
            router.push("/payment-fail");
          }
        } else {
          void trackEvent({ eventName: "payment_failed", resultType: info.label });
          localStorage.setItem("wg_last_payment_error", rsp.error_msg ?? "결제가 취소되었습니다.");
          setLoading(false);
          router.push("/payment-fail");
        }
      }
    );
  }

  if (alreadyPaid) {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "rgba(39,174,96,0.1)", border: "2px solid #27AE60" }}>
        <span className="text-2xl shrink-0">✅</span>
        <div className="flex-1">
          <p className="font-black text-sm" style={{ color: "#27AE60" }}>심층 리포트 구매 완료</p>
          <p className="text-xs text-gray-500 mt-0.5">전체 분석 리포트를 볼 수 있어요</p>
        </div>
        <Link href="/paid-report" className="px-4 py-2 rounded-xl font-black text-sm whitespace-nowrap"
          style={{ background: "#27AE60", color: "white" }}>
          보러가기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "2px solid var(--amber)", boxShadow: "0 4px 24px rgba(212,168,83,0.2)" }}>
      <div className="px-5 py-5" style={{ background: "var(--navy)" }}>
        <p className="text-xs font-black tracking-widest mb-1.5" style={{ color: "var(--amber)" }}>PREMIUM REPORT</p>
        <p className="font-black text-white text-lg leading-snug">식습관 분석 리포트</p>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
          {info.emoji} {info.label} 유형의 근본 원인과 맞춤 개선 플랜
        </p>
      </div>
      <div className="bg-white px-5 py-5">
        <div className="space-y-2 mb-5">
          {[
            "실패 패턴 근본 원인 심층 분석",
            "3가지 핵심 트리거 상세 분석",
            "지금 바꿔야 할 환경 설정 가이드",
            "7일 단계별 실천 플랜",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--navy)" }}>
              <span style={{ color: "var(--amber)" }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.02] disabled:opacity-60"
          style={{ background: "var(--amber)", color: "var(--navy)" }}
        >
          {loading ? "결제창 여는 중..." : "4,900원으로 심층 리포트 받기 →"}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2.5">카드 결제 · 7일 내 100% 환불 보장</p>
      </div>
    </div>
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
  const [comparisonState, setComparisonState] = useState<ComparisonState>({ kind: "first" });
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("wg_diagnosis");
    if (!raw) { router.push("/quiz"); return; }
    const parsed: DiagnosisAnswers = JSON.parse(raw);
    const type = getDiagnosisResult(parsed);
    const alreadyDone = localStorage.getItem("wg_direct_lead_done") === "1";

    const prevSnapshot = loadDiagnosisSnapshot();
    const currScore = BINGE_DATA[type].score;
    const currRelapse = RELAPSE_DATA[type].pct;

    const timer = setTimeout(() => {
      setFailureType(type);
      setAnswers(parsed);
      setIsUnlocked(alreadyDone);
      setLoading(false);

      if (prevSnapshot) {
        const days = daysSince(prevSnapshot.date);
        if (days >= 7) {
          setComparisonState({ kind: "ready", prev: prevSnapshot });
          setShowComparison(true);
          saveDiagnosisSnapshot({ date: new Date().toISOString(), failureType: type, bingeScore: currScore, relapseRisk: currRelapse });
          void trackEvent({ eventName: "score_comparison_viewed", resultType: FAILURE_TYPE_INFO[type].label });
        } else {
          setComparisonState({ kind: "waiting", daysLeft: 7 - days });
        }
      } else {
        setComparisonState({ kind: "first" });
        saveDiagnosisSnapshot({ date: new Date().toISOString(), failureType: type, bingeScore: currScore, relapseRisk: currRelapse });
      }

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

        {/* 7일 비교 배너 — 재방문 7일 이상 경과 시 */}
        {showComparison && comparisonState.kind === "ready" && failureType && (
          <ScoreComparisonBanner
            prev={comparisonState.prev}
            curr={{ failureType, bingeScore: BINGE_DATA[failureType].score, relapseRisk: RELAPSE_DATA[failureType].pct }}
            onClose={() => setShowComparison(false)}
          />
        )}

        {/* 7일 후 재진단 유도 뱃지 */}
        {!showComparison && <SevenDayReminderBadge state={comparisonState} />}

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
            <FreeReportSection failureType={failureType} />
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

        {/* 매일 충동 체크인 */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "2px solid var(--navy)" }}>
          <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
            <p className="text-xs font-black tracking-widest mb-1" style={{ color: "var(--amber)" }}>DAILY CHECK-IN</p>
            <p className="font-black text-white text-sm leading-snug">오늘 폭식 충동 몇 점이에요?</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              하루 5초 기록 → 7일 후 내 위험 패턴이 보여요
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <Link
              href="/checkin"
              onClick={() => void trackEvent({ eventName: "result_checkin_click", resultType: info.label })}
              className="block w-full text-center py-3.5 rounded-xl font-black text-sm"
              style={{ background: "var(--amber)", color: "var(--navy)" }}
            >
              오늘 충동 기록하기 →
            </Link>
          </div>
        </div>

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

        {/* 유료 심층 리포트 CTA — 항상 표시 */}
        <PaidReportCTA failureType={failureType} />

        <p className="text-xs text-gray-400 text-center leading-relaxed px-2 pb-2">
          본 결과는 생활습관 기반의 자기 점검 리포트입니다.
          의료적 진단을 대체하지 않으며, 개인에 따라 다를 수 있습니다.
        </p>
      </div>
    </main>
  );
}
