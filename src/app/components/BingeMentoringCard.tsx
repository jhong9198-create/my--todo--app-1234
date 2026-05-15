"use client";

import { useState, useTransition } from "react";
import { getBingeMentoring } from "@/app/ai-actions";

const COACHING_MESSAGES = [
  {
    emoji: "🌱",
    title: "이 순간이 변화의 데이터예요",
    body: "폭식 에피소드는 실패가 아니라 내 습관 루프를 이해하는 귀중한 데이터예요. 어떤 신호(Cue)가 이 행동을 불러왔는지 살펴보면 다음번에 달라질 수 있어요.",
  },
  {
    emoji: "🌿",
    title: "폭식은 의지력 문제가 아니에요",
    body: "폭식은 뇌의 자동화된 습관 루프가 작동한 것이에요 — 당신이 약해서가 아니에요. 신호(Cue) → 폭식(Routine) → 일시적 안도(Reward)의 패턴을 인식하는 것이 변화의 첫 걸음입니다.",
  },
  {
    emoji: "🍃",
    title: "자책보다 탐색이 먼저예요",
    body: "지금 드는 죄책감은 변화에 도움이 되지 않아요. 대신 '어떤 신호가 이 행동을 불러왔을까?'를 판단 없이 부드럽게 탐색해보세요. 그 답 속에 변화의 전략이 있어요.",
  },
  {
    emoji: "🌾",
    title: "작은 행동부터 시작해요",
    body: "지금 딱 한 가지만 해보세요. 물 한 잔 마시고, 4-7-8 호흡(4초 들이쉬고, 7초 참고, 8초 내쉬기)을 세 번 반복해요. 작은 행동이 습관 루프를 끊는 시작점이 됩니다.",
  },
  {
    emoji: "🌻",
    title: "패턴이 보여야 변화가 시작돼요",
    body: "오늘 이 기록이 쌓여서 내 트리거 패턴이 보이기 시작해요. 기록을 이어가는 것 자체가 변화를 향한 의지의 증거예요.",
  },
];

interface Props {
  logId: string;
  bingeCount: number;
  latestBingeMeal?: { food_items: string; emotional_state: string | null } | null;
}

export default function BingeMentoringCard({ logId, bingeCount, latestBingeMeal }: Props) {
  const [msgIdx] = useState(() => Math.floor(Math.random() * COACHING_MESSAGES.length));
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const msg = COACHING_MESSAGES[msgIdx];

  function handleAICoaching() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await getBingeMentoring(logId, latestBingeMeal ?? null);
        setAiMessage(result);
      } catch {
        setError("잠시 후 다시 시도해주세요.");
      }
    });
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-400 hover:bg-amber-100 transition-colors"
      >
        🌿 행동변화 코칭 보기 (폭식 {bingeCount}회 기록됨)
      </button>
    );
  }

  return (
    <section className="rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-800 shadow-sm">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <p className="text-white font-semibold text-sm">행동변화 코칭</p>
            <p className="text-green-200 text-xs">오늘 폭식 에피소드 {bingeCount}회 · 트리거 분석 중</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="text-green-200 hover:text-white text-lg transition-colors"
        >
          ×
        </button>
      </div>

      <div className="bg-amber-50/60 dark:bg-amber-900/10 p-5 space-y-4">
        {/* 기본 코칭 메시지 */}
        {!aiMessage && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{msg.emoji}</span>
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                {msg.title}
              </h3>
            </div>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-8">
              {msg.body}
            </p>
          </div>
        )}

        {/* AI 맞춤 코칭 메시지 */}
        {aiMessage && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                AI 맞춤 코칭
              </h3>
            </div>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-8 whitespace-pre-line">
              {aiMessage}
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}

        {/* 즉시 실행 전략 */}
        <div className="bg-white/70 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wide">
            지금 바로 할 수 있는 것
          </p>
          <ul className="space-y-1.5 text-sm text-stone-700 dark:text-stone-300">
            <li className="flex items-center gap-2">
              <span className="text-base">💧</span> 물 한 잔 천천히 마시기
            </li>
            <li className="flex items-center gap-2">
              <span className="text-base">🍃</span> 4-7-8 호흡 3회 (4초 들이쉬고, 7초 참고, 8초 내쉬기)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-base">🚶</span> 5분 산책으로 신체 상태 전환하기
            </li>
            <li className="flex items-center gap-2">
              <span className="text-base">📝</span> 식사 전 어떤 신호(Cue)가 있었는지 기록하기
            </li>
          </ul>
        </div>

        {/* AI 코칭 버튼 */}
        {!aiMessage && (
          <button
            onClick={handleAICoaching}
            disabled={isPending}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                AI 코칭 메시지 생성 중...
              </span>
            ) : (
              "🌿 AI 맞춤 코칭 메시지 받기"
            )}
          </button>
        )}
      </div>
    </section>
  );
}
