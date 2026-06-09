"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadProgram,
  saveProgram,
  getCompletedDays,
  getMostFrequent,
  type ProgramState,
} from "@/lib/binge-program";
import { trackEvent } from "@/lib/tracking";

export default function BingeProgramResultPage() {
  const router = useRouter();
  const [state, setState] = useState<ProgramState | null>(null);
  const [showDeepReport, setShowDeepReport] = useState(false);

  useEffect(() => {
    const program = loadProgram();
    setState(program);
    trackEvent({ eventName: "binge_program_finished" });
  }, []);

  if (!state) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-gray-500 mb-4">프로그램 기록이 없습니다.</p>
          <button
            onClick={() => router.push("/binge-program")}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            프로그램 시작하기
          </button>
        </div>
      </main>
    );
  }

  const completedDays = getCompletedDays(state);
  const completedCount = completedDays.length;

  // 패턴 분석
  const emotions = completedDays.map((d) => state.days[d]?.emotion).filter(Boolean);
  const actions = completedDays
    .filter((d) => d >= 3 && d <= 6)
    .map((d) => state.days[d]?.action_taken)
    .filter(Boolean);
  const avgCraving =
    completedDays.length > 0
      ? Math.round(
          completedDays.reduce((sum, d) => sum + (state.days[d]?.craving_level ?? 5), 0) /
            completedDays.length
        )
      : 0;

  const topEmotion = getMostFrequent(emotions);
  const topAction = getMostFrequent(actions);

  function handleRestart() {
    saveProgram({ started_at: new Date().toISOString(), days: {} });
    router.push("/binge-program");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-20">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 pt-14 pb-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold mb-2">
          당신의 폭식은<br />
          의지가 아니라 패턴이었습니다
        </h1>
        <p className="text-orange-100 text-sm leading-relaxed mt-3">
          이번 7일 기록을 보면, 특정 시간대와 감정에서<br />
          폭식 충동이 강해지는 경향이 있습니다.<br />
          앞으로는 참는 것보다, 충동이 오기 전<br />
          신호를 먼저 발견하는 것이 중요합니다.
        </p>
      </div>

      <div className="px-5 mt-6 space-y-4">
        {/* 완료 현황 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">7일 완료 현황</p>
          <div className="flex gap-2">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((d) => {
              const done = completedDays.includes(d);
              return (
                <div
                  key={d}
                  className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                    done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? "✓" : d}
                </div>
              );
            })}
          </div>
          <p className="text-gray-600 text-sm mt-3 font-semibold">
            7일 중 <span className="text-orange-500">{completedCount}일</span> 완료
          </p>
        </div>

        {/* 나의 폭식 패턴 분석 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">📊 내 폭식 패턴 분석</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-gray-600 text-sm">평균 폭식 충동 강도</span>
              <span className="text-orange-600 font-bold">{avgCraving}/10</span>
            </div>
            {topEmotion && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-gray-600 text-sm">가장 자주 느끼는 감정</span>
                <span className="text-orange-600 font-bold">{topEmotion}</span>
              </div>
            )}
            {topAction && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-gray-600 text-sm">나에게 맞는 대체 행동</span>
                <span className="text-orange-600 font-bold text-right max-w-[140px] text-xs leading-tight">{topAction}</span>
              </div>
            )}
          </div>

          {topEmotion && (
            <div className="mt-4 bg-orange-50 rounded-xl px-4 py-3">
              <p className="text-orange-800 text-sm leading-relaxed">
                <span className="font-semibold">{topEmotion}</span> 상태일 때 폭식 충동이 가장 강한 경향이 있습니다.
                다음 번엔 그 감정이 올 때 먼저 알아차려 보세요.
              </p>
            </div>
          )}
        </div>

        {/* 심층 리포트 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-800 font-semibold text-sm mb-1">🔍 심층 리포트</p>
          <p className="text-gray-500 text-xs mb-4">
            내 폭식 패턴을 더 자세히 분석하고 싶다면 무료로 심층 리포트를 확인하세요.
          </p>
          {showDeepReport ? (
            <div className="bg-gray-50 rounded-xl px-4 py-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">패턴 요약</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {completedCount >= 5
                    ? `${completedCount}일 기록을 분석한 결과, 당신의 폭식은 주로 ${topEmotion ?? "특정 감정"} 상태에서 발생하는 경향이 있습니다. ${topAction ? `"${topAction}"` : "행동 대체 전략"}이 가장 효과적이었습니다.`
                    : "더 많은 날을 기록할수록 정확한 패턴 분석이 가능합니다. 7일을 채워보세요!"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">다음 7일 추천</p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• 폭식 충동 기록을 1달 이상 이어가기</li>
                  {topAction && <li>• "{topAction}" 습관을 매일 루틴으로 만들기</li>}
                  {topEmotion && <li>• {topEmotion} 감정이 올 때 10분 지연 훈련 계속하기</li>}
                  <li>• 전문가 상담으로 패턴 근본 원인 찾기</li>
                </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowDeepReport(true);
                trackEvent({ eventName: "deep_report_clicked" });
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-bold text-sm"
            >
              무료 심층 리포트 보기
            </button>
          )}
        </div>

        {/* CTA 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={handleRestart}
            className="w-full bg-white border-2 border-orange-400 text-orange-500 py-3 rounded-xl font-bold"
          >
            🔄 다시 7일 시작하기
          </button>
          <button
            onClick={() => {
              trackEvent({ eventName: "expert_recommendation_clicked" });
              router.push("/businesses");
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-bold"
          >
            전문가 추천받기 →
          </button>
          <button
            onClick={() => router.push("/quiz")}
            className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold text-sm"
          >
            폭식 실패 원인 다시 진단하기
          </button>
        </div>
      </div>
    </main>
  );
}
