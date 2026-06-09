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
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);
  const [deepName, setDeepName] = useState("");
  const [deepEmail, setDeepEmail] = useState("");
  const [deepSubmitting, setDeepSubmitting] = useState(false);

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

        {/* 폭식 위험도 분석 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-800 font-semibold text-sm mb-1">🚨 내 폭식 위험도 분석</p>
          <p className="text-gray-500 text-xs mb-4">
            7일 기록을 기반으로 현재 폭식 위험도를 분석합니다.
          </p>
          {showRiskAnalysis ? (() => {
            const highEmotions = ["스트레스", "피곤함", "허무함"];
            const isHighEmotion = topEmotion ? highEmotions.includes(topEmotion) : false;
            const riskScore = Math.min(10, avgCraving + (isHighEmotion ? 1 : 0) + (completedCount < 4 ? 1 : 0));
            const riskLevel = riskScore >= 7 ? "높음" : riskScore >= 4 ? "보통" : "낮음";
            const riskColor = riskScore >= 7 ? "text-red-500" : riskScore >= 4 ? "text-orange-500" : "text-green-500";
            const barColor = riskScore >= 7 ? "bg-red-500" : riskScore >= 4 ? "bg-orange-400" : "bg-green-400";
            const riskDesc =
              riskScore >= 7
                ? "폭식 충동이 매우 자주, 강하게 나타나고 있습니다. 혼자 관리하기 어려운 수준일 수 있습니다."
                : riskScore >= 4
                ? "중간 수준의 폭식 패턴이 있습니다. 꾸준한 기록과 행동 대체 연습이 필요합니다."
                : "폭식 충동이 비교적 낮습니다. 지금의 패턴을 유지하면 충분합니다.";
            const tips =
              riskScore >= 7
                ? ["감정 일기 매일 쓰기", `${topEmotion ?? "스트레스"} 신호 오면 즉시 알아차리기`, "전문가 1:1 상담 고려하기"]
                : riskScore >= 4
                ? ["10분 지연 훈련 매일 반복", "대체 음식 항상 준비해두기", "주 1회 패턴 기록 돌아보기"]
                : ["지금 습관 유지하기", "월 1회 기록 점검", "주변에 성공 경험 나누기"];
            return (
              <div className="space-y-4">
                {/* 위험도 게이지 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">위험도</span>
                    <span className={`text-sm font-bold ${riskColor}`}>
                      {riskLevel} ({riskScore}/10)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${riskScore * 10}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">낮음</span>
                    <span className="text-xs text-gray-400">높음</span>
                  </div>
                </div>

                {/* 위험도 설명 */}
                <div className={`rounded-xl px-4 py-3 ${riskScore >= 7 ? "bg-red-50" : riskScore >= 4 ? "bg-orange-50" : "bg-green-50"}`}>
                  <p className={`text-sm leading-relaxed ${riskScore >= 7 ? "text-red-800" : riskScore >= 4 ? "text-orange-800" : "text-green-800"}`}>
                    {riskDesc}
                  </p>
                </div>

                {/* 취약 요인 */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
                  <p className="text-xs text-gray-500 font-semibold">취약 요인</p>
                  {avgCraving >= 6 && <p className="text-sm text-gray-700">• 평균 충동 강도가 높습니다 ({avgCraving}/10)</p>}
                  {isHighEmotion && <p className="text-sm text-gray-700">• {topEmotion} 감정이 폭식을 자주 유발합니다</p>}
                  {completedCount < 4 && <p className="text-sm text-gray-700">• 기록 일수가 적어 패턴 파악이 어렵습니다</p>}
                  {avgCraving < 6 && !isHighEmotion && completedCount >= 4 && (
                    <p className="text-sm text-gray-700">• 현재 뚜렷한 취약 요인이 없습니다</p>
                  )}
                </div>

                {/* 개선 방향 */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">개선 방향</p>
                  <div className="space-y-2">
                    {tips.map((tip, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
                        <span className="text-orange-500 font-bold text-xs">{i + 1}</span>
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })() : (
            <button
              onClick={() => {
                setShowRiskAnalysis(true);
                trackEvent({ eventName: "binge_risk_cta_clicked" });
              }}
              className="w-full bg-gradient-to-r from-red-400 to-orange-500 text-white py-3 rounded-xl font-bold text-sm"
            >
              🚨 내 폭식 위험도 분석 보기
            </button>
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
            <div className="space-y-3">
              <input
                type="text"
                placeholder="이름"
                value={deepName}
                onChange={(e) => setDeepName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
              <input
                type="email"
                placeholder="이메일 주소"
                value={deepEmail}
                onChange={(e) => setDeepEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                disabled={!deepName.trim() || !deepEmail.trim() || deepSubmitting}
                onClick={async () => {
                  if (!deepName.trim() || !deepEmail.trim()) return;
                  setDeepSubmitting(true);
                  await trackEvent({
                    eventName: "deep_report_clicked",
                    name: deepName.trim(),
                    email: deepEmail.trim(),
                  });
                  setDeepSubmitting(false);
                  setShowDeepReport(true);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-40"
              >
                {deepSubmitting ? "확인 중..." : "무료 심층 리포트 보기"}
              </button>
              <p className="text-center text-gray-400 text-xs">개인정보는 리포트 발송 외 사용되지 않습니다</p>
            </div>
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
