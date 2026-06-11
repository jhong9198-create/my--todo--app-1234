import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { error } = await supabase().from("checkin_logs").insert({
    device_id: body.device_id,
    craving_score: body.craving_score,
    emotion: body.emotion,
    date_kst: body.date_kst,
  });

  if (error) {
    console.error("[checkin/api] insert error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("device_id");
  if (!deviceId) {
    return NextResponse.json({ error: "device_id required" }, { status: 400 });
  }

  const { data, error } = await supabase()
    .from("checkin_logs")
    .select("craving_score, emotion, date_kst, created_at")
    .eq("device_id", deviceId)
    .order("date_kst", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
