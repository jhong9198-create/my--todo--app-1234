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

    if (!res.ok) {
      const text = await res.text();
      console.error("[track/api] Google Sheets 오류:", text);
      return NextResponse.json({ error: text }, { status: 500 });
    }

    console.log(`[track/api] ✓ 저장: ${body.eventName} (${body.createdAt})`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track/api] fetch 오류:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
