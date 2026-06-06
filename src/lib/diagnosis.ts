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
  night_eating: { 야식: 4, 폭식: 1, "3일이내": 1, "1주일후": 1, 식단가이드: 2, 실천방법: 1 },
  stress_binge: { 폭식: 3, 스트레스: 3, 스트레스받을때: 3, 생리전후: 2, 원인분석: 1, 실천방법: 1 },
  three_day_quit: { 식단관리실패: 2, 운동부족: 1, "3일이내": 4, "1주일후": 2, 실천방법: 2, 원인분석: 1 },
  plateau_despair: { 식단관리실패: 1, 정체기: 4, 원인분석: 2, 실천방법: 1 },
  social_collapse: { 술자리: 4, 회식후: 4, 실천방법: 1 },
  exercise_avoidance: { 운동부족: 4, "1주일후": 1, "3일이내": 1, 운동추천: 3 },
};

export function getDiagnosisResult(answers: DiagnosisAnswers): FailureType {
  const vals = [answers.failureCause, answers.failureMoment, answers.wantedHelp];
  const totals = {} as Record<FailureType, number>;
  for (const type of Object.keys(SCORES) as FailureType[]) {
    totals[type] = vals.reduce((sum, v) => sum + (SCORES[type][v] ?? 0), 0);
  }
  return (Object.keys(totals) as FailureType[]).reduce((a, b) =>
    totals[a] >= totals[b] ? a : b
  );
}

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
