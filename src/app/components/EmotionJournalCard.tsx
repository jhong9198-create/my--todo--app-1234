"use client";

import { useState, useTransition } from "react";
import { saveEmotionJournal } from "@/app/actions";
import { getEmotionComfort, getRecoveryMessage } from "@/app/ai-actions";
import type { DailyLog, Meal } from "@/types/recovery";

const EMOTIONS = [
  { id: "불안",  emoji: "🥺", label: "불안해요" },
  { id: "슬픔",  emoji: "😢", label: "슬퍼요" },
  { id: "분노",  emoji: "😤", label: "화나요" },
  { id: "공허",  emoji: "😶", label: "공허해요" },
  { id: "지침",  emoji: "😰", label: "지쳐요" },
  { id: "외로움", emoji: "😔", label: "외로워요" },
  { id: "보통",  emoji: "😌", label: "괜찮아요" },
  { id: "좋음",  emoji: "🌟", label: "좋아요" },
];

interface Props {
  log: DailyLog | null;
  recentLogs: (DailyLog & { meals: Meal[] })[];
}

export default function EmotionJournalCard({ log, recentLogs }: Props) {
  const [emotionType, setEmotionType] = useState(log?.emotion_type ?? "");
  const [story, setStory] = useState(log?.emotion_story ?? "");
  const [comfort, setComfort] = useState(log?.ai_comfort ?? "");
  const [recovery, setRecovery] = useState(log?.recovery_message ?? "");
  const [journalSaved, setJournalSaved] = useState(!!log?.emotion_story);

  const [isPendingSave, startSave] = useTransition();
  const [isPendingComfort, startComfort] = useTransition();
  const [isPendingRecovery, startRecovery] = useTransition();

  function handleSave() {
    if (!log || !emotionType) return;
    startSave(async () => {
      await saveEmotionJournal(log.id, emotionType, story);
      setJournalSaved(true);
    });
  }

  function handleComfort() {
    if (!log) return;
    startComfort(async () => {
      const result = await getEmotionComfort(log.id);
      setComfort(result);
    });
  }

  function handleRecovery() {
    if (!log) return;
    startRecovery(async () => {
      const result = await getRecoveryMessage(log.id);
      setRecovery(result);
    });
  }

  // 최근 7일 감정 패턴 (오래된 → 최신 순)
  const pattern = [...recentLogs].slice(0, 7).reverse();
  const hasPattern = pattern.some((l) => l.emotion_type);

  if (!log) {
    return (
      <div className="organic-card p-8 text-center space-y-2">
        <span className="text-4xl block">💙</span>
        <p className="text-sm text-stone-500 dark:text-stone-400">오늘 상태 기록을 먼저 저장해주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ① 감정 선택 */}
      <div className="organic-card p-5">
        <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">오늘 지금 이 순간 어떤 감정인가요?</p>
        <div className="grid grid-cols-4 gap-2">
          {EMOTIONS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEmotionType(e.id)}
              className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                emotionType === e.id
                  ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-stone-200 dark:border-stone-700 hover:border-stone-300"
              }`}
            >
              <span className="text-2xl mb-1">{e.emoji}</span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight text-center">{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ② 오늘 왜 무너졌나요? */}
      <div className="organic-card p-5">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">
          📝 오늘 무슨 일이 있었나요?
        </h3>
        <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-3">
          왜 힘들었는지, 왜 배달시켰는지 — 판단 없이 솔직하게 적어보세요
        </p>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder={`예: "야근 후 지쳐서 혼자 배달음식을 시켰어요. 스트레스가 쌓여 있었고 보상받고 싶었어요."`}
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 dark:border-stone-700 rounded-xl bg-white/60 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 resize-none leading-relaxed"
        />
        <button
          onClick={handleSave}
          disabled={isPendingSave || !emotionType}
          className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40 text-white font-semibold text-sm transition-all"
        >
          {isPendingSave ? "저장 중..." : journalSaved ? "✓ 오늘 감정 저장됨 (수정 가능)" : "감정 기록 저장"}
        </button>
      </div>

      {/* ③ AI 공감 + 회복 메시지 (저장 후 표시) */}
      {journalSaved && (
        <div className="organic-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">💚 공감 & 회복</h3>

          {/* AI 공감 받기 */}
          {comfort ? (
            <div className="space-y-2">
              {/* 말풍선 */}
              <div className="relative bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl rounded-bl-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-base">
                    🌿
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">AI 공감</p>
                    <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                      {comfort}
                    </p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold mt-2.5">
                      항상 응원합니다 💚
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleComfort}
                disabled={isPendingComfort}
                className="text-xs text-stone-400 hover:text-indigo-600 transition-colors underline underline-offset-2"
              >
                {isPendingComfort ? "생성 중..." : "다시 공감받기"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleComfort}
              disabled={isPendingComfort}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-sm"
            >
              {isPendingComfort ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  AI가 공감 중...
                </span>
              ) : "💙 AI 공감받기"}
            </button>
          )}

          {/* 회복 메시지 */}
          {recovery ? (
            <div className="space-y-2">
              {/* 말풍선 — 회복 */}
              <div className="relative bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl rounded-bl-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-base">
                    🌱
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-green-700 dark:text-green-400 mb-1.5">회복 메시지</p>
                    <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                      {recovery}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRecovery}
                disabled={isPendingRecovery}
                className="text-xs text-stone-400 hover:text-green-600 transition-colors underline underline-offset-2"
              >
                {isPendingRecovery ? "생성 중..." : "다른 회복 메시지"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleRecovery}
              disabled={isPendingRecovery}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-sm"
            >
              {isPendingRecovery ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  생성 중...
                </span>
              ) : "🌱 회복 메시지 받기"}
            </button>
          )}
        </div>
      )}

      {/* ④ 내 감정 패턴 — 최근 7일 */}
      {hasPattern && (
        <div className="organic-card p-5">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">📈 내 감정 패턴 (최근 7일)</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pattern.map((l, i) => {
              const em = EMOTIONS.find((e) => e.id === l.emotion_type);
              return (
                <div key={i} className="flex flex-col items-center shrink-0 gap-1">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 ${
                    em ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20" : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  }`}>
                    {em?.emoji ?? <span className="text-stone-300 text-sm">?</span>}
                  </div>
                  <span className="text-[9px] text-stone-400">
                    {l.date.slice(5).replace("-", "/")}
                  </span>
                  {l.emotion_type && (
                    <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-medium">{l.emotion_type}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 가장 많은 감정 */}
          {(() => {
            const counts: Record<string, number> = {};
            pattern.forEach(l => { if (l.emotion_type) counts[l.emotion_type] = (counts[l.emotion_type] ?? 0) + 1; });
            const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            const topEm = top ? EMOTIONS.find(e => e.id === top[0]) : null;
            return top ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
                이번 주 가장 많은 감정: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{topEm?.emoji} {top[0]}</span> ({top[1]}일)
              </p>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}
