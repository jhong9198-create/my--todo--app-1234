import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { error } = await supabase.from("wg_events").insert({
    event_name: body.eventName,
    created_at: body.createdAt ?? new Date().toISOString(),
    result_type: body.resultType ?? null,
    top_recommendation: body.topRecommendation ?? null,
    selected_answers: body.selectedAnswers ?? null,
    accuracy: body.accuracy ?? null,
    interest: body.interest ?? null,
    consultation_intent: body.consultationIntent ?? null,
    name: body.name ?? null,
    phone: body.phone ?? null,
  });

  if (error) {
    console.error("[track/api] Supabase 오류:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
