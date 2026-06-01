"use client";

import { useState, useTransition } from "react";
import { getRecoveryMessage } from "@/app/ai-actions";
import PremiumGate from "./PremiumGate";
import type { DailyLog } from "@/types/recovery";

interface Props {
  log: DailyLog | null;
}

export default function AIEmpathyCard({ log }: Props) {
  const [message, setMessage] = useState(log?.recovery_message ?? "");
  const [isPending, startTransition] = useTransition();

  function handleGet() {
    if (!log) return;
    startTransition(async () => {
      const result = await getRecoveryMessage(log.id);
      setMessage(result);
    });
  }

  const preview = (
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">💌</span>
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">AI 공감 메시지</h3>
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">
        오늘 기분·스트레스·수면 상태를 분석해 나에게 꼭 맞는 따뜻한 메시지를 생성해드려요.
      </p>
    </div>
  );

  return (
    <PremiumGate feature="AI 공감 메시지" description="오늘 상태를 분석해 나에게 딱 맞는 따뜻한 메시지를 생성해요">
      {!log ? preview : (
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💌</span>
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">AI 공감 메시지</h3>
          </div>

          {message ? (
            <div className="space-y-2.5">
              <div
                className="rounded-2xl rounded-tl-sm p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))",
                  border: "1px solid rgba(99,102,241,0.18)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base shadow-sm"
                    style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                  >
                    🌿
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1.5">
                      탐정 메시지
                    </p>
                    <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">{message}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleGet}
                disabled={isPending}
                className="text-xs text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline underline-offset-2"
              >
                {isPending ? "생성 중..." : "다른 메시지 받기"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGet}
              disabled={isPending}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  AI가 마음을 읽는 중...
                </span>
              ) : "💌 오늘의 공감 메시지 받기"}
            </button>
          )}
        </div>
      )}
    </PremiumGate>
  );
}
