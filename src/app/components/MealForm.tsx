"use client";

import { useTransition, useState } from "react";
import { addMeal } from "@/app/actions";
import { LOCATIONS } from "@/types/recovery";

export default function MealForm() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [isBinge, setIsBinge] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("is_binge", isBinge ? "true" : "false");
    startTransition(async () => {
      await addMeal(data);
      form.reset();
      setIsBinge(false);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors"
      >
        + 식사 추가
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            시간 *
          </label>
          <input
            name="meal_time"
            type="time"
            required
            defaultValue={new Date().toTimeString().slice(0, 5)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            장소
          </label>
          <select
            name="location"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">선택</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          먹은 것 *
        </label>
        <input
          name="food_items"
          type="text"
          required
          placeholder="예: 밥, 김치찌개, 물 한 잔"
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          먹기 전 감정
        </label>
        <input
          name="emotional_state"
          type="text"
          placeholder="예: 불안했음, 배고팠음, 스트레스받았음"
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setIsBinge((b) => !b)}
          className={`w-12 h-6 rounded-full transition-colors relative ${
            isBinge ? "bg-red-400" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
              isBinge ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          폭식 에피소드
        </span>
        {isBinge && (
          <span className="text-xs text-red-500 font-medium">기록됨</span>
        )}
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setIsBinge(false);
          }}
          className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 rounded-lg bg-rose-400 hover:bg-rose-500 disabled:bg-rose-200 text-white text-sm font-medium transition-colors"
        >
          {isPending ? "저장 중..." : "추가"}
        </button>
      </div>
    </form>
  );
}
