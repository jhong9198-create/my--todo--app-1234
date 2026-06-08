import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_PW = process.env.ADMIN_PASSWORD ?? "diet2024";

const TYPE_LABELS: Record<string, string> = {
  stress_binge: "스트레스폭식형",
  night_eating: "야식반복형",
  three_day: "작심삼일형",
  plateau: "정체기좌절형",
  social_eating: "회식무너짐형",
  exercise_avoidance: "운동회피형",
};

export async function GET(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get("pw");
  if (pw !== ADMIN_PW) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("wg_events")
    .select("created_at, event_name, name, kakao_id, email, consultation_intent, result_type, quitting_word")
    .in("event_name", ["consultation_request_submitted", "direct_lead_captured"])
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    return new NextResponse("날짜,이름,카카오ID,이메일,문의업체/경로,진단유형,포기한마디\n데이터 없음", {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const rows = data.map((r) => [
    new Date(r.created_at).toLocaleString("ko-KR"),
    r.name ?? "",
    r.kakao_id ?? "",
    r.email ?? "",
    r.consultation_intent ?? (r.event_name === "direct_lead_captured" ? "결과페이지직접" : ""),
    TYPE_LABELS[r.result_type ?? ""] ?? r.result_type ?? "",
    r.quitting_word ?? "",
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = ["날짜,이름,카카오ID,이메일,문의업체/경로,진단유형,포기한마디", ...rows].join("\n");

  return new NextResponse("﻿" + csv, { // BOM for Excel 한글 깨짐 방지
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
