import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { 업종, 고객유형, 마지막방문, 받은서비스, 고객상황, 연락목적, 응대톤, 주의사항 } = body;

  if (!업종 || !고객유형 || !마지막방문 || !받은서비스 || !고객상황 || !연락목적 || !응대톤) {
    return NextResponse.json({ success: false, error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }

  const prompt = `당신은 1인 뷰티샵 사장님을 돕는 CRM 문구 작성 전문가입니다.

반드시 지켜야 할 규칙:
- 고객 성격을 판단하거나 라벨(진상, 예민함, 구매성향 등)을 붙이지 않습니다
- 피부질환 진단, 치료, 완치, 효과 보장 표현을 사용하지 않습니다
- "확실히 좋아집니다", "효과가 보장됩니다" 같은 과장광고 표현을 쓰지 않습니다
- 의료적 조언을 하지 않습니다
- 부담스럽지 않고 따뜻하며 자연스러운 문체로 작성합니다
- 샵 사장님이 고객에게 바로 복사해서 보낼 수 있는 말투로 작성합니다

고객 방문 정보:
- 업종: ${업종}
- 고객 유형: ${고객유형}
- 마지막 방문: ${마지막방문} 전
- 받은 서비스: ${받은서비스}
- 고객 상황: ${고객상황}
- 연락 목적: ${연락목적}
- 응대 톤: ${응대톤}
${주의사항 ? `- 주의 사항: ${주의사항}` : ""}

아래 형식으로 정확하게 작성해주세요. 각 섹션은 ===섹션명=== 구분자로 시작합니다.

===카톡문구1===
카카오톡에 적합한 문구. 자연스럽고 따뜻하게, 2~4문장. 적절한 이모지 1~2개 포함 가능.

===카톡문구2===
카카오톡에 적합한 다른 버전 문구. 다른 방식으로 시작해서 변화를 줄 것.

===카톡문구3===
카카오톡에 적합한 또 다른 버전 문구. 앞의 두 버전과 다른 접근으로.

===문자1===
짧은 문자 버전. 50자 내외, 1~2문장.

===문자2===
짧은 문자 다른 버전. 50자 내외, 다른 방식으로.

===문자3===
짧은 문자 또 다른 버전. 50자 내외, 또 다른 방식으로.

===예약유도===
예약으로 자연스럽게 이어지는 한 문장. 강요하지 않고 부드럽게.

===피해야할표현===
이 상황에서 쓰지 말아야 할 표현 3가지를 각각 한 줄씩 작성. 왜 피해야 하는지 간단히 설명 포함.`;

  try {
    const message = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.choices[0].message.content ?? "";

    const extract = (section: string) => {
      const regex = new RegExp(`===${section}===\\s*([\\s\\S]*?)(?====|$)`);
      const match = content.match(regex);
      return match ? match[1].trim() : null;
    };

    const result = {
      kakao: [extract("카톡문구1"), extract("카톡문구2"), extract("카톡문구3")].filter(Boolean),
      sms: [extract("문자1"), extract("문자2"), extract("문자3")].filter(Boolean),
      reservation: extract("예약유도"),
      avoid: extract("피해야할표현"),
    };

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json({ success: false, error: "문구 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
