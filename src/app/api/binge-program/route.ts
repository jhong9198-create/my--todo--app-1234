import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, error } = await supabase.from("binge_program_logs").insert({
    session_id: body.session_id ?? null,
    day_number: body.day_number ?? null,
    craving_level: body.craving_level ?? null,
    emotion: body.emotion ?? null,
    action_taken: body.action_taken ?? null,
    completed: body.completed ?? false,
    memo: body.memo ?? null,
  }).select();

  if (error) {
    console.error("[binge-program/api] insert error:", JSON.stringify(error));
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }

  console.log("[binge-program/api] insert success:", JSON.stringify(data));
  return NextResponse.json({ ok: true, data });
}
