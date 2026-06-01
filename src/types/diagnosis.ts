export type UserType = "late_night" | "stress_binge" | "over_planning" | "willpower" | "plateau";

export interface Question {
  id: number;
  text: string;
  options: string[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "현재 가장 큰 고민은 무엇인가요?",
    options: ["살이 안 빠짐", "야식", "폭식", "식단 유지 실패", "요요"],
  },
  {
    id: 2,
    text: "가장 자주 무너지는 시간대는?",
    options: ["아침", "점심", "저녁", "밤", "스트레스 받을 때"],
  },
  {
    id: 3,
    text: "무너지는 이유는 무엇인가요?",
    options: ["배고파서", "스트레스", "습관", "외로움/감정", "의지가 약해서라고 느낌"],
  },
  {
    id: 4,
    text: "다이어트를 실패했던 가장 큰 이유는?",
    options: [
      "계획이 너무 빡셌다",
      "혼자 하니 포기했다",
      "뭘 먹어야 할지 몰랐다",
      "충동을 못 참았다",
      "체중 변화가 없어서 지쳤다",
    ],
  },
];

export interface MissionDay {
  day: number;
  task: string;
  detail: string;
}

export interface UserTypeData {
  label: string;
  emoji: string;
  headline: string;
  core_problem: string;
  pattern: string;
  rules: string[];
  mission: MissionDay[];
}

export const USER_TYPE_DATA: Record<UserType, UserTypeData> = {
  late_night: {
    label: "야식 반복형",
    emoji: "🌙",
    headline: "밤마다 배달앱이 열리는 데는 이유가 있습니다",
    core_problem:
      "야식은 의지 부족이 아닙니다. 낮 동안 식사량이 부족하거나, 밤에 혼자 있는 시간의 습관적 보상 패턴이 원인입니다. 뇌가 '밤 = 먹는 시간'으로 학습되어 있어, 의지만으로는 끊기 어렵습니다.",
    pattern:
      "저녁 식사 후 2~3시간이 지나면 다시 배고픔이 오는 패턴, 배달앱을 열었다 닫았다 반복, 결국 시키고 나서 죄책감을 느끼는 사이클이 반복되고 있습니다.",
    rules: [
      "저녁 식사 후 단백질 간식 1개 미리 준비하기 (삶은 달걀, 그릭요거트)",
      "밤 10시 이후 배달앱 알림 끄기 — 환경을 바꾸면 의지가 필요 없습니다",
      "야식 충동이 오면 10분 지연 미션 실행 (물 한 잔 + 이 닦기)",
    ],
    mission: [
      { day: 1, task: "오늘 무너지는 시간 기록하기", detail: "몇 시에 야식 충동이 왔는지, 그때 감정이 어땠는지 메모하세요." },
      { day: 2, task: "야식 충동 시간 정확히 체크", detail: "어제 기록을 보고 패턴을 확인하세요. 같은 시간대에 반복되나요?" },
      { day: 3, task: "대체 간식 미리 준비하기", detail: "야식 대신 먹을 수 있는 200kcal 이하 간식을 오늘 사두세요." },
      { day: 4, task: "저녁 루틴 만들기", detail: "저녁 식사 후 30분간 할 활동을 정하세요 (산책, 드라마, 독서 등)." },
      { day: 5, task: "실패 상황 판단 없이 기록하기", detail: "오늘 야식을 먹었다면 자책 없이 상황만 적어보세요." },
      { day: 6, task: "나만의 금지 패턴 찾기", detail: "어떤 상황에서 100% 야식을 시키게 되는지 2~3가지 찾아보세요." },
      { day: 7, task: "다음 주 규칙 3개 확정하기", detail: "이번 주 기록을 바탕으로 나만의 야식 예방 규칙 3개를 만드세요." },
    ],
  },
  stress_binge: {
    label: "스트레스 폭식형",
    emoji: "⚡",
    headline: "스트레스가 식욕을 폭발시키는 구조를 끊어야 합니다",
    core_problem:
      "스트레스 상황에서 음식으로 위안을 찾는 것은 뇌의 자동 반응입니다. 코르티솔 호르몬이 당분·고칼로리 음식에 대한 갈망을 증폭시키기 때문에, 의지만으로는 막기 어렵습니다.",
    pattern:
      "스트레스 사건 → 충동적 식욕 폭발 → 과식/폭식 → 죄책감 → 다음날 보상 절식 → 다시 폭식의 사이클이 반복되고 있습니다.",
    rules: [
      "스트레스 발생 시 바로 먹지 않고 먼저 감정을 기록하기 (딱 5분)",
      "단 음식 대신 따뜻한 차 또는 단백질 간식으로 대체하기",
      "폭식 후 자책 금지 — 다음 끼니 정상화 계획만 세우기",
    ],
    mission: [
      { day: 1, task: "스트레스 발생 시 먹기 전 감정 기록", detail: "무슨 일이 있었는지, 어떤 감정인지를 먹기 전에 3줄만 써보세요." },
      { day: 2, task: "폭식 후 자책 없이 다음 끼니 계획", detail: "먹었다면 끝. 다음 식사를 어떻게 먹을지만 생각하세요." },
      { day: 3, task: "스트레스 대체 행동 목록 만들기", detail: "음식 외 스트레스 해소 방법 3가지를 찾아보세요 (산책, 음악, 전화 등)." },
      { day: 4, task: "스트레스 패턴 분석", detail: "어떤 종류의 스트레스가 폭식을 유발하는지 패턴을 찾아보세요." },
      { day: 5, task: "단 음식 대신 단백질 간식 시도", detail: "달달한 게 당길 때 단백질 바나 삶은 달걀로 대체해보세요." },
      { day: 6, task: "10분 지연 미션 실천", detail: "폭식 충동이 왔을 때 10분만 기다리기. 타이머 맞추고 물을 마시세요." },
      { day: 7, task: "다음 주 규칙 3개 확정하기", detail: "스트레스-폭식 연결고리를 끊을 나만의 규칙 3개를 정하세요." },
    ],
  },
  over_planning: {
    label: "계획 과부화형",
    emoji: "📋",
    headline: "완벽한 계획이 오히려 다이어트를 망치고 있습니다",
    core_problem:
      "너무 완벽한 계획은 지키지 못했을 때 전체 포기로 이어집니다. '오늘 하나 어겼으니 다 망했어'라는 흑백 논리가 반복 실패의 핵심 원인입니다.",
    pattern:
      "완벽한 식단 계획 수립 → 한 가지 실수 → 전면 포기 → 반동으로 폭식 → 다시 완벽한 계획 수립의 사이클이 반복되고 있습니다.",
    rules: [
      "하루 딱 1개 규칙만 지키기 — 단순할수록 오래 지속됩니다",
      "금지 식품보다 대체 식품을 먼저 정하기",
      "완벽한 식단보다 반복 가능한 식단 설계하기",
    ],
    mission: [
      { day: 1, task: "오늘 규칙 딱 1개만 정하기", detail: "가장 쉽게 지킬 수 있는 규칙 하나만 골라서 지켜보세요." },
      { day: 2, task: "금지 대신 대체 식품 찾기", detail: "좋아하는 음식의 건강한 버전을 하나씩 찾아보세요." },
      { day: 3, task: "완벽 vs 지속 가능 비교", detail: "이상적인 식단과 실제 유지 가능한 식단의 차이를 써보세요." },
      { day: 4, task: "반복 가능한 3끼 패턴 설계", detail: "70% 만족스럽지만 100% 지속 가능한 하루 식사 패턴을 만들어보세요." },
      { day: 5, task: "실패했을 때 플랜B 만들기", detail: "계획대로 안 됐을 때 어떻게 할지 미리 정해두세요." },
      { day: 6, task: "가장 쉬운 습관 하나 강화하기", detail: "이번 주에 가장 잘 지킨 습관 하나를 내일도 이어가세요." },
      { day: 7, task: "다음 주 규칙 3개 확정하기", detail: "지속 가능한 수준의 규칙 3개만 정하세요. 완벽함 금지." },
    ],
  },
  willpower: {
    label: "의지소진형",
    emoji: "🔋",
    headline: "의지력은 자원입니다 — 아끼는 전략이 필요합니다",
    core_problem:
      "의지력은 하루에 사용할 수 있는 양이 정해져 있습니다. 지치고 결정을 많이 내린 하루 끝에 식욕을 참는 것은 누구에게도 어렵습니다. 의지 부족이 아니라 시스템 부재입니다.",
    pattern:
      "아침엔 강한 의지 → 낮 동안 각종 결정과 스트레스로 에너지 소진 → 저녁·밤에 의지 고갈 → 충동적 식사 → '역시 나는 안 돼'라는 생각으로 이어집니다.",
    rules: [
      "의지가 강한 아침 시간에 하루 식단 결정을 미리 끝내기",
      "저녁에 다음날 간식·식사를 미리 준비해두기 — 선택을 줄이세요",
      "24시간 단위로만 생각하기 — 장기 계획은 오히려 독입니다",
    ],
    mission: [
      { day: 1, task: "에너지 넘치는 시간대 찾기", detail: "하루 중 의지력이 가장 높은 시간대가 언제인지 기록해보세요." },
      { day: 2, task: "의지 없어도 되는 환경 만들기", detail: "유혹이 되는 음식을 보이지 않는 곳에, 건강한 간식을 눈에 띄게 배치하세요." },
      { day: 3, task: "먹을 음식 미리 결정하기", detail: "오늘 저녁, 내일 아침에 뭘 먹을지 지금 결정해두세요." },
      { day: 4, task: "24시간 단위로만 생각하기", detail: "'이번 달 목표' 대신 '오늘 하루만' 생각하세요." },
      { day: 5, task: "작은 성공 1개 기록하기", detail: "오늘 어떤 작은 것이든 잘 된 것 하나를 찾아서 기록해보세요." },
      { day: 6, task: "포기했던 순간 패턴 분석", detail: "언제, 어떤 상황에서 포기했는지 3가지 상황을 찾아보세요." },
      { day: 7, task: "다음 주 규칙 3개 확정하기", detail: "의지에 기대지 않아도 지킬 수 있는 시스템 규칙 3개를 만드세요." },
    ],
  },
  plateau: {
    label: "체중 정체 좌절형",
    emoji: "📉",
    headline: "체중계 숫자가 안 바뀌어도 몸은 바뀌고 있습니다",
    core_problem:
      "다이어트 정체기는 모든 사람에게 옵니다. 신진대사 적응 현상으로 몸이 새로운 체중에 익숙해지는 과정입니다. 이 시기에 포기하면 요요가 오고, 버티면 다시 빠집니다.",
    pattern:
      "열심히 노력 → 체중 감소 정체 → 의욕 상실 → 식단 포기 → 체중 증가 → 다시 극단적 다이어트의 사이클이 반복되고 있습니다.",
    rules: [
      "체중 외 변화 지표 추적하기 (허리둘레, 옷 핏, 계단 오를 때 체력)",
      "식사 패턴에 변화 주기 — 같은 식단이 정체기를 만듭니다",
      "2주 단위로 평가하기 — 매일 체중 측정은 오히려 동기를 떨어뜨립니다",
    ],
    mission: [
      { day: 1, task: "체중 외 변화 지표 3개 찾기", detail: "허리둘레, 계단 오를 때 숨, 옷 핏 등 숫자 외 변화를 기록하세요." },
      { day: 2, task: "식사 패턴 변화 시도", detail: "식사 순서 바꾸기(채소 먼저), 먹는 속도 늦추기 등 작은 변화 1가지만." },
      { day: 3, task: "수면/스트레스 영향 기록", detail: "수면 시간과 스트레스가 체중에 미치는 영향을 관찰해보세요." },
      { day: 4, task: "2주 단위 관점으로 바꾸기", detail: "2주 후 날짜를 달력에 표시하고, 그때까지 꾸준히 이어가기로 결심하세요." },
      { day: 5, task: "몸 변화 기록 (사진/측정)", detail: "사진이나 줄자로 변화를 기록하세요. 숫자는 거짓말해도 몸은 안 합니다." },
      { day: 6, task: "동기 저하 원인 분석", detail: "지쳐가는 이유가 무엇인지 찾아보세요. 식단이 너무 단조롭지는 않나요?" },
      { day: 7, task: "다음 주 규칙 3개 확정하기", detail: "정체기를 뚫기 위한 새로운 시도 3가지를 정하세요." },
    ],
  },
};

export function determineUserType(answers: number[]): UserType {
  const [q1, q2, q3, q4] = answers;

  const scores: Record<UserType, number> = {
    late_night: 0,
    stress_binge: 0,
    over_planning: 0,
    willpower: 0,
    plateau: 0,
  };

  // Q1: 현재 가장 큰 고민
  if (q1 === 1) scores.late_night += 3;
  if (q1 === 2) scores.stress_binge += 3;
  if (q1 === 0) scores.plateau += 2;
  if (q1 === 3) scores.over_planning += 2;
  if (q1 === 4) scores.plateau += 3;

  // Q2: 무너지는 시간대
  if (q2 === 3) scores.late_night += 3;
  if (q2 === 4) scores.stress_binge += 3;
  if (q2 === 0) scores.willpower += 1;
  if (q2 === 2) scores.over_planning += 1;

  // Q3: 무너지는 이유
  if (q3 === 1) scores.stress_binge += 3;
  if (q3 === 3) scores.stress_binge += 2;
  if (q3 === 4) scores.willpower += 3;
  if (q3 === 2) scores.late_night += 2;
  if (q3 === 0) scores.late_night += 1;

  // Q4: 실패 이유
  if (q4 === 0) scores.over_planning += 3;
  if (q4 === 2) scores.over_planning += 2;
  if (q4 === 1) scores.willpower += 3;
  if (q4 === 3) scores.stress_binge += 2;
  if (q4 === 4) scores.plateau += 3;

  return Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0] as UserType;
}
