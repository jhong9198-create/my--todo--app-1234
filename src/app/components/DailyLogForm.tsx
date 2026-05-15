"use client";

import { useTransition, useState } from "react";
import { upsertDailyLog } from "@/app/actions";
import { MOOD_LABELS, MOOD_EMOJI, STRESS_LABELS, type DailyLog } from "@/types/recovery";

const MOOD_SHORT: Record<1|2|3|4|5, string> = {
  1: "매우 나쁨", 2: "나쁨", 3: "보통", 4: "좋음", 5: "매우 좋음"
};

interface Props {
  existing: DailyLog | null;
}

export default function DailyLogForm({ existing }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      await upsertDailyLog(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 기분 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          오늘 기분
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((v) => (
            <label key={v} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="mood"
                value={v}
                defaultChecked={existing?.mood === v || (!existing && v === 3)}
                className="sr-only peer"
                required
              />
              <div className="text-center p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 peer-checked:border-rose-400 peer-checked:bg-rose-50 dark:peer-checked:bg-rose-900/20 transition-all">
                <div className="text-2xl">{MOOD_EMOJI[v]}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                  {MOOD_SHORT[v]}
                </div>
              </div>
            </label>
          ))}
        </div>
        <input
          name="mood_note"
          type="text"
          defaultValue={existing?.mood_note ?? ""}
          placeholder="기분을 자세히 적어보세요 (선택)"
          className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      {/* 수면 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            수면 시간
          </label>
          <div className="relative">
            <input
              name="sleep_hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              defaultValue={existing?.sleep_hours ?? ""}
              placeholder="7.5"
              className="w-full px-3 py-2 pr-8 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <span className="absolute right-3 top-2 text-xs text-gray-400">시간</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            수면 질
          </label>
          <select
            name="sleep_quality"
            defaultValue={existing?.sleep_quality ?? ""}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">선택</option>
            {([1, 2, 3, 4, 5] as const).map((v) => (
              <option key={v} value={v}>
                {v} - {MOOD_SHORT[v]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 스트레스 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          스트레스 정도
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((v) => (
            <label key={v} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="stress_level"
                value={v}
                defaultChecked={
                  existing?.stress_level === v || (!existing && v === 1)
                }
                className="sr-only peer"
                required
              />
              <div className="text-center py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 peer-checked:border-amber-400 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-900/20 transition-all">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {v}
                </div>
                <div className="text-xs text-gray-400 hidden sm:block">
                  {STRESS_LABELS[v]}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          오늘 메모
        </label>
        <textarea
          name="notes"
          defaultValue={existing?.notes ?? ""}
          placeholder="오늘 있었던 일, 느낌을 자유롭게 적어보세요"
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-rose-400 hover:bg-rose-500 disabled:bg-rose-200 text-white font-semibold text-sm transition-colors"
      >
        {isPending ? "저장 중..." : saved ? "저장됨!" : "오늘 기록 저장"}
      </button>
    </form>
  );
}
