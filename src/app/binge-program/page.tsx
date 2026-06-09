"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DAYS,
  loadProgram,
  getOrCreateProgram,
  getCompletedDays,
  getNextDay,
  type ProgramState,
} from "@/lib/binge-program";
import { trackEvent } from "@/lib/tracking";

export default function BingeProgramPage() {
  const router = useRouter();
  const [state, setState] = useState<ProgramState | null>(null);

  useEffect(() => {
    const program = loadProgram();
    setState(program);
  }, []);

  function handleStart() {
    const program = getOrCreateProgram();
    setState(program);
    const next = getNextDay(program);
    if (next <= 7) {
      trackEvent({ eventName: "binge_program_started" });
      router.push(`/binge-program/day/${next}`);
    } else {
      router.push("/binge-program/result");
    }
  }

  function handleGoToDay(day: number) {
    router.push(`/binge-program/day/${day}`);
  }

  const completedDays = state ? getCompletedDays(state) : [];
  const nextDay = state ? getNextDay(state) : 1;
  const allDone = nextDay === 8;

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-20">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 pt-14 pb-8">
        <p className="text-orange-100 text-sm mb-1">7일 무료 프로그램</p>
        <h1 className="text-2xl font-bold mb-2">7일 폭식 개선 프로그램</h1>
        <p className="text-orange-50 text-sm leading-relaxed">
          폭식은 의지 문제가 아니라 패턴 문제입니다.<br />
          7일 동안 내 폭식 신호를 기록하고<br />
          작은 행동으로 흐름을 끊어냅니다.
        </p>
        {state && (
          <div className="mt-4 bg-white/20 rounded-xl px-4 py-2 inline-block">
            <span className="text-white text-sm font-semibold">
              {completedDays.length}/7일 완료
            </span>
          </div>
        )}
      </div>

      <div className="px-5 mt-6 space-y-4">
        {/* 핵심 컨셉 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">핵심 개념</p>
          <div className="space-y-2">
            {[
              { icon: "🔍", text: "참는 다이어트가 아니라 신호 발견" },
              { icon: "📝", text: "매일 딱 하나의 작은 기록" },
              { icon: "🔄", text: "폭식해도 괜찮아요, 계속하면 됩니다" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-gray-700 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7일 그리드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">7일 미션</p>
          <div className="grid grid-cols-1 gap-2">
            {DAYS.map((d) => {
              const done = completedDays.includes(d.day);
              const isCurrent = d.day === nextDay;
              const locked = !done && !isCurrent;

              return (
                <button
                  key={d.day}
                  onClick={() => !locked && handleGoToDay(d.day)}
                  disabled={locked}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                    done
                      ? "bg-green-50 border border-green-200"
                      : isCurrent
                      ? "bg-orange-50 border border-orange-300"
                      : "bg-gray-50 border border-gray-100 opacity-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      done
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {done ? "✓" : d.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        done ? "text-green-700" : isCurrent ? "text-orange-700" : "text-gray-400"
                      }`}
                    >
                      DAY {d.day} · {d.title}
                    </p>
                  </div>
                  {done && <span className="text-green-500 text-xs">완료</span>}
                  {isCurrent && <span className="text-orange-500 text-xs font-semibold">오늘</span>}
                  {locked && <span className="text-gray-300 text-xs">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        {allDone ? (
          <button
            onClick={() => router.push("/binge-program/result")}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg"
          >
            📊 내 7일 패턴 결과 보기
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg"
          >
            {state && completedDays.length > 0
              ? `DAY ${nextDay} 미션 이어하기 →`
              : "DAY 1 시작하기 →"}
          </button>
        )}

        <p className="text-center text-gray-400 text-xs pb-4">
          매일 2분이면 충분합니다 · 무료 · 7일 프로그램
        </p>
      </div>
    </main>
  );
}
