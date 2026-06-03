export type ServiceType =
  | 'obesity_clinic'
  | 'oriental'
  | 'pt'
  | 'body_care'
  | 'meal_delivery'
  | 'online_coaching';

export type Budget = 'low' | 'mid' | 'high' | 'vhigh';
export type PriceCategory = 'low' | 'mid' | 'high';

export interface QuizAnswers {
  exerciseHate: boolean;
  dietSelf: boolean;
  recordHate: boolean;
  budget: Budget;
  wantFast: boolean;
  drugInterest: boolean;
  deliveryIssue: boolean;
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  text: string;
  sub?: string;
  options: { label: string; value: boolean | Budget }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "exerciseHate",
    text: "운동하러 가기 싫으세요?",
    sub: "헬스장, PT, 유산소 등 몸을 직접 움직이는 것",
    options: [
      { label: "네, 너무 귀찮아요", value: true },
      { label: "아니요, 할 수 있어요", value: false },
    ],
  },
  {
    id: "dietSelf",
    text: "혼자서 식단 관리할 수 있나요?",
    sub: "칼로리 계산, 음식 선택, 야식 참기 등",
    options: [
      { label: "어려워요, 도움이 필요해요", value: false },
      { label: "네, 혼자 할 수 있어요", value: true },
    ],
  },
  {
    id: "recordHate",
    text: "칼로리 기록·식단 일기, 귀찮으세요?",
    sub: "앱이나 수기로 매일 먹은 것을 기록하는 것",
    options: [
      { label: "네, 정말 귀찮아요", value: true },
      { label: "괜찮아요, 할 수 있어요", value: false },
    ],
  },
  {
    id: "budget",
    text: "다이어트에 한 달 얼마 투자할 수 있나요?",
    sub: "운동·식단·시술 등 모든 비용 합산 기준",
    options: [
      { label: "5만원 이하", value: "low" as Budget },
      { label: "5~20만원", value: "mid" as Budget },
      { label: "20~50만원", value: "high" as Budget },
      { label: "50만원 이상", value: "vhigh" as Budget },
    ],
  },
  {
    id: "wantFast",
    text: "결과를 빠르게 보고 싶으세요?",
    sub: "1~2개월 내 눈에 띄는 변화를 원하는지",
    options: [
      { label: "네, 빠른 결과가 필요해요", value: true },
      { label: "천천히 건강하게 괜찮아요", value: false },
    ],
  },
  {
    id: "drugInterest",
    text: "주사·약물로 편하게 빼는 방법에 관심 있으세요?",
    sub: "위고비, 마운자로, 삭센다 같은 약물 치료 (의료진 처방 필수)",
    options: [
      { label: "네, 관심 있어요", value: true },
      { label: "아니요, 자연적인 방법이 좋아요", value: false },
    ],
  },
  {
    id: "deliveryIssue",
    text: "배달음식·야식 문제가 제일 크세요?",
    sub: "다이어트 실패의 가장 큰 이유가 야식/배달이라면",
    options: [
      { label: "네, 밤에 폭식하는 게 문제예요", value: true },
      { label: "아니요, 다른 이유가 더 커요", value: false },
    ],
  },
];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  obesity_clinic: '비만클리닉',
  oriental: '다이어트 한의원',
  pt: 'PT (퍼스널 트레이닝)',
  body_care: '피부·바디 관리실',
  meal_delivery: '식단배송',
  online_coaching: '온라인 식습관 코칭',
};

export const SERVICE_ICONS: Record<ServiceType, string> = {
  obesity_clinic: '💊',
  oriental: '🌿',
  pt: '🏋️',
  body_care: '✨',
  meal_delivery: '🥗',
  online_coaching: '📱',
};

export const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  obesity_clinic: '전문의가 약물·주사로 체중을 관리해드립니다 (위고비·삭센다·마운자로 등)',
  oriental: '한방 침·탕약으로 체질부터 개선하는 자연적 방법입니다',
  pt: '전문 트레이너가 1:1로 운동·식단을 함께 설계합니다',
  body_care: 'LPG·고주파·초음파 기기로 운동 없이 체형을 관리합니다',
  meal_delivery: '영양사가 설계한 식단을 매일 배송받아 식단 걱정을 없앱니다',
  online_coaching: '카톡·앱으로 식단 피드백을 받는 가성비 비대면 코칭입니다',
};

export interface ServiceTypeInfo {
  suitableFor: string[];
  notSuitableFor: string[];
  expectedCost: string;
  cautions: string[];
  medicalNote?: string;
}

export const SERVICE_TYPE_INFO: Record<ServiceType, ServiceTypeInfo> = {
  obesity_clinic: {
    suitableFor: ['운동이 귀찮은 분', '빠른 결과가 필요한 분', '약물·주사에 관심 있는 분', '전문적 관리를 원하는 분'],
    notSuitableFor: ['자연적인 방법을 선호하시는 분', '비용 부담이 크신 분'],
    expectedCost: '30~100만원/월',
    cautions: ['약물 중단 시 요요 위험이 있습니다', '전문의 처방 없이 임의 복용은 위험합니다', '장기 관리 계획을 함께 세우는 것이 중요합니다'],
    medicalNote: '위고비·마운자로·삭센다 등 GLP-1 약물은 처방 가능 여부를 반드시 의료진과 상담해야 합니다. 본 서비스는 의료 효과를 보장하지 않습니다.',
  },
  oriental: {
    suitableFor: ['자연적인 방법을 선호하시는 분', '체질 개선이 필요한 분', '부작용이 걱정되는 분'],
    notSuitableFor: ['빠른 결과를 원하시는 분', '매주 방문이 어려운 분'],
    expectedCost: '8~30만원/월',
    cautions: ['효과가 느리게 나타날 수 있습니다', '꾸준한 방문이 필요합니다', '한약은 개인 체질에 따라 다를 수 있습니다'],
  },
  pt: {
    suitableFor: ['운동을 통해 근본적으로 바꾸고 싶은 분', '식단 의지가 있는 분', '체형 변화를 원하는 분'],
    notSuitableFor: ['운동 자체가 싫은 분', '시간을 내기 어려운 분'],
    expectedCost: '20~90만원/월',
    cautions: ['트레이너 실력 차이가 클 수 있습니다', 'PT 종료 후 자기 관리가 중요합니다', '부상 예방을 위한 초기 기초 세팅이 필요합니다'],
  },
  body_care: {
    suitableFor: ['운동 없이 체형 관리를 원하는 분', '셀룰라이트·부종이 고민인 분', '기록 없이 편하게 관리받고 싶은 분'],
    notSuitableFor: ['체중 감량 자체가 목적인 분', '장기 비용이 부담인 분'],
    expectedCost: '8~40만원/회',
    cautions: ['체중보다 체형 변화에 더 효과적입니다', '유지를 위해 지속적 관리가 필요합니다', '시술 효과는 개인차가 있습니다'],
  },
  meal_delivery: {
    suitableFor: ['요리하기 귀찮은 분', '식단 계획을 세우기 어려운 분', '배달음식 대신 건강식이 필요한 분'],
    notSuitableFor: ['특정 식재료 알레르기가 있는 분', '직접 요리를 즐기는 분'],
    expectedCost: '20~50만원/월',
    cautions: ['장기 의존 시 스스로 식단 조절이 어려워질 수 있습니다', '맛이 입맛에 맞지 않을 수 있습니다', '배송 의존 종료 후 식습관 유지 계획이 필요합니다'],
  },
  online_coaching: {
    suitableFor: ['기록하는 것을 괜찮아하는 분', '예산이 제한적인 분', '스스로 의지는 있지만 가이드가 필요한 분'],
    notSuitableFor: ['스마트폰 사용이 불편한 분', '직접 대면 관리를 원하는 분'],
    expectedCost: '5~18만원/월',
    cautions: ['자기 기록 없이는 효과가 낮습니다', '코치 품질이 업체마다 다를 수 있습니다', '비대면이므로 긴급 상황 대응이 어렵습니다'],
  },
};

export function getRecommendations(answers: QuizAnswers): ServiceType[] {
  const scores: Record<ServiceType, number> = {
    obesity_clinic: 0,
    oriental: 0,
    pt: 0,
    body_care: 0,
    meal_delivery: 0,
    online_coaching: 0,
  };

  // Q1: Exercise
  if (answers.exerciseHate) {
    scores.obesity_clinic += 2;
    scores.oriental += 2;
    scores.body_care += 2;
    scores.meal_delivery += 1;
  } else {
    scores.pt += 3;
  }

  // Q2: Diet self-management
  if (!answers.dietSelf) {
    scores.meal_delivery += 2;
    scores.online_coaching += 2;
    scores.obesity_clinic += 1;
    scores.oriental += 1;
  } else {
    scores.pt += 2;
  }

  // Q3: Record aversion
  if (answers.recordHate) {
    scores.obesity_clinic += 2;
    scores.oriental += 1;
    scores.body_care += 2;
    scores.meal_delivery += 1;
  } else {
    scores.online_coaching += 2;
  }

  // Q4: Budget
  const budgetBonus: Record<Budget, Partial<Record<ServiceType, number>>> = {
    low:   { online_coaching: 3, meal_delivery: 1 },
    mid:   { oriental: 2, body_care: 1, meal_delivery: 2, online_coaching: 1 },
    high:  { obesity_clinic: 2, body_care: 2, pt: 2, oriental: 1 },
    vhigh: { obesity_clinic: 3, pt: 3 },
  };
  for (const [type, bonus] of Object.entries(budgetBonus[answers.budget])) {
    scores[type as ServiceType] += bonus as number;
  }

  // Q5: Speed of results
  if (answers.wantFast) {
    scores.obesity_clinic += 2;
    scores.body_care += 1;
    scores.pt += 1;
  } else {
    scores.oriental += 2;
    scores.online_coaching += 1;
  }

  // Q6: Drug/injection interest
  if (answers.drugInterest) {
    scores.obesity_clinic += 3;
  } else {
    scores.oriental += 1;
    scores.online_coaching += 1;
  }

  // Q7: Delivery/late-night eating issue
  if (answers.deliveryIssue) {
    scores.meal_delivery += 2;
    scores.online_coaching += 2;
    scores.oriental += 1;
  }

  return (Object.entries(scores) as [ServiceType, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);
}

export function getRecommendationReason(type: ServiceType, answers: QuizAnswers): string {
  const parts: string[] = [];

  switch (type) {
    case 'obesity_clinic':
      if (answers.exerciseHate) parts.push('운동이 싫다고 하셨기 때문에');
      if (!answers.dietSelf) parts.push('식단 관리를 혼자 하기 어려우시기 때문에');
      if (answers.recordHate) parts.push('기록이 귀찮으시기 때문에');
      if (answers.wantFast) parts.push('빠른 결과를 원하시기 때문에');
      if (answers.drugInterest) parts.push('약물·주사에 관심이 있으시기 때문에');
      return parts.join(', ') + (parts.length ? ', ' : '') + '전문의 관리형 비만클리닉이 가장 잘 맞을 수 있습니다.';

    case 'oriental':
      if (answers.exerciseHate) parts.push('운동 없이 관리하고 싶으시기 때문에');
      if (!answers.wantFast) parts.push('천천히 건강하게 접근하고 싶으시기 때문에');
      if (!answers.drugInterest) parts.push('자연적인 방법을 선호하시기 때문에');
      return parts.join(', ') + (parts.length ? ', ' : '') + '한방 다이어트가 잘 맞을 수 있습니다.';

    case 'pt':
      if (!answers.exerciseHate) parts.push('운동을 할 의향이 있으시기 때문에');
      if (answers.dietSelf) parts.push('식단 의지가 있으시기 때문에');
      return parts.join(', ') + (parts.length ? ', ' : '') + '전문 트레이너와의 PT가 가장 효과적일 수 있습니다.';

    case 'body_care':
      if (answers.exerciseHate) parts.push('운동이 싫으시기 때문에');
      if (answers.recordHate) parts.push('기록 없이 편하게 관리받고 싶으시기 때문에');
      return parts.join(', ') + (parts.length ? ', ' : '') + '기기 관리로 체형을 개선하는 바디케어가 맞을 수 있습니다.';

    case 'meal_delivery':
      if (!answers.dietSelf) parts.push('식단 관리를 혼자 하기 어려우시기 때문에');
      if (answers.deliveryIssue) parts.push('야식·배달음식이 주요 문제이시기 때문에');
      if (answers.recordHate) parts.push('기록 없이 식단을 해결하고 싶으시기 때문에');
      return parts.join(', ') + (parts.length ? ', ' : '') + '영양사 설계 식단 배송이 편하게 맞을 수 있습니다.';

    case 'online_coaching':
      if (!answers.dietSelf) parts.push('식단 가이드가 필요하시기 때문에');
      if (!answers.recordHate) parts.push('기록을 괜찮아하시기 때문에');
      if (answers.deliveryIssue) parts.push('식습관 교정이 필요하시기 때문에');
      if (answers.budget === 'low') parts.push('예산이 한정적이시기 때문에');
      return parts.join(', ') + (parts.length ? ', ' : '') + '비용 효율적인 온라인 코칭이 잘 맞을 수 있습니다.';
  }
}

export interface Review {
  id: string;
  businessId: string;
  weightLoss: string;
  costSatisfaction: number;
  intensity: number;
  kindness: number;
  revisit: boolean;
  recommendFor: string;
  comment: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  region: string;
  district: string;
  type: ServiceType;
  priceRange: string;
  priceCategory: PriceCategory;
  features: string[];
  pros: string[];
  cautions: string[];
  reviewSummary: string;
  consultLink: string;
}

export const REGIONS = ['전체', '강남구', '서초구', '마포구', '서대문구', '강동구', '전국·배송'];

export const PRICE_CATEGORIES: { label: string; value: PriceCategory | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '10만원 이하/월', value: 'low' },
  { label: '10~30만원/월', value: 'mid' },
  { label: '30만원 이상/월', value: 'high' },
];

export const BUSINESSES: Business[] = [
  {
    id: 'oc1',
    name: '365mc 강남점',
    region: '서울 강남구',
    district: '강남구',
    type: 'obesity_clinic',
    priceRange: '초진 무료 / 처방 30~80만원/월',
    priceCategory: 'high',
    features: ['위고비·삭센다 처방', '지방분해주사', '체성분 분석'],
    pros: ['빠른 초기 효과', '전문의 1:1 관리', '약물로 식욕 조절'],
    cautions: ['비용 부담 있음', '약 중단 시 요요 주의'],
    reviewSummary: '"첫 달에 4kg 빠졌어요. 비용이 좀 나오지만 확실히 효과 있네요."',
    consultLink: '#',
  },
  {
    id: 'oc2',
    name: '아름다운나라 피부과 홍대점',
    region: '서울 마포구',
    district: '마포구',
    type: 'obesity_clinic',
    priceRange: '초진 무료 / 처방 25~70만원/월',
    priceCategory: 'high',
    features: ['마운자로 처방', '식욕억제제', '맞춤 다이어트 플랜'],
    pros: ['최신 GLP-1 약물', '접근성 좋음', '친절한 상담'],
    cautions: ['약물 부작용 가능성', '지속 방문 필요'],
    reviewSummary: '"홍대라 가기 편하고 상담이 자세해요. 마운자로 2달에 6kg 감량."',
    consultLink: '#',
  },
  {
    id: 'oc3',
    name: '비에비스 나무 의원',
    region: '서울 서초구',
    district: '서초구',
    type: 'obesity_clinic',
    priceRange: '상담 5만원 / 처방 40~100만원/월',
    priceCategory: 'high',
    features: ['비만 전문 내과', '체형 교정 프로그램', '영양 상담'],
    pros: ['내과 전문의', '체계적 관리', '식이 교육 포함'],
    cautions: ['상담비 있음', '예약 어려울 수 있음'],
    reviewSummary: '"내과 전문이라 믿음직하고, 식이 교육까지 해줘서 좋았어요."',
    consultLink: '#',
  },
  {
    id: 'or1',
    name: '자연미인 한의원 강남점',
    region: '서울 강남구',
    district: '강남구',
    type: 'oriental',
    priceRange: '10~25만원/월',
    priceCategory: 'mid',
    features: ['한방 다이어트 침', '체질 개선 탕약', '부종 케어'],
    pros: ['자연 성분 사용', '부작용 적음', '체질 개선 효과'],
    cautions: ['효과 느릴 수 있음', '꾸준한 방문 필요'],
    reviewSummary: '"탕약 먹고 2개월에 5kg. 천천히 빠지지만 요요가 없었어요."',
    consultLink: '#',
  },
  {
    id: 'or2',
    name: '경희 다이어트 한의원 신촌점',
    region: '서울 서대문구',
    district: '서대문구',
    type: 'oriental',
    priceRange: '8~20만원/월',
    priceCategory: 'low',
    features: ['이침·체침', '식욕 억제 한약', '대사 촉진 치료'],
    pros: ['저렴한 편', '체질 맞춤', '식욕 조절 효과'],
    cautions: ['한약 특유의 맛', '개인차 있음'],
    reviewSummary: '"이침 맞고 식욕이 줄었어요. 가성비 좋은 곳입니다."',
    consultLink: '#',
  },
  {
    id: 'or3',
    name: '강동경희 한방 다이어트',
    region: '서울 강동구',
    district: '강동구',
    type: 'oriental',
    priceRange: '12~28만원/월',
    priceCategory: 'mid',
    features: ['전신 침 치료', '쑥뜸·부항', '한방 다이어트 프로그램'],
    pros: ['한방 병원급 시설', '다양한 치료 옵션', '의료보험 일부 적용'],
    cautions: ['병원 예약 필요', '다소 번거로울 수 있음'],
    reviewSummary: '"침 맞으면서 3개월에 7kg 감량. 허리 통증도 같이 좋아졌어요."',
    consultLink: '#',
  },
  {
    id: 'pt1',
    name: '피트니스 Q 강남점',
    region: '서울 강남구',
    district: '강남구',
    type: 'pt',
    priceRange: '40~70만원/월 (월 12회)',
    priceCategory: 'high',
    features: ['1:1 맞춤 운동', '식단 플래닝', '인바디 측정'],
    pros: ['가장 확실한 체형 변화', '전문가 밀착 관리', '식단+운동 통합'],
    cautions: ['비용 높음', '스스로 의지 필요'],
    reviewSummary: '"트레이너가 열정적이에요. 3개월에 체지방 8% 감량했어요."',
    consultLink: '#',
  },
  {
    id: 'pt2',
    name: '스포애니 선릉점',
    region: '서울 강남구',
    district: '강남구',
    type: 'pt',
    priceRange: '20~40만원/월 (월 8회)',
    priceCategory: 'mid',
    features: ['그룹·개인 PT', '헬스장 자유 이용', '다양한 클래스'],
    pros: ['합리적 가격', '유연한 일정', '자유 이용 포함'],
    cautions: ['1:1 집중도 낮을 수 있음', '스스로 동기 필요'],
    reviewSummary: '"그룹이라 훨씬 저렴하게 PT를 받을 수 있어서 좋아요."',
    consultLink: '#',
  },
  {
    id: 'pt3',
    name: '바디프로필 전문 PT 마포점',
    region: '서울 마포구',
    district: '마포구',
    type: 'pt',
    priceRange: '50~90만원/월 (월 12~16회)',
    priceCategory: 'high',
    features: ['바디프로필 특화', '식단 도시락 제공', '포토 촬영 패키지'],
    pros: ['단기 집중 변화', '식단 패키지 포함', '동기부여 효과'],
    cautions: ['강도 높음', '단기 후 유지 어려울 수 있음'],
    reviewSummary: '"3개월 만에 바디프로필 찍었어요. 식단 도시락 포함이라 편했어요."',
    consultLink: '#',
  },
  {
    id: 'bc1',
    name: '라뷰티코아 청담점',
    region: '서울 강남구',
    district: '강남구',
    type: 'body_care',
    priceRange: '10~30만원/회',
    priceCategory: 'mid',
    features: ['LPG 마사지', '고주파 체형 관리', '셀룰라이트 케어'],
    pros: ['운동 없이 체형 관리', '편안한 시술', '즉각적 가벼움'],
    cautions: ['유지 관리 필요', '지속성 개인차'],
    reviewSummary: '"LPG 10회 패키지 후 바지가 한 사이즈 줄었어요. 편하게 받을 수 있어요."',
    consultLink: '#',
  },
  {
    id: 'bc2',
    name: '다비치 바디케어 홍대점',
    region: '서울 마포구',
    district: '마포구',
    type: 'body_care',
    priceRange: '8~20만원/회',
    priceCategory: 'low',
    features: ['초음파 지방 분해', '림프 드레나쥐', '셀룰라이트 집중'],
    pros: ['통증 없이 시술', '즉각적 부종 완화', '편안한 환경'],
    cautions: ['장기 투자 필요', '비용 누적됨'],
    reviewSummary: '"부기가 잘 빠지고 몸이 가벼워지는 느낌. 주기적으로 다녀요."',
    consultLink: '#',
  },
  {
    id: 'bc3',
    name: '슈퍼바디 바디케어 압구정점',
    region: '서울 강남구',
    district: '강남구',
    type: 'body_care',
    priceRange: '15~40만원/회',
    priceCategory: 'high',
    features: ['HIFU 지방 분해', '고강도 집중 초음파', 'RF 리프팅'],
    pros: ['1~2회만으로 효과', '비침습 시술', '다운타임 없음'],
    cautions: ['비용 높음', '시술 시 통증 있을 수 있음'],
    reviewSummary: '"HIFU 2회에 복부 3cm 줄었어요. 빠른 효과 원하시는 분께 추천."',
    consultLink: '#',
  },
  {
    id: 'md1',
    name: '마이파라곤 식단배송',
    region: '전국 배송',
    district: '전국·배송',
    type: 'meal_delivery',
    priceRange: '30~50만원/월 (하루 2~3식)',
    priceCategory: 'high',
    features: ['영양사 설계', '칼로리 계산 완료', '다이어트 특화 메뉴'],
    pros: ['식단 고민 제로', '칼로리 자동 관리', '맛있는 다이어트식'],
    cautions: ['비용 부담', '배송 의존도 높아짐'],
    reviewSummary: '"요리 못해도 식단 완벽하게 지킬 수 있어요. 2개월에 6kg 감량."',
    consultLink: '#',
  },
  {
    id: 'md2',
    name: '더그린 식단 전문관',
    region: '전국 배송',
    district: '전국·배송',
    type: 'meal_delivery',
    priceRange: '20~35만원/월',
    priceCategory: 'mid',
    features: ['저탄고지 옵션', '비건 메뉴', '간헐적 단식 식단'],
    pros: ['다양한 식단 방식', '합리적 가격', '신선한 재료'],
    cautions: ['입맛 맞을 때까지 시행착오', '냉장 보관 필요'],
    reviewSummary: '"저탄고지인데 맛있고 포만감 있어요. 가성비 최고!"',
    consultLink: '#',
  },
  {
    id: 'md3',
    name: '슬림박스 다이어트',
    region: '전국 배송',
    district: '전국·배송',
    type: 'meal_delivery',
    priceRange: '25~45만원/월',
    priceCategory: 'mid',
    features: ['닭가슴살 특화', '단백질 맞춤 식단', '운동 연계 메뉴'],
    pros: ['고단백 식단', '냉동 보관 편리', '맛 다양'],
    cautions: ['닭가슴살 위주라 지루할 수 있음', '냉동 전용'],
    reviewSummary: '"운동이랑 병행했더니 한달에 체지방 3% 감량. 맛도 나쁘지 않아요."',
    consultLink: '#',
  },
  {
    id: 'co1',
    name: '다이어트 밥상 코칭',
    region: '전국 (비대면)',
    district: '전국·배송',
    type: 'online_coaching',
    priceRange: '5~15만원/월',
    priceCategory: 'low',
    features: ['카톡 1:1 피드백', '식사 사진 분석', '주간 리포트'],
    pros: ['저렴한 비용', '언제 어디서나', '빠른 피드백'],
    cautions: ['자기 기록 필수', '오프라인 지원 없음'],
    reviewSummary: '"매일 밥 사진 찍어 보내면 피드백 줘요. 습관이 바뀌는 게 느껴져요."',
    consultLink: '#',
  },
  {
    id: 'co2',
    name: '눔 코리아',
    region: '전국 (앱 기반)',
    district: '전국·배송',
    type: 'online_coaching',
    priceRange: '6~12만원/월',
    priceCategory: 'low',
    features: ['앱 식단 기록', '심리 코칭', 'AI 피드백'],
    pros: ['행동 변화 중심', '검증된 프로그램', '언제든 기록 가능'],
    cautions: ['앱 익숙해야 함', '직접 상담 없음'],
    reviewSummary: '"왜 먹는지를 알게 해줘요. 단순 칼로리 계산이 아닌 심리 코칭."',
    consultLink: '#',
  },
  {
    id: 'co3',
    name: '핏펄스 온라인 다이어트',
    region: '전국 (비대면)',
    district: '전국·배송',
    type: 'online_coaching',
    priceRange: '8~18만원/월',
    priceCategory: 'low',
    features: ['영상 식단 코칭', '운동 루틴 제공', '주 2회 화상 상담'],
    pros: ['운동+식단 통합 코칭', '화상 상담으로 밀착감', '합리적 가격'],
    cautions: ['스마트폰 필수', '자기 관리 의지 필요'],
    reviewSummary: '"화상 상담이 생각보다 효과적이에요. 혼자서 못 할 때 딱이에요."',
    consultLink: '#',
  },
];
