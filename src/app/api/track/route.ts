import { NextRequest, NextResponse } from "next/server";

// Google Apps Script 웹훅으로 데이터를 전송합니다.
// 설정 방법은 프로젝트 루트 GOOGLE_SHEETS_SETUP.md 참고
interface TrackBody {
  eventName: string;
  createdAt: string;
  resultType?: string;
  topRecommendation?: string;
  selectedAnswers?: Record<string, unknown>;
  accuracy?: string;
  interest?: string;
  consultationIntent?: string;
  name?: string;
  phone?: string;
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("[track/api] GOOGLE_SHEETS_WEBHOOK_URL 환경변수 누락");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let body: TrackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Apps Script는 redirect를 따라가야 함
      redirect: "follow",
    });

    const responseText = await res.text();
    console.log(`[track/api] Apps Script 응답 (status ${res.status}):`, responseText);

    if (!res.ok) {
      console.error("[track/api] Google Sheets HTTP 오류:", res.status, responseText);
      return NextResponse.json({ error: responseText }, { status: 500 });
    }

    let responseJson: { ok?: boolean; error?: string } = {};
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      console.warn("[track/api] Apps Script 응답이 JSON이 아님:", responseText);
    }

    if (responseJson.error) {
      console.error("[track/api] Apps Script 내부 오류:", responseJson.error);
      return NextResponse.json({ error: responseJson.error }, { status: 500 });
    }

    console.log(`[track/api] ✓ 저장: ${body.eventName} (${body.createdAt})`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track/api] fetch 오류:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
