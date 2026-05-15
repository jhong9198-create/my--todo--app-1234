"use client";

import { useTransition } from "react";
import { deleteMeal } from "@/app/actions";
import type { Meal } from "@/types/recovery";

interface Props {
  meals: Meal[];
}

export default function MealList({ meals }: Props) {
  const [isPending, startTransition] = useTransition();

  if (meals.length === 0) {
    return (
      <p className="text-sm text-stone-400 dark:text-stone-600 py-3 text-center">
        아직 식사 기록이 없습니다
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {meals.map((meal) => (
        <li
          key={meal.id}
          className={`flex items-start gap-3 p-3 rounded-xl border ${
            meal.is_binge
              ? "border-red-200 bg-red-50/70 dark:border-red-800 dark:bg-red-900/10"
              : "border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/60"
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-stone-400 dark:text-stone-500">
                {meal.meal_time.slice(0, 5)}
              </span>
              {meal.location && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
                  {meal.location}
                </span>
              )}
              {meal.is_binge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">
                  폭식
                </span>
              )}
            </div>
            <p className="text-sm text-stone-900 dark:text-stone-100 mt-1 truncate">
              {meal.food_items}
            </p>
            {meal.emotional_state && (
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 truncate">
                {meal.emotional_state}
              </p>
            )}
          </div>
          <button
            onClick={() => startTransition(() => deleteMeal(meal.id))}
            disabled={isPending}
            className="text-stone-300 hover:text-red-400 dark:text-stone-600 dark:hover:text-red-400 transition-colors shrink-0 pt-1"
            aria-label="삭제"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
