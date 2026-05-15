"use client";

import { useTransition, useState } from "react";
import { addMeal } from "@/app/actions";
import { LOCATIONS } from "@/types/recovery";

const MEAL_TYPES = [
  { label: "아침", emoji: "☀️", time: "08:00" },
  { label: "점심", emoji: "🌤️", time: "12:30" },
  { label: "저녁", emoji: "🌙", time: "19:00" },
  { label: "간식", emoji: "🍎", time: "15:00" },
  { label: "야식", emoji: "🌛", time: "22:00" },
] as const;

const EMOTION_TAGS = [
  { label: "배고픔", emoji: "🍽️" },
  { label: "불안", emoji: "😰" },
  { label: "슬픔", emoji: "😢" },
  { label: "스트레스", emoji: "😤" },
  { label: "외로움", emoji: "🥺" },
  { label: "공허함", emoji: "😶" },
  { label: "편안함", emoji: "😌" },
  { label: "기쁨", emoji: "😊" },
  { label: "피로", emoji: "😴" },
  { label: "지루함", emoji: "🙄" },
];

const CUE_OPTIONS = [
  { label: "진짜 배고픔", emoji: "🟢" },
  { label: "시간이 돼서", emoji: "🕐" },
  { label: "감정적 불편감", emoji: "🌀" },
  { label: "습관적으로", emoji: "🔁" },
  { label: "스트레스/긴장", emoji: "⚡" },
  { label: "지루함/무료함", emoji: "😑" },
  { label: "사회적 상황", emoji: "👥" },
  { label: "음식이 눈에 보여서", emoji: "👀" },
];

const BINGE_IMMEDIATE_MESSAGES = [
  "이 순간을 기록한 것 자체가 용기 있는 행동이에요. 지금 신호(Cue)가 무엇이었는지 기억해두면 다음번에 달라질 수 있어요. 💙",
  "괜찮아요. 이 에피소드에서 배울 수 있어요 — 어떤 신호가 이 행동을 불러왔는지 체크해보세요. 🌱",
  "자책하지 마세요. 폭식 패턴을 인식하고 기록하는 것이 행동변화의 첫 걸음이에요. 🤍",
];

export default function MealForm() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState<string>("아침");
  const [mealTime, setMealTime] = useState<string>("08:00");
  const [isBinge, setIsBinge] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCue, setSelectedCue] = useState<string>("");
  const [diaryText, setDiaryText] = useState("");
  const [showBingeMsg, setShowBingeMsg] = useState(false);
  const [bingeMsgIdx] = useState(() => Math.floor(Math.random() * BINGE_IMMEDIATE_MESSAGES.length));

  function selectMealType(label: string, time: string) {
    setMealType(label);
    setMealTime(time);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function toggleBinge() {
    const next = !isBinge;
    setIsBinge(next);
    if (next) setShowBingeMsg(true);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("meal_time", mealTime);
    data.set("is_binge", isBinge ? "true" : "false");
    const combined = [
      `[${mealType}]`,
      selectedCue ? `신호: ${selectedCue}` : "",
      selectedTags.length > 0 ? `감정: ${selectedTags.join(", ")}` : "",
      diaryText,
    ]
      .filter(Boolean)
      .join(" / ");
    data.set("emotional_state", combined || "");

    startTransition(async () => {
      await addMeal(data);
      form.reset();
      setMealType("아침");
      setMealTime("08:00");
      setIsBinge(false);
      setSelectedTags([]);
      setSelectedCue("");
      setDiaryText("");
      setShowBingeMsg(false);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-teal-300 hover:text-teal-500 transition-colors"
      >
        + 식사 기록 추가
      </button>
    );
  }

  return (
    <div className="border border-teal-100 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      {/* 식사 타입 탭 */}
      <div className="flex border-b border-teal-100 dark:border-gray-700">
        {MEAL_TYPES.map((m) => (
          <button
            key={m.label}
            type="button"
            onClick={() => selectMealType(m.label, m.time)}
            className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-0.5 ${
              mealType === m.label
                ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 border-b-2 border-teal-400"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <span className="text-base">{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* 먹은 것 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {mealType}에 뭘 먹었나요? *
          </label>
          <input
            name="food_items"
            type="text"
            required
            placeholder="예: 밥 한 공기, 김치찌개, 과자 한 봉지"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        {/* 식사 신호 (Cue) */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            🔍 먹게 된 신호(Cue)는 무엇인가요?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CUE_OPTIONS.map((cue) => (
              <button
                key={cue.label}
                type="button"
                onClick={() => setSelectedCue(selectedCue === cue.label ? "" : cue.label)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                  selectedCue === cue.label
                    ? "bg-teal-400 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20"
                }`}
              >
                {cue.emoji} {cue.label}
              </button>
            ))}
          </div>
        </div>

        {/* 감정 일기 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            📖 감정 태그 & 일기
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {EMOTION_TAGS.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => toggleTag(tag.label)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                  selectedTags.includes(tag.label)
                    ? "bg-blue-400 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                }`}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
          <textarea
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value)}
            placeholder="먹기 전 어떤 생각이나 감정이 있었나요? 자유롭게 적어보세요."
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none leading-relaxed"
          />
        </div>

        {/* 장소 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            어디서 먹었나요?
          </label>
          <select
            name="location"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-300"
          >
            <option value="">선택</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* 폭식 토글 */}
        <div>
          <button
            type="button"
            onClick={toggleBinge}
            className={`w-full py-3 rounded-xl text-sm font-medium border-2 transition-all ${
              isBinge
                ? "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-500"
                : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-200 hover:text-red-400"
            }`}
          >
            {isBinge ? "⚠️ 폭식 패턴 기록됨 — 탭해서 취소" : "폭식/조절 어려움이 있었나요?"}
          </button>

          {showBingeMsg && (
            <div className="mt-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0">💙</span>
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  {BINGE_IMMEDIATE_MESSAGES[bingeMsgIdx]}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setIsBinge(false);
              setSelectedTags([]);
              setSelectedCue("");
              setDiaryText("");
              setShowBingeMsg(false);
            }}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-teal-200 text-white text-sm font-semibold transition-colors"
          >
            {isPending ? "저장 중..." : "기록 저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
