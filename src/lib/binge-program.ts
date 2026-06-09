export type EmotionOption =
  | "스트레스"
  | "외로움"
  | "허무함"
  | "짜증"
  | "피곤함"
  | "보상심리"
  | "기타";

export interface DayConfig {
  day: number;
  title: string;
  mission: string;
  tip: string;
  emotionOptions?: EmotionOption[];
  actionOptions?: string[];
}

export interface DayRecord {
  completed: boolean;
  craving_level?: number;
  emotion?: string;
  action_taken?: string;
  memo?: string;
  completed_at: string;
}

export interface ProgramState {
  started_at: string;
  days: Partial<Record<number, DayRecord>>;
}

export const DAYS: DayConfig[] = [
  {
    day: 1,
    title: "내 폭식 시간대 찾기",
    mission: "오늘은 폭식을 막으려 하지 말고,\n폭식 충동이 오는 시간만 기록하세요",
    tip: "참으려고 애쓰지 않아도 됩니다. 오늘의 목표는 오직 '기록'입니다.",
  },
  {
    day: 2,
    title: "폭식 직전 감정 찾기",
    mission: "먹기 전 30초만 멈추고\n지금 감정을 선택하세요",
    tip: "어떤 감정도 틀린 답이 없습니다. 솔직하게 선택해보세요.",
    emotionOptions: ["스트레스", "외로움", "허무함", "짜증", "피곤함", "보상심리", "기타"],
  },
  {
    day: 3,
    title: "10분 지연하기",
    mission: "먹고 싶을 때 바로 먹지 말고\n10분만 미뤄보세요",
    tip: "완벽하게 성공하지 않아도 됩니다. 10분이라는 틈을 만드는 게 목표입니다.",
    actionOptions: ["물 한 컵 마시기", "양치하기", "밖에 5분 걷기", "샤워하기", "침대에서 멀어지기"],
  },
  {
    day: 4,
    title: "폭식 대체 음식 정하기",
    mission: "완전히 참지 말고,\n덜 무너지는 선택지를 준비하세요",
    tip: "완벽한 식단이 아니어도 됩니다. 조금 더 나은 선택이면 충분합니다.",
    actionOptions: ["계란 + 두부", "요거트", "편의점 샐러드 + 단백질", "바나나 + 우유", "직접 정한 다른 음식"],
  },
  {
    day: 5,
    title: "트리거 차단하기",
    mission: "내가 자주 무너지는\n환경 하나를 바꾸세요",
    tip: "모든 걸 바꾸려 하지 않아도 됩니다. 딱 하나만 바꿔보세요.",
    actionOptions: ["배달앱 알림 끄기", "과자 숨기기", "밤 10시 이후 주방 불 끄기", "침대에서 음식 영상 안 보기"],
  },
  {
    day: 6,
    title: "폭식 후 회복 루틴 만들기",
    mission: "폭식했더라도 다음날 굶지 말고\n회복 루틴을 실행하세요",
    tip: "'망했다' 대신 '기록했다'로 생각해보세요.",
    actionOptions: ["물 마시기", "가벼운 산책", "다음 끼니 정상식", "자책 문장 안 하기"],
  },
  {
    day: 7,
    title: "나만의 폭식 패턴 요약",
    mission: "7일 동안의 기록을 돌아보세요\n패턴이 보이기 시작합니다",
    tip: "오늘은 기록하는 날이 아니라 발견하는 날입니다.",
  },
];

export const PROGRAM_KEY = "wg_binge_program";

export function loadProgram(): ProgramState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROGRAM_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProgramState;
  } catch {
    return null;
  }
}

export function saveProgram(state: ProgramState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRAM_KEY, JSON.stringify(state));
}

export function getOrCreateProgram(): ProgramState {
  const existing = loadProgram();
  if (existing) return existing;
  const fresh: ProgramState = { started_at: new Date().toISOString(), days: {} };
  saveProgram(fresh);
  return fresh;
}

export function getCompletedDays(state: ProgramState): number[] {
  return Object.entries(state.days)
    .filter(([, v]) => v?.completed)
    .map(([k]) => Number(k))
    .sort((a, b) => a - b);
}

export function getNextDay(state: ProgramState): number {
  const done = new Set(getCompletedDays(state));
  for (let d = 1; d <= 7; d++) {
    if (!done.has(d)) return d;
  }
  return 8;
}

export function getMostFrequent(values: (string | undefined)[]): string | null {
  const counts: Record<string, number> = {};
  for (const v of values) {
    if (v) counts[v] = (counts[v] ?? 0) + 1;
  }
  const entries = Object.entries(counts);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}
