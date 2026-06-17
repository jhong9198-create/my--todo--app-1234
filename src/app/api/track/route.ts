import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function sendToNotion(body: Record<string, unknown>) {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DATABASE_ID;
  if (!token || !dbId) return; // DB 미설정 시 건너뜀

  const createdAt = (body.createdAt as string) ?? new Date().toISOString();

  await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        "문서 이름": { title: [{ text: { content: String(body.eventName ?? "") } }] },
        "Created At": { date: { start: createdAt } },
        "Session ID": { rich_text: [{ text: { content: String(body.sessionId ?? "") } }] },
        "Result Type": { rich_text: [{ text: { content: String(body.resultType ?? "") } }] },
        "Top Recommendation": { rich_text: [{ text: { content: String(body.topRecommendation ?? "") } }] },
        "Accuracy": { rich_text: [{ text: { content: String(body.accuracy ?? "") } }] },
        "Interest": { rich_text: [{ text: { content: String(body.interest ?? "") } }] },
        "Consultation Intent": { rich_text: [{ text: { content: String(body.consultationIntent ?? "") } }] },
        "Name": { rich_text: [{ text: { content: String(body.name ?? "") } }] },
        "Phone": { rich_text: [{ text: { content: String(body.phone ?? "") } }] },
        "KakaoID": { rich_text: [{ text: { content: String(body.kakaoId ?? "") } }] },
        "Email": { rich_text: [{ text: { content: String(body.email ?? "") } }] },
        "QuittingWord": { rich_text: [{ text: { content: String(body.quittingWord ?? "") } }] },
      },
    }),
  }).catch((err) => console.error("[track/api] Notion 오류:", err));
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[track/api] 환경변수 누락 — URL:", supabaseUrl, "KEY:", supabaseKey ? "있음" : "없음");
    return NextResponse.json({ error: "env missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, error } = await supabase.from("wg_events").insert({
    event_name: body.eventName,
    created_at: body.createdAt ?? new Date().toISOString(),
    session_id: body.sessionId ?? null,
    result_type: body.resultType ?? null,
    top_recommendation: body.topRecommendation ?? null,
    selected_answers: body.selectedAnswers ?? null,
    accuracy: body.accuracy ?? null,
    interest: body.interest ?? null,
    consultation_intent: body.consultationIntent ?? null,
    name: body.name ?? null,
    phone: body.phone ?? null,
    kakao_id: body.kakaoId ?? null,
    email: body.email ?? null,
    quitting_word: body.quittingWord ?? null,
    user_agent: body.userAgent ?? null,
    device_id: body.deviceId ?? null,
    utm_source: body.utmSource ?? null,
    utm_campaign: body.utmCampaign ?? null,
    utm_medium: body.utmMedium ?? null,
  }).select();

  if (error) {
    console.error("[track/api] Supabase insert 오류:", error.code, error.message, error.details);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    console.error("[track/api] Supabase insert 무시됨 — RLS 또는 정책 문제. event:", body.eventName);
    return NextResponse.json({ error: "insert silently ignored" }, { status: 500 });
  }

  // Notion은 fire-and-forget (실패해도 Supabase 저장은 유지)
  void sendToNotion(body);

  return NextResponse.json({ ok: true });
}
