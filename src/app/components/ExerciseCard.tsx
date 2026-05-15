"use client";

const DAILY = [
  {
    day: "일",
    title: "코어 & 회복",
    emoji: "🧘",
    color: "from-violet-500 to-purple-600",
    border: "border-violet-200 dark:border-violet-800",
    exercises: ["플랭크 30초 × 3회", "크런치 20회 × 3회", "고양이-소 스트레칭 10회"],
    tip: "일요일엔 코어를 단단히 — 한 주를 마무리해요",
  },
  {
    day: "월",
    title: "전신 활성화",
    emoji: "🔥",
    color: "from-orange-500 to-red-500",
    border: "border-orange-200 dark:border-orange-800",
    exercises: ["제자리 점프 1분", "스쿼트 15회 × 3세트", "팔굽혀펴기 10회 × 2세트"],
    tip: "월요일 5분으로 일주일 지방 연소를 시작해요!",
  },
  {
    day: "화",
    title: "하체 집중",
    emoji: "🦵",
    color: "from-green-600 to-emerald-600",
    border: "border-green-200 dark:border-green-800",
    exercises: ["런지 15회 × 3세트", "마운틴 클라이머 20초 × 3세트", "플랭크 40초 × 2세트"],
    tip: "하체 근육이 기초대사량을 높여줘요",
  },
  {
    day: "수",
    title: "인터벌 버닝",
    emoji: "⚡",
    color: "from-yellow-500 to-amber-500",
    border: "border-yellow-200 dark:border-yellow-800",
    exercises: ["버피 8회 × 3세트", "점핑잭 30회 × 2세트", "세트 사이 30초 휴식"],
    tip: "인터벌 운동은 운동 후에도 지방이 연소돼요",
  },
  {
    day: "목",
    title: "힙 & 코어",
    emoji: "🍑",
    color: "from-pink-500 to-rose-500",
    border: "border-pink-200 dark:border-pink-800",
    exercises: ["힙 브리지 20회 × 3세트", "사이드 런지 15회 × 2세트", "데드버그 10회 × 2세트"],
    tip: "힙 근육은 체형을 바꾸는 핵심이에요",
  },
  {
    day: "금",
    title: "고강도 인터벌",
    emoji: "🏃",
    color: "from-blue-500 to-sky-600",
    border: "border-blue-200 dark:border-blue-800",
    exercises: ["30초 전력 점프 + 30초 휴식", "× 5세트 반복", "총 5분 완성!"],
    tip: "금요일 HIIT로 주말 기초대사량 업!",
  },
  {
    day: "토",
    title: "활동적 회복",
    emoji: "🚶",
    color: "from-teal-500 to-cyan-600",
    border: "border-teal-200 dark:border-teal-800",
    exercises: ["계단 오르내리기 5분", "(없으면 제자리 발 높이 걷기)", "가볍게 땀이 날 정도"],
    tip: "토요일은 일상 속 활동으로 지방을 태워요",
  },
];

export default function ExerciseCard() {
  const today = DAILY[new Date().getDay()];

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border ${today.border}`}>
      {/* 헤더 */}
      <div className={`bg-gradient-to-r ${today.color} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70 mb-0.5">
              오늘의 5분 지방태우기 · {today.day}요일
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{today.emoji}</span>
              <h3 className="text-lg font-bold text-white">{today.title}</h3>
            </div>
          </div>
          <div className="text-5xl opacity-20">💪</div>
        </div>
      </div>

      {/* 운동 목록 */}
      <div className="bg-white/80 dark:bg-stone-800/80 px-5 py-4">
        <div className="space-y-2.5 mb-3">
          {today.exercises.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-700 text-[10px] font-bold text-stone-500 dark:text-stone-400 flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-stone-700 dark:text-stone-200">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-500 pt-3 border-t border-stone-100 dark:border-stone-700">
          💡 {today.tip}
        </p>
      </div>
    </div>
  );
}
