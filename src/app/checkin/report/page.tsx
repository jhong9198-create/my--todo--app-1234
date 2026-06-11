"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/tracking";

const KAKAO_OPENCHAT_URL = "https://open.kakao.com/o/pJpkL2yi";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const EMOTION_EMOJIS: Record<string, string> = {
  배고픔: "🍽️",
  스트레스: "😤",
  심심함: "😐",
  피로: "😴",
  습관: "🔄",
};

type CheckinRow = {
  craving_score: number;
  emotion: string;
  date_kst: string;
  created_at: string;
};

function getDeviceId(): string {
  const KEY = "wg_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export default function CheckinReportPage() {
  const [rows, setRows] = useState<CheckinRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notEnough, setNotEnough] = useState(false);

  useEffect(() => {
    void (async () => {
      const deviceId = getDeviceId();
      const res = await fetch(`/api/checkin?device_id=${deviceId}`);
      const json = await res.json() as { ok: boolean; data: CheckinRow[] };
      const data = json.data ?? [];

      // 날짜별 최신 1개만 유지 (중복 제거)
      const byDate = new Map<string, CheckinRow>();
      for (const r of data) {
        if (!byDate.has(r.date_kst)) byDate.set(r.date_kst, r);
      }
      const deduped = Array.from(byDate.values());

      if (deduped.length < 3) {
        setNotEnough(true);
      } else {
        setRows(deduped);
        void trackEvent({ eventName: "checkin_report_viewed" });
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--beige)" }}>
        <p className="text-gray-400 text-sm">분석 중...</p>
      </main>
    );
  }

  if (notEnough) {
    const streak = parseInt(localStorage.getItem("wg_checkin_streak") ?? "0");
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: "var(--beige)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="font-black text-xl mb-2" style={{ color: "var(--navy)" }}>아직 데이터가 부족해요</p>
          <p className="text-sm text-gray-500 mb-6">{3 - streak}일 더 기록하면 패턴 리포트가 열려요</p>
          <Link href="/checkin" className="w-full py-4 rounded-2xl font-black text-base text-center block"
            style={{ background: "var(--amber)", color: "var(--navy)" }}>
            오늘 기록하러 가기 →
          </Link>
        </div>
      </main>
    );
  }

  // ── 분석 계산 ──────────────────────────────────────────
  const avgScore = rows.reduce((s, r) => s + r.craving_score, 0) / rows.length;

  // 요일별 평균
  const dayMap: Record<number, number[]> = {};
  for (const r of rows) {
    const dow = new Date(r.date_kst + "T00:00:00").getDay();
    if (!dayMap[dow]) dayMap[dow] = [];
    dayMap[dow].push(r.craving_score);
  }
  const dayAvg = DAY_NAMES.map((name, i) => ({
    name,
    avg: dayMap[i] ? dayMap[i].reduce((a, b) => a + b, 0) / dayMap[i].length : 0,
    count: dayMap[i]?.length ?? 0,
  }));
  const maxDayAvg = Math.max(...dayAvg.map((d) => d.avg));
  const worstDay = dayAvg.reduce((a, b) => (a.avg >= b.avg ? a : b));

  // 감정 집계
  const emotionMap: Record<string, number> = {};
  for (const r of rows) {
    emotionMap[r.emotion] = (emotionMap[r.emotion] ?? 0) + 1;
  }
  const sortedEmotions = Object.entries(emotionMap).sort((a, b) => b[1] - a[1]);
  const topEmotion = sortedEmotions[0];

  // 시간대 분석 (KST hour)
  const hourMap: Record<number, number[]> = {};
  for (const r of rows) {
    const utcHour = new Date(r.created_at).getUTCHours();
    const kstHour = (utcHour + 9) % 24;
    const slot = Math.floor(kstHour / 6); // 0=새벽, 1=오전, 2=오후, 3=저녁
    if (!hourMap[slot]) hourMap[slot] = [];
    hourMap[slot].push(r.craving_score);
  }
  const slotNames = ["새벽 (0~6시)", "오전 (6~12시)", "오후 (12~18시)", "저녁 (18~24시)"];
  const slotAvgs = [0, 1, 2, 3].map((s) =>
    hourMap[s] ? hourMap[s].reduce((a, b) => a + b, 0) / hourMap[s].length : 0
  );
  const worstSlotIdx = slotAvgs.indexOf(Math.max(...slotAvgs));

  // ─────────────────────────────────────────────────────

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--beige)" }}>
      <div className="max-w-sm mx-auto">
        <Link href="/checkin" className="text-xs text-gray-400 mb-6 block">← 체크인</Link>

        <p className="text-xs font-black tracking-widest mb-1" style={{ color: "var(--amber)" }}>PATTERN REPORT</p>
        <h1 className="text-2xl font-black mb-1" style={{ color: "var(--navy)" }}>나의 폭식 패턴</h1>
        <p className="text-xs text-gray-400 mb-8">{rows.length}일 기록 기반 분석</p>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-4 text-center bg-white">
            <p className="text-3xl font-black" style={{ color: "var(--navy)" }}>
              {avgScore.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400 mt-1">평균 충동 점수</p>
          </div>
          <div className="rounded-2xl p-4 text-center bg-white">
            <p className="text-3xl font-black" style={{ color: "var(--navy)" }}>
              {rows.length}일
            </p>
            <p className="text-xs text-gray-400 mt-1">기록 일수</p>
          </div>
        </div>

        {/* 위험 하이라이트 */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: "2px solid var(--navy)" }}>
          <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
            <p className="text-xs font-black tracking-widest" style={{ color: "var(--amber)" }}>⚠ 가장 위험한 패턴</p>
          </div>
          <div className="bg-white px-5 py-4 space-y-3">
            {worstDay.count > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">위험 요일</span>
                <span className="font-black text-base" style={{ color: "var(--navy)" }}>
                  {worstDay.name}요일 ({worstDay.avg.toFixed(1)}점)
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">위험 시간대</span>
              <span className="font-black text-base" style={{ color: "var(--navy)" }}>
                {slotNames[worstSlotIdx]}
              </span>
            </div>
            {topEmotion && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">주요 트리거</span>
                <span className="font-black text-base" style={{ color: "var(--navy)" }}>
                  {EMOTION_EMOJIS[topEmotion[0]]} {topEmotion[0]} ({topEmotion[1]}회)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 요일별 바 차트 */}
        <div className="rounded-2xl bg-white p-5 mb-6">
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>요일별 충동 점수</p>
          <div className="space-y-2">
            {dayAvg.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-xs font-black w-5 text-right" style={{ color: "var(--navy)" }}>{d.name}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: "var(--beige)", height: 20 }}>
                  {d.avg > 0 && (
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(d.avg / 10) * 100}%`,
                        background: d.avg === maxDayAvg && maxDayAvg > 0 ? "var(--navy)" : "var(--amber)",
                      }}
                    />
                  )}
                </div>
                <span className="text-xs text-gray-400 w-8">
                  {d.avg > 0 ? d.avg.toFixed(1) : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 감정 분포 */}
        <div className="rounded-2xl bg-white p-5 mb-8">
          <p className="text-xs font-black tracking-widest mb-4" style={{ color: "var(--amber)" }}>감정 트리거 분포</p>
          <div className="flex flex-wrap gap-2">
            {sortedEmotions.map(([em, cnt]) => (
              <div key={em} className="flex items-center gap-1.5 px-3 py-2 rounded-full"
                style={{
                  background: em === topEmotion[0] ? "var(--navy)" : "var(--beige)",
                  color: em === topEmotion[0] ? "var(--amber)" : "var(--navy)",
                }}>
                <span className="text-sm">{EMOTION_EMOJIS[em]}</span>
                <span className="text-xs font-black">{em}</span>
                <span className="text-xs opacity-70">{cnt}회</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "2px solid var(--navy)" }}>
          <div className="px-5 py-4" style={{ background: "var(--navy)" }}>
            <p className="text-xs font-black tracking-widest mb-1" style={{ color: "var(--amber)" }}>전문가 연결</p>
            <p className="font-black text-white text-sm leading-snug">
              이 패턴, 어떻게 끊을 수 있을까요?
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              전문가가 오픈채팅에서 직접 답해드려요
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <a
              href={KAKAO_OPENCHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void trackEvent({ eventName: "checkin_report_kakao_click" })}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black text-base"
              style={{ background: "#FEE500", color: "#3A1D1D" }}
            >
              <span className="text-lg">💬</span>
              <span>카카오 오픈채팅 참여하기</span>
            </a>
          </div>
        </div>

        <Link href="/checkin" className="block text-center text-xs text-gray-400 mt-6">
          오늘 체크인 하러 가기 →
        </Link>
      </div>
    </main>
  );
}
