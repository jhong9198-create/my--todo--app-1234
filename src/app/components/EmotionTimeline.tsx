"use client";

const EMOTION_MAP: Record<string, { emoji: string; color: string; bg: string }> = {
  "불안":  { emoji: "🥺", color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
  "슬픔":  { emoji: "😢", color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  "분노":  { emoji: "😤", color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
  "공허":  { emoji: "😶", color: "text-stone-500 dark:text-stone-400",  bg: "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700" },
  "지침":  { emoji: "😰", color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
  "외로움":{ emoji: "😔", color: "text-indigo-600 dark:text-indigo-400",bg: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800" },
  "보통":  { emoji: "😌", color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
  "좋음":  { emoji: "🌟", color: "text-yellow-600 dark:text-yellow-400",bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" },
};

interface EmotionEntry {
  id: string;
  date: string;
  emotion_type: string | null;
  emotion_story: string | null;
  ai_comfort: string | null;
  recovery_message: string | null;
  mood: number;
  stress_level: number;
}

interface Props {
  history: EmotionEntry[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

export default function EmotionTimeline({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-center py-10 space-y-2">
        <span className="text-4xl block">🌱</span>
        <p className="text-sm text-stone-500 dark:text-stone-400">감정 기록이 쌓이면 타임라인이 나타나요</p>
        <p className="text-xs text-stone-400">감정기록 탭에서 오늘의 감정을 먼저 기록해보세요</p>
      </div>
    );
  }

  // 주요 감정 빈도 계산
  const counts: Record<string, number> = {};
  history.forEach(e => { if (e.emotion_type) counts[e.emotion_type] = (counts[e.emotion_type] ?? 0) + 1; });
  const topEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  // "내가 왜 무너지는지" 패턴 분석
  const collapseKeywords = ["스트레스", "야근", "혼자", "외로", "지쳐", "피곤", "배달", "야식", "힘들", "울"];
  const storiesText = history.map(e => e.emotion_story ?? "").join(" ");
  const foundKeywords = collapseKeywords.filter(k => storiesText.includes(k));

  return (
    <div className="space-y-5">

      {/* 핵심 인사이트 — "내가 왜 무너지는지" */}
      {(topEmotion || foundKeywords.length > 0) && (
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">💡</span>
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-200">내가 왜 무너지는지 — 패턴 인사이트</h3>
          </div>
          <div className="space-y-2.5">
            {topEmotion && (
              <div className="flex items-start gap-2.5">
                <span className="text-lg mt-0.5">{EMOTION_MAP[topEmotion[0]]?.emoji ?? "💙"}</span>
                <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                  가장 자주 느끼는 감정은 <span className={`font-bold ${EMOTION_MAP[topEmotion[0]]?.color ?? "text-stone-600"}`}>{topEmotion[0]}</span>이에요.
                  {" "}총 {topEmotion[1]}번 기록됐어요.
                </p>
              </div>
            )}
            {foundKeywords.length > 0 && (
              <div className="flex items-start gap-2.5">
                <span className="text-lg mt-0.5">🔍</span>
                <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                  기록 속에 자주 등장하는 단어: {" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {foundKeywords.slice(0, 4).join(", ")}
                  </span>
                  {". "}이런 상황에서 감정이 무너질 수 있어요.
                </p>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <span className="text-lg mt-0.5">🌱</span>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                이 패턴을 아는 것 자체가 변화의 시작이에요. 같은 상황이 올 때 알아차릴 수 있게 돼요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 타임라인 */}
      <div className="relative">
        {/* 세로 선 */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-green-200 to-stone-200 dark:from-indigo-900 dark:via-green-900 dark:to-stone-800" />

        <div className="space-y-4 pl-12">
          {history.map((entry) => {
            const em = EMOTION_MAP[entry.emotion_type ?? ""] ?? { emoji: "○", color: "text-stone-400", bg: "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700" };
            return (
              <div key={entry.id} className="relative">
                {/* 타임라인 도트 */}
                <div className={`absolute -left-12 w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl ${em.bg}`}>
                  {em.emoji}
                </div>

                <div className={`organic-card p-4 border ${em.bg}`}>
                  {/* 날짜 + 감정 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-400 dark:text-stone-500">{formatDate(entry.date)}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${em.color}`}>{entry.emotion_type}</span>
                      <span className="text-[10px] text-stone-400">기분{entry.mood} 스트레스{entry.stress_level}</span>
                    </div>
                  </div>

                  {/* 감정 이야기 */}
                  {entry.emotion_story && (
                    <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed mb-2.5">
                      {entry.emotion_story}
                    </p>
                  )}

                  {/* AI 공감 */}
                  {entry.ai_comfort && (
                    <div className="bg-white/60 dark:bg-stone-800/60 rounded-xl p-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed border border-stone-100 dark:border-stone-700">
                      <span className="text-indigo-500 font-semibold">AI 공감</span>
                      {" "}— {entry.ai_comfort.split("\n")[0]}
                    </div>
                  )}

                  {/* 회복 메시지 */}
                  {entry.recovery_message && (
                    <div className="mt-2 bg-green-50/60 dark:bg-green-900/20 rounded-xl p-3 text-xs text-green-700 dark:text-green-300 leading-relaxed border border-green-100 dark:border-green-900">
                      🌱 {entry.recovery_message.split("\n")[0]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
