"use server";

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface TarotCard {
  index: number;
  name: string;
  nameEn: string;
  emoji: string;
  keywords: string;
  reversed: boolean;
  bgFrom: string;
  bgTo: string;
}

export interface TarotResult {
  past: string;
  present: string;
  future: string;
  overall: string;
  advice: string;
}

export const MAJOR_ARCANA: Omit<TarotCard, "reversed">[] = [
  { index: 0,  name: "바보",        nameEn: "The Fool",         emoji: "🌟", keywords: "새로운 시작, 순수함, 모험",      bgFrom: "#f59e0b", bgTo: "#ef4444" },
  { index: 1,  name: "마법사",      nameEn: "The Magician",     emoji: "🔮", keywords: "의지, 창의력, 기술",            bgFrom: "#8b5cf6", bgTo: "#4f46e5" },
  { index: 2,  name: "여사제",      nameEn: "The High Priestess", emoji: "🌙", keywords: "직관, 신비, 내면의 지혜",    bgFrom: "#1d4ed8", bgTo: "#7c3aed" },
  { index: 3,  name: "여황제",      nameEn: "The Empress",      emoji: "🌸", keywords: "풍요, 창조, 모성",             bgFrom: "#10b981", bgTo: "#ec4899" },
  { index: 4,  name: "황제",        nameEn: "The Emperor",      emoji: "👑", keywords: "권위, 안정, 구조",             bgFrom: "#dc2626", bgTo: "#b45309" },
  { index: 5,  name: "교황",        nameEn: "The Hierophant",   emoji: "🏛️", keywords: "전통, 가르침, 신뢰",          bgFrom: "#2563eb", bgTo: "#1d4ed8" },
  { index: 6,  name: "연인",        nameEn: "The Lovers",       emoji: "💞", keywords: "사랑, 선택, 조화",             bgFrom: "#f43f5e", bgTo: "#fb923c" },
  { index: 7,  name: "전차",        nameEn: "The Chariot",      emoji: "⚡", keywords: "승리, 의지, 통제",             bgFrom: "#0ea5e9", bgTo: "#1e3a8a" },
  { index: 8,  name: "힘",          nameEn: "Strength",         emoji: "🦁", keywords: "용기, 인내, 내면의 힘",        bgFrom: "#f97316", bgTo: "#92400e" },
  { index: 9,  name: "은둔자",      nameEn: "The Hermit",       emoji: "🕯️", keywords: "성찰, 지혜, 고독",            bgFrom: "#64748b", bgTo: "#1e293b" },
  { index: 10, name: "운명의 바퀴", nameEn: "Wheel of Fortune", emoji: "☯️", keywords: "순환, 운명, 변화",             bgFrom: "#7c3aed", bgTo: "#b45309" },
  { index: 11, name: "정의",        nameEn: "Justice",          emoji: "⚖️", keywords: "진실, 공정, 균형",             bgFrom: "#2563eb", bgTo: "#64748b" },
  { index: 12, name: "매달린 사람", nameEn: "The Hanged Man",   emoji: "🌀", keywords: "희생, 관점 전환, 기다림",      bgFrom: "#14b8a6", bgTo: "#4f46e5" },
  { index: 13, name: "죽음",        nameEn: "Death",            emoji: "🦋", keywords: "변환, 끝과 시작, 해방",        bgFrom: "#1e293b", bgTo: "#7c3aed" },
  { index: 14, name: "절제",        nameEn: "Temperance",       emoji: "🌈", keywords: "균형, 조화, 인내",             bgFrom: "#38bdf8", bgTo: "#a78bfa" },
  { index: 15, name: "악마",        nameEn: "The Devil",        emoji: "🔗", keywords: "속박, 집착, 물질주의",         bgFrom: "#7f1d1d", bgTo: "#1a1a1a" },
  { index: 16, name: "탑",          nameEn: "The Tower",        emoji: "⛈️", keywords: "급변, 각성, 해체",             bgFrom: "#ea580c", bgTo: "#1c1917" },
  { index: 17, name: "별",          nameEn: "The Star",         emoji: "⭐", keywords: "희망, 영감, 치유",             bgFrom: "#0284c7", bgTo: "#f59e0b" },
  { index: 18, name: "달",          nameEn: "The Moon",         emoji: "🌕", keywords: "환상, 무의식, 불확실성",       bgFrom: "#1e3a8a", bgTo: "#4c1d95" },
  { index: 19, name: "태양",        nameEn: "The Sun",          emoji: "☀️", keywords: "기쁨, 활력, 성공",             bgFrom: "#fbbf24", bgTo: "#f97316" },
  { index: 20, name: "심판",        nameEn: "Judgement",        emoji: "🎺", keywords: "각성, 해방, 재생",             bgFrom: "#3b82f6", bgTo: "#e2e8f0" },
  { index: 21, name: "세계",        nameEn: "The World",        emoji: "🌍", keywords: "완성, 통합, 성취",             bgFrom: "#059669", bgTo: "#7c3aed" },
];

export async function getTarotReading(
  cards: TarotCard[],
  question: string
): Promise<TarotResult> {
  const [past, present, future] = cards;
  const today = new Date().toISOString().slice(0, 10);

  const cardDesc = (c: TarotCard, pos: string) =>
    `${pos}: ${c.name}(${c.nameEn}) ${c.reversed ? "[역방향]" : "[정방향]"} — 키워드: ${c.keywords}`;

  const prompt = `당신은 타로 카드의 오랜 역사와 심리적 통찰을 깊이 이해하는 타로 마스터입니다.
오늘(${today}) 뽑힌 3장의 카드로 3카드 스프레드(과거-현재-미래)를 해석해주세요.

${question ? `질문: "${question}"\n` : ""}
뽑힌 카드:
${cardDesc(past, "과거")}
${cardDesc(present, "현재")}
${cardDesc(future, "미래")}

각 카드의 정방향/역방향 의미, 위치(과거·현재·미래)의 맥락, 카드 간 연결고리를 종합적으로 해석해주세요.
신비롭고 통찰력 있게, 하지만 실제 삶에 적용 가능한 언어로 작성해주세요.

아래 형식으로 정확히 응답해주세요. 각 섹션은 ===섹션명=== 구분자로:

===과거===
과거 카드 해석 (2-3문장. 무엇이 현재 상황을 만들어왔는지, 어떤 에너지가 지나갔는지)

===현재===
현재 카드 해석 (2-3문장. 지금 이 순간 당신 주변에 흐르는 에너지와 상황)

===미래===
미래 카드 해석 (2-3문장. 앞으로 펼쳐질 가능성과 방향, 주의할 점)

===종합해석===
3카드의 흐름을 하나의 이야기로 연결하는 종합 해석 (3-4문장. 전체 메시지)

===타로의조언===
타로가 전하는 오늘의 핵심 조언 (2-3문장. 구체적이고 실천 가능한 메시지)`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const extract = (name: string) => {
      const m = text.match(new RegExp(`===${name}===\\s*([\\s\\S]*?)(?====|$)`));
      return m ? m[1].trim() : null;
    };

    return {
      past: extract("과거") ?? buildFallback(past),
      present: extract("현재") ?? buildFallback(present),
      future: extract("미래") ?? buildFallback(future),
      overall: extract("종합해석") ?? "세 장의 카드가 당신의 여정을 함께 이야기하고 있습니다. 과거의 경험이 현재를 만들었고, 현재의 선택이 미래를 열어갑니다.",
      advice: extract("타로의조언") ?? "오늘 하루, 카드가 전하는 메시지를 마음에 새기고 내면의 소리에 귀 기울여보세요.",
    };
  } catch {
    return {
      past: buildFallback(past),
      present: buildFallback(present),
      future: buildFallback(future),
      overall: "세 장의 카드가 당신의 이야기를 펼쳐 보입니다. 과거에서 현재로, 현재에서 미래로 이어지는 흐름을 느껴보세요.",
      advice: "타로는 방향을 보여줄 뿐, 선택은 언제나 당신의 것입니다. 오늘도 당신만의 길을 믿고 나아가세요.",
    };
  }
}

function buildFallback(card: TarotCard): string {
  const dir = card.reversed ? "역방향" : "정방향";
  return `${card.name} 카드가 ${dir}으로 나타났습니다. ${card.keywords}의 에너지가 이 시기에 중요한 의미를 가집니다. 카드의 메시지를 마음속 깊이 새겨보세요.`;
}
