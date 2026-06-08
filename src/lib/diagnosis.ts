export type FailureType =
  | "night_eating"
  | "stress_binge"
  | "three_day_quit"
  | "plateau_despair"
  | "social_collapse"
  | "exercise_avoidance";

export interface DiagnosisAnswers {
  failureCause: string;
  failureMoment: string;
  eatingPattern: string;
  dietAttempts: string;
  wantedHelp: string;
}

export interface DiagnosisQuestion {
  id: keyof DiagnosisAnswers;
  text: string;
  options: { label: string; value: string }[];
}

export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  {
    id: "failureCause",
    text: "살이 찌는 가장 큰 이유는 무엇인가요?",
    options: [
      { label: "야식", value: "야식" },
      { label: "폭식", value: "폭식" },
      { label: "술자리", value: "술자리" },
      { label: "운동 부족", value: "운동부족" },
      { label: "스트레스", value: "스트레스" },
      { label: "식단 관리 실패", value: "식단관리실패" },
    ],
  },
  {
    id: "failureMoment",
    text: "다이어트가 주로 실패하는 순간은 언제인가요?",
    options: [
      { label: "3일 이내", value: "3일이내" },
      { label: "1주일 후", value: "1주일후" },
      { label: "정체기", value: "정체기" },
      { label: "회식 후", value: "회식후" },
      { label: "생리 전후", value: "생리전후" },
      { label: "스트레스 받을 때", value: "스트레스받을때" },
    ],
  },
  {
    id: "eatingPattern",
    text: "평소 나의 식사 패턴은 어떤가요?",
    options: [
      { label: "규칙적으로 3끼 먹어요", value: "규칙3끼" },
      { label: "끼니를 자주 거르는 편", value: "끼니거름" },
      { label: "야식이 사실상 메인 식사", value: "야식메인" },
      { label: "폭식 후 굶기를 반복해요", value: "폭식굶기" },
    ],
  },
  {
    id: "dietAttempts",
    text: "지금까지 다이어트를 포기한 횟수는?",
    options: [
      { label: "1~2번", value: "1-2번" },
      { label: "3~5번", value: "3-5번" },
      { label: "5번 이상", value: "5번이상" },
      { label: "셀 수 없을 만큼", value: "셀수없음" },
    ],
  },
  {
    id: "wantedHelp",
    text: "가장 원하는 도움은 무엇인가요?",
    options: [
      { label: "원인 분석", value: "원인분석" },
      { label: "실천 방법", value: "실천방법" },
      { label: "식단 가이드", value: "식단가이드" },
      { label: "운동 추천", value: "운동추천" },
      { label: "업체 추천", value: "업체추천" },
    ],
  },
];

const SCORES: Record<FailureType, Record<string, number>> = {
  night_eating:       { 야식: 4, 폭식: 1, "3일이내": 1, "1주일후": 1, 야식메인: 4, "1-2번": 1, 식단가이드: 2, 실천방법: 1 },
  stress_binge:       { 폭식: 3, 스트레스: 3, 스트레스받을때: 3, 생리전후: 2, 폭식굶기: 4, "3-5번": 1, 셀수없음: 1, 원인분석: 1, 실천방법: 1 },
  three_day_quit:     { 식단관리실패: 2, 운동부족: 1, "3일이내": 4, "1주일후": 2, 끼니거름: 2, "3-5번": 2, 셀수없음: 2, 실천방법: 2, 원인분석: 1 },
  plateau_despair:    { 식단관리실패: 1, 정체기: 4, 규칙3끼: 1, "5번이상": 2, 셀수없음: 1, 원인분석: 2, 실천방법: 1 },
  social_collapse:    { 술자리: 4, 회식후: 4, 규칙3끼: 2, "1-2번": 1, "3-5번": 1, 실천방법: 1 },
  exercise_avoidance: { 운동부족: 4, "1주일후": 1, "3일이내": 1, 끼니거름: 2, "5번이상": 1, 운동추천: 3 },
};

export function getDiagnosisResult(answers: DiagnosisAnswers): FailureType {
  const vals = [answers.failureCause, answers.failureMoment, answers.eatingPattern, answers.dietAttempts, answers.wantedHelp];
  const totals = {} as Record<FailureType, number>;
  for (const type of Object.keys(SCORES) as FailureType[]) {
    totals[type] = vals.reduce((sum, v) => sum + (SCORES[type][v] ?? 0), 0);
  }
  return (Object.keys(totals) as FailureType[]).reduce((a, b) =>
    totals[a] >= totals[b] ? a : b
  );
}

export interface TimelineDay {
  day: 3 | 7 | 14 | 30;
  scenario: string;
}

export interface PatternScenario {
  humorousDescription: string;
  timeline: TimelineDay[];
  keyAction: string;
  keyActionDescription: string;
}

export const PATTERN_SCENARIOS: Record<FailureType, PatternScenario> = {
  night_eating: {
    humorousDescription:
      "배고파서 먹는 게 아닙니다. 오늘 하루 고생한 나를 위로하려고 먹는 겁니다. 냉장고는 그냥 열리는 게 아니라 '오늘도 수고했어'라는 알림이 뜨는 것과 같습니다. 🛎️",
    timeline: [
      { day: 3, scenario: "밤 10시, 냉장고 앞에서 '뭐가 있나' 확인하는 횟수가 늘어날 가능성" },
      { day: 7, scenario: "'오늘까지만'이 세 번 이상 반복될 가능성" },
      { day: 14, scenario: "체중계와 자연스럽게 거리두기를 시작할 가능성" },
      { day: 30, scenario: "새로운 다이어트 방법을 다시 검색하고 있을 가능성" },
    ],
    keyAction: "야식 금지 대신, 밤에 먹어도 되는 간식 1개를 미리 정해두기",
    keyActionDescription:
      "금지보다 대체가 훨씬 오래 갑니다. 오이·방울토마토·무가당 두유 중 하나를 '허가된 야식'으로 미리 설정해보세요.",
  },
  stress_binge: {
    humorousDescription:
      "살이 찌는 이유는 음식이 아닙니다. 스트레스를 해소하는 방법이 음식뿐이기 때문일 수 있습니다. 뇌 입장에서는 '먹으면 괜찮아진다'는 학습이 이미 완료된 상태입니다. 🧠",
    timeline: [
      { day: 3, scenario: "스트레스 받는 날, 과식 위험이 높아질 가능성" },
      { day: 7, scenario: "배고픔보다 감정 때문에 먹는 날이 늘어날 가능성" },
      { day: 14, scenario: "먹고 후회 → 또 스트레스 → 또 먹는 패턴이 굳어질 가능성" },
      { day: 30, scenario: "다이어트보다 감정 관리가 먼저라는 걸 느끼게 될 가능성" },
    ],
    keyAction: "먹기 전 5분, 짧은 산책 또는 찬물 세수로 감정 환기하기",
    keyActionDescription:
      "먹고 싶은 충동이 올 때 5분만 버티면 60%는 사라집니다. 산책이 어렵다면 찬물 세수도 충분히 효과적입니다.",
  },
  three_day_quit: {
    humorousDescription:
      "의지가 약한 게 아닙니다. 시작 목표가 너무 컸을 가능성이 높습니다. '매일 1시간 운동 + 1,200kcal'은 의지의 문제가 아니라 설계의 문제입니다. 📐",
    timeline: [
      { day: 3, scenario: "기록이나 운동이 조금씩 귀찮아질 가능성" },
      { day: 7, scenario: "세워둔 계획표를 펼쳐보지 않게 될 가능성" },
      { day: 14, scenario: "더 쉬운 다이어트 방법을 검색하기 시작할 가능성" },
      { day: 30, scenario: "결심 1회가 더 추가된 상태로 다시 처음 시작할 가능성" },
    ],
    keyAction: "하루 10분짜리 행동 1개만 고정하기",
    keyActionDescription:
      "크게 시작하지 마세요. '저녁 식후 10분 걷기' 하나만 30일 유지하는 것이 거창한 계획 10개보다 강력합니다.",
  },
  plateau_despair: {
    humorousDescription:
      "사실 몸은 잘 반응하고 있습니다. 문제는 체중계 숫자가 멈출 때 뇌가 먼저 포기한다는 점입니다. 몸이 '적응 중'이라고 말하는 걸, 뇌가 '실패'로 번역합니다. 📉",
    timeline: [
      { day: 3, scenario: "체중계를 하루에 두 번 이상 확인하는 패턴이 생길 가능성" },
      { day: 7, scenario: "'왜 안 빠지지?'라는 생각이 의욕을 조금씩 갉아먹을 가능성" },
      { day: 14, scenario: "식단이나 운동 강도를 슬슬 줄이기 시작할 가능성" },
      { day: 30, scenario: "정체기가 끝나기 전에 다른 방법을 찾아보고 있을 가능성" },
    ],
    keyAction: "체중 대신 허리둘레나 컨디션으로 진전 측정하기",
    keyActionDescription:
      "체중계 숫자가 안 바뀌어도 몸은 변하고 있습니다. 바지 핏이나 계단 오를 때 숨 차는 정도로 변화를 확인해보세요.",
  },
  social_collapse: {
    humorousDescription:
      "혼자 있으면 잘 참지만, 사람들과 있을 때 거절을 못하는 타입입니다. '분위기상 어쩔 수 없었어'는 변명이 아니라 실제로 일어나는 일입니다. 🍻",
    timeline: [
      { day: 3, scenario: "약속 자리에서 계획이 한 번쯤 흔들릴 가능성" },
      { day: 7, scenario: "'분위기상 어쩔 수 없었다'는 상황이 반복될 가능성" },
      { day: 14, scenario: "외부 일정 때문에 루틴이 흐트러지기 시작할 가능성" },
      { day: 30, scenario: "사회생활과 다이어트를 어떻게 병행할지 다시 고민할 가능성" },
    ],
    keyAction: "약속 전 먹을 메뉴를 미리 정하거나, 덜어먹기 규칙 만들기",
    keyActionDescription:
      "약속 장소가 정해지면 미리 메뉴를 확인하고 먹을 것을 골라두세요. 현장의 유혹보다 사전 계획이 훨씬 강합니다.",
  },
  exercise_avoidance: {
    humorousDescription:
      "운동이 싫은 게 아닙니다. 너무 힘든 운동부터 시작했을 가능성이 높습니다. 뇌는 고통스러웠던 경험을 '운동 = 고통'으로 기억하고, 다음엔 자동으로 피하게 만듭니다. 🏃",
    timeline: [
      { day: 3, scenario: "운동 계획이 조금씩 뒤로 밀릴 가능성" },
      { day: 7, scenario: "'오늘은 쉬고 내일부터' 패턴이 시작될 가능성" },
      { day: 14, scenario: "운동 없이 식단만으로 버티려는 시도가 늘어날 가능성" },
      { day: 30, scenario: "식단도 흐트러지면서 전체가 리셋될 가능성" },
    ],
    keyAction: "운동복 입고 현관 밖으로 나가기 (딱 10분만)",
    keyActionDescription:
      "목표를 '운동'이 아니라 '현관 밖으로 나가기'로 낮추세요. 일단 나가면 10분은 걷게 됩니다. 그게 시작입니다.",
  },
};

export interface FailureTypeInfo {
  label: string;
  emoji: string;
  cause: string;
  pattern: string;
  freeActions: string[];
  recommendedHelp: string[];
  helpTypes: string[];
}

export const FAILURE_TYPE_INFO: Record<FailureType, FailureTypeInfo> = {
  night_eating: {
    label: "야식 반복형",
    emoji: "🌙",
    cause:
      "늦은 시간의 배고픔과 하루의 보상 심리가 야식을 반복시키고 있습니다. 낮 동안 식사가 부족하거나, 스트레스를 밤에 음식으로 푸는 패턴입니다.",
    pattern:
      "낮에는 잘 참다가 밤 10~11시 이후 식욕이 폭발하고, 다음날 후회와 함께 다시 다이어트를 결심하는 사이클이 반복됩니다.",
    freeActions: [
      "저녁 식사 후 양치질 바로 하기 (뇌에 '식사 끝' 신호 주기)",
      "야식 충동이 올 때 따뜻한 물 한 잔 마시고 10분 기다리기",
      "냉장고에 오이·방울토마토 등 저칼로리 간식 미리 준비해 두기",
    ],
    recommendedHelp: ["식단 배송", "온라인 식습관 코칭"],
    helpTypes: ["meal_delivery", "online_coaching"],
  },
  stress_binge: {
    label: "스트레스 폭식형",
    emoji: "😤",
    cause:
      "감정을 음식으로 해소하는 패턴이 몸에 배어 있습니다. 스트레스·불안·외로움이 느껴질 때 뇌가 음식에서 즉각적인 위로를 찾도록 학습된 상태입니다.",
    pattern:
      "스트레스 → 폭식 → 죄책감 → 더 먹거나 굶기 → 또 폭식의 악순환이 반복됩니다.",
    freeActions: [
      "폭식 충동이 오면 자리에서 일어나 5분 산책하기",
      "오늘 기분을 한 줄로 적는 감정 일기 쓰기",
      "음식 대신 스트레스를 푸는 나만의 대체 행동 목록 3가지 만들기",
    ],
    recommendedHelp: ["비만클리닉", "생활습관 코칭"],
    helpTypes: ["obesity_clinic", "online_coaching"],
  },
  three_day_quit: {
    label: "작심삼일형",
    emoji: "📅",
    cause:
      "의지 문제가 아닙니다. 목표가 너무 크거나 환경이 바뀌지 않았기 때문입니다. 뇌는 큰 변화를 위협으로 인식해 원래 습관으로 되돌아가려 합니다.",
    pattern:
      "강한 결심으로 시작 → 3일 후 작은 실수 → '어차피 망했어' → 전부 포기 → 새로운 결심의 반복입니다.",
    freeActions: [
      "오늘부터 딱 한 가지만 바꾸기 (예: 저녁 밥 반 공기 줄이기)",
      "실수해도 다음 끼니부터 바로 다시 시작하기 (하루 전체를 포기하지 않기)",
      "'1kg 감량'이 아닌 '오늘 하루 지키기'를 목표로 설정하기",
    ],
    recommendedHelp: ["PT", "온라인 코칭"],
    helpTypes: ["pt", "online_coaching"],
  },
  plateau_despair: {
    label: "정체기 좌절형",
    emoji: "📊",
    cause:
      "정체기는 실패가 아닌 몸의 정상적인 적응 반응입니다. 체중이 멈추는 것은 오히려 몸이 변화에 잘 반응하고 있다는 신호입니다.",
    pattern:
      "처음엔 잘 빠지다가 체중이 멈추면 '내 몸은 안 된다'고 결론 짓고 전부 포기하는 패턴입니다.",
    freeActions: [
      "체중 대신 허리·허벅지 둘레로 변화를 확인하기",
      "2주 동안 운동 종류나 강도를 살짝 바꿔보기",
      "물을 하루 2리터 마시고 나트륨 섭취 줄여보기",
    ],
    recommendedHelp: ["PT", "비만클리닉"],
    helpTypes: ["pt", "obesity_clinic"],
  },
  social_collapse: {
    label: "회식·술자리 무너짐형",
    emoji: "🍻",
    cause:
      "사회적 상황에서 거절 못 하는 패턴과 '오늘 하루쯤은'이라는 예외 심리가 다이어트를 반복해서 방해하고 있습니다.",
    pattern:
      "평소엔 잘 관리하다가 술자리 한 번으로 리셋되고, 이미 망했다는 생각에 연달아 며칠을 폭식하는 패턴입니다.",
    freeActions: [
      "술자리 전 단백질(계란·두부)을 먼저 먹어 알코올 흡수 늦추기",
      "술 대신 탄산수에 레몬을 넣어 마시기",
      "다음날 바로 정상 식단으로 복구하기 (며칠을 망치지 않기)",
    ],
    recommendedHelp: ["온라인 코칭", "식단 배송"],
    helpTypes: ["online_coaching", "meal_delivery"],
  },
  exercise_avoidance: {
    label: "운동 회피형",
    emoji: "🏃",
    cause:
      "운동 자체가 싫은 게 아니라 나에게 맞는 방법을 아직 못 찾은 것입니다. 강도 높은 운동부터 시작하면 뇌가 운동을 고통으로 기억합니다.",
    pattern:
      "헬스장 등록 → 2주 후 출석 중단 → 식단만으로 버티기 → 식단도 포기 → 원점의 반복입니다.",
    freeActions: [
      "운동 목표를 '30분 운동'이 아닌 '운동복 입기'로 낮추기",
      "좋아하는 유튜브 틀어두고 10분 걷기로 시작하기",
      "운동보다 식단 먼저 정착시키기 (식단 70% · 운동 30%)",
    ],
    recommendedHelp: ["PT", "바디관리실"],
    helpTypes: ["pt", "body_care"],
  },
};
