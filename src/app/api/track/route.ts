import { NextRequest, NextResponse } from "next/server";

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

function richText(value: string | undefined) {
  return {
    rich_text: [{ text: { content: value ?? "" } }],
  };
}

export async function POST(req: NextRequest) {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    console.error("[track/api] NOTION_TOKEN 또는 NOTION_DATABASE_ID 환경변수 누락");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let body: TrackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const properties = {
    "Event Name": {
      title: [{ text: { content: body.eventName } }],
    },
    "Created At": {
      date: { start: body.createdAt },
    },
    "Result Type":          richText(body.resultType),
    "Top Recommendation":   richText(body.topRecommendation),
    "Selected Answers":     richText(
      body.selectedAnswers ? JSON.stringify(body.selectedAnswers) : ""
    ),
    "Accuracy":             richText(body.accuracy),
    "Interest":             richText(body.interest),
    "Consultation Intent":  richText(body.consultationIntent),
    "Name":                 richText(body.name),
    "Phone":                richText(body.phone),
  };

  try {
    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("[track/api] Notion 오류:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log(`[track/api] ✓ 저장: ${body.eventName} (${body.createdAt})`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track/api] fetch 오류:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
