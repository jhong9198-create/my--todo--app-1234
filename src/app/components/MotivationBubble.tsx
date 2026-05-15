"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const EVENING_TIPS = [
  "지금 야식 생각 드세요? 물 한 잔 마시고 10분만 기다려보세요. 진짜 배고픔인지 심심함인지 알 수 있어요.",
  "밤 야식은 수면 중 지방으로 저장돼요. 오늘 밤 이 한 번의 참음이 내일 체중계를 바꿔요!",
  "야식 대신 따뜻한 허브티 어떠세요? 10분 후면 식욕이 줄어들 거예요.",
  "자기 전 야식 충동은 몸이 아닌 뇌의 신호예요. 잠깐 스트레칭하고 자리에 누워보세요.",
  "오늘 하루 정말 잘 버티셨어요! 이 마지막 순간도 이겨내면 내일 아침이 훨씬 상쾌해요.",
];

const EXIT_TIPS = [
  "오늘도 기록해 주셨군요! 이 작은 습관이 큰 변화를 만들어요.",
  "내일도 함께해요! 작은 기록이 쌓여 놀라운 변화가 됩니다.",
  "오늘 수고하셨어요. 내일 아침 체중도 꼭 기록해보세요!",
  "기록을 남기는 사람이 결국 목표를 이뤄요. 오늘도 멋진 하루였어요.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function MotivationBubble() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("🌿");
  const [key, setKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitShownRef = useRef(false);

  const show = useCallback((msg: string, lbl: string, ic: string) => {
    setMessage(msg);
    setLabel(lbl);
    setIcon(ic);
    setKey((k) => k + 1);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 20000);
  }, []);

  const dismiss = () => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    // 저녁 야식 주의보 (오후 7시~11시)
    const hour = new Date().getHours();
    const todayKey = `motivation_evening_${new Date().toDateString()}`;
    if (hour >= 19 && hour < 23 && !sessionStorage.getItem(todayKey)) {
      const t = setTimeout(() => {
        show(pick(EVENING_TIPS), "저녁 야식 주의보 🌙", "🌿");
        sessionStorage.setItem(todayKey, "1");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [show]);

  useEffect(() => {
    // 앱 종료/탭 전환 감지
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !exitShownRef.current) {
        exitShownRef.current = true;
        show(pick(EXIT_TIPS), "오늘도 수고하셨어요 👋", "🌱");
      }
      if (document.visibilityState === "visible") {
        exitShownRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [show]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!visible) return null;

  return (
    <div
      key={key}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm bubble-slide-up"
    >
      {/* 말풍선 카드 */}
      <div className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-600 p-4 pb-5">

        {/* 닫기 */}
        <button
          onClick={dismiss}
          aria-label="닫기"
          className="absolute top-2.5 right-3 text-stone-300 hover:text-stone-500 dark:hover:text-stone-300 text-lg leading-none transition-colors"
        >
          ×
        </button>

        {/* 본문 */}
        <div className="flex items-start gap-3 pr-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-xl shadow-sm">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-green-700 dark:text-green-400 mb-1.5">
              {label}
            </p>
            <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
              {message}
            </p>
            {/* 응원 한마디 */}
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-2.5 font-semibold">
              항상 응원합니다 💪
            </p>
          </div>
        </div>

        {/* 20초 타이머 바 */}
        <div className="mt-3 h-0.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full timer-bar" />
        </div>

        {/* 말풍선 꼬리 (아래 방향) */}
        <div
          className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-stone-800 border-r border-b border-stone-200 dark:border-stone-600 rotate-45"
        />
      </div>
    </div>
  );
}
