"use server";

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface FortuneResult {
  zodiac: string;
  chineseZodiac: string;
  overall: { score: number; text: string };
  love: { score: number; text: string };
  money: { score: number; text: string };
  career: { score: number; text: string };
  health: { score: number; text: string };
  luckyColor: string;
  luckyNumber: number;
  luckyItem: string;
  mentoring: string;
  todayKeyword: string;
}

function getZodiac(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "양자리 ♈";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "황소자리 ♉";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "쌍둥이자리 ♊";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "게자리 ♋";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "사자자리 ♌";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "처녀자리 ♍";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "천칭자리 ♎";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "전갈자리 ♏";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "사수자리 ♐";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "염소자리 ♑";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "물병자리 ♒";
  return "물고기자리 ♓";
}

function getChineseZodiac(year: number): string {
  const animals = ["쥐🐭", "소🐂", "호랑이🐯", "토끼🐰", "용🐲", "뱀🐍", "말🐴", "양🐑", "원숭이🐒", "닭🐓", "개🐕", "돼지🐷"];
  return animals[((year - 4) % 12 + 12) % 12];
}

function buildFallback(zodiac: string, chineseZodiac: string, today: string): FortuneResult {
  const seed = today.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (min: number, max: number) => min + (seed % (max - min + 1));
  const colors = ["루비 레드", "사파이어 블루", "에메랄드 그린", "골든 옐로우", "로즈 핑크", "바이올렛 퍼플"];
  const items = ["수정 팔찌", "네잎클로버", "행운의 동전", "봉황 열쇠고리", "빨간 실팔찌", "산호 목걸이"];
  return {
    zodiac,
    chineseZodiac,
    overall: { score: r(3, 5), text: "오늘은 새로운 에너지가 흐르는 날입니다. 작은 결단이 큰 변화를 만들어낼 수 있어요." },
    love: { score: r(2, 5), text: "진심을 담은 표현이 상대방의 마음을 움직일 것입니다." },
    money: { score: r(2, 5), text: "충동적인 지출보다 신중한 계획이 재물을 지켜줍니다." },
    career: { score: r(3, 5), text: "아이디어를 적극적으로 표현해보세요. 협업에서 좋은 기회가 옵니다." },
    health: { score: r(3, 5), text: "규칙적인 수면과 충분한 수분 섭취가 오늘의 핵심입니다." },
    luckyColor: colors[seed % colors.length],
    luckyNumber: r(1, 99),
    luckyItem: items[seed % items.length],
    mentoring: "오늘 하루, 내가 통제할 수 없는 것은 내려놓고 내가 할 수 있는 일에만 에너지를 쏟아보세요. 완벽한 하루보다 '충분히 좋은' 하루가 더 오래 기억됩니다. 당신은 이미 충분합니다.",
    todayKeyword: "새로운 시작",
  };
}

export async function getFortune(
  year: number,
  month: number,
  day: number
): Promise<FortuneResult> {
  const today = new Date().toISOString().slice(0, 10);
  const zodiac = getZodiac(month, day);
  const chineseZodiac = getChineseZodiac(year);

  const prompt = `당신은 동서양 운세를 융합하는 최고의 운세 마스터입니다. 오늘(${today}) 생년월일 ${year}년 ${month}월 ${day}일 (별자리: ${zodiac}, 띠: ${chineseZodiac}) 사용자의 운세를 봐주세요.

아래 형식으로 정확히 응답해주세요. 각 섹션은 ===섹션명=== 구분자로 나눠주세요:

===종합운===
점수: [1-5 사이 숫자]
내용: [생동감 있고 구체적인 종합운 2-3문장]

===애정운===
점수: [1-5 사이 숫자]
내용: [애정/연애 운세 2문장]

===재물운===
점수: [1-5 사이 숫자]
내용: [재물/금전 운세 2문장]

===직업운===
점수: [1-5 사이 숫자]
내용: [직업/커리어 운세 2문장]

===건강운===
점수: [1-5 사이 숫자]
내용: [건강 운세 2문장]

===행운정보===
색상: [오늘의 행운 색상 이름]
숫자: [1-99 사이 행운의 숫자]
아이템: [행운의 물건 이름]
키워드: [오늘을 대표하는 한 단어]

===멘토링카드===
[이 사람에게 전하는 따뜻하고 통찰력 있는 인생 멘토링 메시지. 운세 기반으로 오늘 실천할 수 있는 마음가짐이나 행동을 담아주세요. 3-4문장. 단순 위로가 아닌 진짜 변화를 만드는 통찰을 담아주세요.]`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    const extractSection = (name: string) => {
      const regex = new RegExp(`===${name}===\\s*([\\s\\S]*?)(?====|$)`);
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    };

    const parseScoreText = (raw: string | null) => {
      if (!raw) return { score: 3, text: "" };
      const scoreMatch = raw.match(/점수[:\s]+([1-5])/);
      const textMatch = raw.match(/내용[:\s]+(.+)/s);
      return {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 3,
        text: textMatch ? textMatch[1].trim() : raw,
      };
    };

    const luckyRaw = extractSection("행운정보") ?? "";
    const colorMatch = luckyRaw.match(/색상[:\s]+(.+)/);
    const numberMatch = luckyRaw.match(/숫자[:\s]+(\d+)/);
    const itemMatch = luckyRaw.match(/아이템[:\s]+(.+)/);
    const keywordMatch = luckyRaw.match(/키워드[:\s]+(.+)/);

    return {
      zodiac,
      chineseZodiac,
      overall: parseScoreText(extractSection("종합운")),
      love: parseScoreText(extractSection("애정운")),
      money: parseScoreText(extractSection("재물운")),
      career: parseScoreText(extractSection("직업운")),
      health: parseScoreText(extractSection("건강운")),
      luckyColor: colorMatch ? colorMatch[1].trim() : "골든 옐로우",
      luckyNumber: numberMatch ? parseInt(numberMatch[1]) : 7,
      luckyItem: itemMatch ? itemMatch[1].trim() : "행운의 동전",
      mentoring: extractSection("멘토링카드") ?? "오늘 하루도 당신만의 속도로 나아가세요.",
      todayKeyword: keywordMatch ? keywordMatch[1].trim() : "새로운 에너지",
    };
  } catch {
    return buildFallback(zodiac, chineseZodiac, today);
  }
}
