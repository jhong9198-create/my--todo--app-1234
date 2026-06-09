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

  const { error } = await supabase.from("binge_program_logs").insert({
    session_id: body.session_id ?? null,
    day_number: body.day_number ?? null,
    craving_level: body.craving_level ?? null,
    emotion: body.emotion ?? null,
    action_taken: body.action_taken ?? null,
    completed: body.completed ?? false,
    memo: body.memo ?? null,
  });

  if (error) {
    console.error("[binge-program/api] Supabase 오류:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
