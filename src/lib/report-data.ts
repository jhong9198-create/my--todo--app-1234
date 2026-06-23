import type { FailureType } from "./diagnosis";

export interface DeepReportEntry {
  rootCause: string;
  triggerAnalysis: { trigger: string; description: string }[];
  environmentChange: string;
  weekPlan: string[];
}

export const DEEP_DATA: Record<FailureType, DeepReportEntry> = {
  night_eating: {
    rootCause: "야식 행동이 수면 루틴에 결합되어 있습니다. 몸이 '밤 → 먹기'를 자동 연결해 배가 고프지 않아도 식욕이 생깁니다.",
    triggerAnalysis: [
      { trigger: "시간 트리거", description: "밤 10시가 넘으면 자동으로 냉장고로 향하는 패턴" },
      { trigger: "미디어 트리거", description: "TV·유튜브 시청이 야식 욕구를 강화하는 습관적 연결" },
      { trigger: "지루함 트리거", description: "밤에 할 일이 없을 때 음식이 유일한 자극이 되는 상황" },
    ],
    environmentChange: "밤 9시 이후 주방 접근을 물리적으로 차단하거나, 야식 대신 할 '대체 루틴' 1가지를 정해두세요.",
    weekPlan: [
      "1-2일차: 밤 9시에 양치하기 (심리적 마감 신호)",
      "3-4일차: 야식 욕구 느낄 때 따뜻한 물 한 잔 마시기",
      "5-7일차: 밤 루틴 (스트레칭 10분 + 독서) 정착시키기",
    ],
  },
  stress_binge: {
    rootCause: "스트레스 → 음식 해소 회로가 자동화되어 있습니다. 도파민이 음식에 연결되어 있어 부정적 감정이 오면 즉각 먹고 싶어집니다.",
    triggerAnalysis: [
      { trigger: "감정 트리거", description: "불안·분노·외로움이 올라올 때 음식으로 달래려는 즉각 반응" },
      { trigger: "직장 트리거", description: "업무 스트레스 피크인 날 퇴근 후 보상 심리 폭식" },
      { trigger: "고독 트리거", description: "혼자 있는 저녁, 감정을 나눌 곳이 없을 때 음식이 위안" },
    ],
    environmentChange: "스트레스 해소 방법 목록을 3가지 미리 만들어두세요. 음식이 아닌 것으로 (산책, 음악, 통화 등)",
    weekPlan: [
      "1-2일차: 폭식 전 '지금 나 스트레스받고 있다'고 인식하기",
      "3-4일차: 충동이 오면 10분 타이머 재기",
      "5-7일차: 스트레스 해소 대체 행동 1가지 실행해보기",
    ],
  },
  three_day_quit: {
    rootCause: "완벽주의적 다이어트 패턴입니다. 계획이 조금이라도 어긋나면 전체를 포기하는 '0 아니면 100' 사고방식이 반복을 만들고 있습니다.",
    triggerAnalysis: [
      { trigger: "완벽주의 트리거", description: "계획한 식단에서 조금만 벗어나도 '망했다'고 판단" },
      { trigger: "첫 실수 트리거", description: "첫 번째 치팅 후 자포자기 폭식" },
      { trigger: "비교 트리거", description: "다른 사람 결과와 비교해 의욕 상실 → 포기" },
    ],
    environmentChange: "주간 단위로 계획하세요. '주간 80%' 목표로 바꾸면 하루 실수가 일주일을 망치지 않습니다.",
    weekPlan: [
      "1-2일차: 오늘 목표를 '완벽'이 아닌 '70%'로 낮추기",
      "3-4일차: 실수했을 때 '오늘 하나 틀렸다'고만 메모하기",
      "5-7일차: 포기하고 싶은 순간 24시간 유예하기",
    ],
  },
  plateau_despair: {
    rootCause: "초기 성공에 익숙해진 몸이 더 이상 쉽게 반응하지 않는 정체기에서 심리적 무너짐이 시작됩니다. 숫자에 지나치게 의존하는 것이 문제입니다.",
    triggerAnalysis: [
      { trigger: "숫자 집착 트리거", description: "매일 체중계에 올라가 조금이라도 안 빠지면 좌절" },
      { trigger: "기대 불일치 트리거", description: "열심히 했는데 결과가 없다는 느낌이 의욕을 꺾음" },
      { trigger: "비교 트리거", description: "빠르게 빠지는 다른 사람을 보며 내 방법이 틀렸다고 판단" },
    ],
    environmentChange: "체중 측정 주기를 매일 → 주 1회로 바꾸세요. 숫자 대신 '이번 주 내가 지킨 것'을 기록하세요.",
    weekPlan: [
      "1-2일차: 체중계 측정 빈도 줄이기 (매일 → 격일 → 주 1회)",
      "3-4일차: 체중 외 변화 기록하기 (허리, 컨디션, 지구력)",
      "5-7일차: 정체기 3주 버티기 도전 (지나면 반드시 빠짐)",
    ],
  },
  social_collapse: {
    rootCause: "사회적 상황에서의 거절 능력과 자기 조절 전략이 없습니다. 외부 환경이 바뀌지 않으면 같은 상황이 올 때마다 무너집니다.",
    triggerAnalysis: [
      { trigger: "회식 트리거", description: "예상치 못한 회식에서 분위기에 휩쓸려 절제 포기" },
      { trigger: "눈치 트리거", description: "거절했을 때 이상하게 볼까봐 맞춰주다 과식" },
      { trigger: "알코올 트리거", description: "술 한 잔 후 판단력 저하로 안주 통제 불가" },
    ],
    environmentChange: "회식 전 '이것만 지킨다' 규칙 1개를 미리 정하세요. (예: 술은 2잔까지, 안주는 단백질 위주)",
    weekPlan: [
      "1-2일차: 다음 회식 전 나만의 규칙 1개 정하기",
      "3-4일차: 술자리에서 물·음료 섞어 마시는 전략 써보기",
      "5-7일차: 회식 후 다음 날 식사로 균형 잡기 (자책 금지)",
    ],
  },
  exercise_avoidance: {
    rootCause: "운동 없이 식단만으로 유지하려 합니다. 단기적으론 효과가 있지만, 근육량 감소 → 대사 저하 → 요요의 악순환이 반복됩니다.",
    triggerAnalysis: [
      { trigger: "귀찮음 트리거", description: "운동 시작의 심리적 장벽이 높아 계속 미루게 됨" },
      { trigger: "극단적 식단 트리거", description: "운동 안 하는 대신 식단을 너무 타이트하게 → 반동 폭식" },
      { trigger: "근손실 트리거", description: "굶기로 살을 빼면 지방보다 근육이 먼저 빠져 요요 위험" },
    ],
    environmentChange: "운동을 '살 빼는 것'이 아닌 '근육 유지'로 목적을 바꾸세요. 30분 걷기부터 충분합니다.",
    weekPlan: [
      "1-2일차: 매일 10~15분 걷기부터 시작",
      "3-4일차: 식단에 단백질 1가지씩 추가하기 (근손실 방지)",
      "5-7일차: 계단 오르기·스트레칭 등 일상 활동 늘리기",
    ],
  },
};
