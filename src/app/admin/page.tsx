import { createClient } from "@supabase/supabase-js";

const ADMIN_PW = process.env.ADMIN_PASSWORD ?? "diet2024";

const CTA_EVENTS = [
  "hero_cta_click", "how_it_works_cta_click", "hero_7day_cta_click",
  "relapse_7day_cta_click", "binge_risk_cta_clicked", "deep_report_notify_clicked",
  "beta_tester_clicked", "cta_retry", "cta_my_solution", "cta_nearby",
  "result_7day_program_click", "locked_share_click", "result_share_click",
];

function getKSTRanges() {
  const KST = 9 * 60 * 60 * 1000;
  const nowUTC = Date.now();
  const nowKST = nowUTC + KST;
  const todayKSTMidnight = nowKST - (nowKST % (24 * 60 * 60 * 1000));
  const todayStart = new Date(todayKSTMidnight - KST).toISOString();
  const todayEnd = new Date(todayKSTMidnight - KST + 24 * 60 * 60 * 1000).toISOString();
  const yesterdayStart = new Date(todayKSTMidnight - KST - 24 * 60 * 60 * 1000).toISOString();
  const yesterdayEnd = todayStart;
  return { todayStart, todayEnd, yesterdayStart, yesterdayEnd };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDailyStats(supabase: any) {
  const { todayStart, todayEnd, yesterdayStart, yesterdayEnd } = getKSTRanges();

  const [
    todayEvents,
    yesterdayEvents,
    todaySessions,
    yesterdaySessions,
    todayCTA,
    yesterdayCTA,
    todayBinge,
    yesterdayBinge,
    todayPageView,
    yesterdayPageView,
  ] = await Promise.all([
    supabase.from("wg_events").select("*", { count: "exact", head: true })
      .gte("created_at", todayStart).lt("created_at", todayEnd),
    supabase.from("wg_events").select("*", { count: "exact", head: true })
      .gte("created_at", yesterdayStart).lt("created_at", yesterdayEnd),

    supabase.from("wg_events").select("session_id")
      .gte("created_at", todayStart).lt("created_at", todayEnd).not("session_id", "is", null),
    supabase.from("wg_events").select("session_id")
      .gte("created_at", yesterdayStart).lt("created_at", yesterdayEnd).not("session_id", "is", null),

    supabase.from("wg_events").select("*", { count: "exact", head: true })
      .in("event_name", CTA_EVENTS).gte("created_at", todayStart).lt("created_at", todayEnd),
    supabase.from("wg_events").select("*", { count: "exact", head: true })
      .in("event_name", CTA_EVENTS).gte("created_at", yesterdayStart).lt("created_at", yesterdayEnd),

    supabase.from("binge_program_logs").select("*", { count: "exact", head: true })
      .gte("created_at", todayStart).lt("created_at", todayEnd),
    supabase.from("binge_program_logs").select("*", { count: "exact", head: true })
      .gte("created_at", yesterdayStart).lt("created_at", yesterdayEnd),

    supabase.from("wg_events").select("*", { count: "exact", head: true })
      .eq("event_name", "page_view_landing").gte("created_at", todayStart).lt("created_at", todayEnd),
    supabase.from("wg_events").select("*", { count: "exact", head: true })
      .eq("event_name", "page_view_landing").gte("created_at", yesterdayStart).lt("created_at", yesterdayEnd),
  ]);

  if (todayEvents.error) console.log("[admin] wg_events 오늘 오류:", todayEvents.error);
  if (yesterdayEvents.error) console.log("[admin] wg_events 어제 오류:", yesterdayEvents.error);
  if (todayBinge.error) console.log("[admin] binge_program_logs 오늘 오류:", todayBinge.error);
  if (yesterdayBinge.error) console.log("[admin] binge_program_logs 어제 오류:", yesterdayBinge.error);

  const todayUnique = new Set((todaySessions.data ?? []).map((r: { session_id: string }) => r.session_id)).size;
  const yesterdayUnique = new Set((yesterdaySessions.data ?? []).map((r: { session_id: string }) => r.session_id)).size;

  return {
    today: {
      events: todayEvents.count ?? 0,
      sessions: todayUnique,
      cta: todayCTA.count ?? 0,
      binge: todayBinge.error ? null : (todayBinge.count ?? 0),
      pageView: todayPageView.count ?? 0,
    },
    yesterday: {
      events: yesterdayEvents.count ?? 0,
      sessions: yesterdayUnique,
      cta: yesterdayCTA.count ?? 0,
      binge: yesterdayBinge.error ? null : (yesterdayBinge.count ?? 0),
      pageView: yesterdayPageView.count ?? 0,
    },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const TYPE_LABELS: Record<string, string> = {
  stress_binge: "😤 스트레스폭식형",
  night_eating: "🌙 야식반복형",
  three_day: "📅 작심삼일형",
  plateau: "📊 정체기좌절형",
  social_eating: "🍻 회식무너짐형",
  exercise_avoidance: "🏃 운동회피형",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ pw?: string }>;
}) {
  const { pw } = await searchParams;

  if (pw !== ADMIN_PW) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f5f0e8" }}>
        <div className="bg-white rounded-2xl p-10 text-center shadow-lg max-w-sm w-full mx-4">
          <p className="text-3xl mb-4">🔒</p>
          <p className="font-bold text-gray-700 mb-2">관리자 전용 페이지</p>
          <p className="text-sm text-gray-400">URL에 <code className="bg-gray-100 px-1 rounded">?pw=비밀번호</code>를 추가하세요</p>
        </div>
      </main>
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const dailyStats = await getDailyStats(supabase);

  const [
    { data: leads },
    { count: totalEvents },
    { count: diagnosisStart },
    { count: diagnosisComplete },
    { count: resultViewed },
    { count: bizVisit },
    { count: surveyStart },
    { count: surveyComplete },
  ] = await Promise.all([
    supabase
      .from("wg_events")
      .select("created_at, name, kakao_id, email, consultation_intent, result_type, selected_answers")
      .eq("event_name", "consultation_request_submitted")
      .order("created_at", { ascending: false }),
    supabase.from("wg_events").select("*", { count: "exact", head: true }),
    supabase.from("wg_events").select("*", { count: "exact", head: true }).eq("event_name", "diagnosis_start"),
    supabase.from("wg_events").select("*", { count: "exact", head: true }).eq("event_name", "diagnosis_complete"),
    supabase.from("wg_events").select("*", { count: "exact", head: true }).eq("event_name", "diagnosis_result_viewed"),
    supabase.from("wg_events").select("*", { count: "exact", head: true }).eq("event_name", "businesses_page_visit"),
    supabase.from("wg_events").select("*", { count: "exact", head: true }).eq("event_name", "survey_start"),
    supabase.from("wg_events").select("*", { count: "exact", head: true }).eq("event_name", "survey_complete"),
  ]);

  const conversionRate = diagnosisStart && diagnosisComplete
    ? Math.round((diagnosisComplete / diagnosisStart) * 100)
    : 0;

  return (
    <main className="min-h-screen pb-16" style={{ background: "#f5f0e8" }}>
      <div className="max-w-3xl mx-auto px-4 pt-10">

        {/* 헤더 */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-amber-600 mb-1">ADMIN DASHBOARD</p>
          <h1 className="text-2xl font-black" style={{ color: "#1a2744" }}>다이어트 어디가? 관리자</h1>
        </div>

        {/* 오늘/어제 통계 */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-xs font-black tracking-widest text-amber-600 mb-4">오늘 / 어제 통계 (KST)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                label: "랜딩 방문",
                today: dailyStats.today.pageView,
                yesterday: dailyStats.yesterday.pageView,
              },
              {
                label: "고유 세션",
                today: dailyStats.today.sessions,
                yesterday: dailyStats.yesterday.sessions,
              },
              {
                label: "전체 이벤트",
                today: dailyStats.today.events,
                yesterday: dailyStats.yesterday.events,
              },
              {
                label: "CTA 클릭",
                today: dailyStats.today.cta,
                yesterday: dailyStats.yesterday.cta,
              },
              {
                label: "폭식 프로그램 저장",
                today: dailyStats.today.binge,
                yesterday: dailyStats.yesterday.binge,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-4" style={{ background: "#f9f5ec" }}>
                <p className="text-xs text-gray-500 mb-2 font-semibold">{item.label}</p>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-2xl font-black" style={{ color: "#1a2744" }}>
                      {item.today === null ? "—" : item.today}
                    </p>
                    <p className="text-xs text-amber-500 font-semibold">오늘</p>
                  </div>
                  <div className="mb-0.5">
                    <p className="text-lg font-bold text-gray-400">
                      {item.yesterday === null ? "—" : item.yesterday}
                    </p>
                    <p className="text-xs text-gray-400">어제</p>
                  </div>
                </div>
                {item.today === null && item.yesterday === null && (
                  <p className="text-xs text-gray-400 mt-1">폭식 프로그램 저장 데이터 없음</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 핵심 지표 */}
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
          {[
            { label: "전체 이벤트", value: totalEvents ?? 0 },
            { label: "진단 완료", value: diagnosisComplete ?? 0, sub: `전환 ${conversionRate}%` },
            { label: "업체 방문", value: bizVisit ?? 0 },
            { label: "상담 신청 🔥", value: leads?.length ?? 0 },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-black" style={{ color: "#1a2744" }}>{item.value}</p>
              {item.sub && <p className="text-xs text-amber-500 font-semibold">{item.sub}</p>}
              <p className="text-xs text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* 퍼널 */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-xs font-black tracking-widest text-amber-600 mb-4">유입 퍼널</p>
          <div className="space-y-3">
            {[
              { label: "진단 시작", value: diagnosisStart ?? 0, max: diagnosisStart ?? 1 },
              { label: "진단 완료", value: diagnosisComplete ?? 0, max: diagnosisStart ?? 1 },
              { label: "결과 확인", value: resultViewed ?? 0, max: diagnosisStart ?? 1 },
              { label: "업체 방문", value: bizVisit ?? 0, max: diagnosisStart ?? 1 },
              { label: "상담 신청", value: leads?.length ?? 0, max: diagnosisStart ?? 1 },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 shrink-0">{row.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${row.max > 0 ? Math.round((row.value / row.max) * 100) : 0}%`,
                      background: "#1a2744",
                    }}
                  />
                </div>
                <span className="text-xs font-bold w-6 text-right" style={{ color: "#1a2744" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 설문 */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-xs font-black tracking-widest text-amber-600 mb-4">설문 퍼널</p>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-black" style={{ color: "#1a2744" }}>{surveyStart ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">시작</p>
            </div>
            <div className="flex items-center text-gray-300 text-lg">→</div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-600">{surveyComplete ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">완료</p>
            </div>
            <div className="flex items-center text-gray-300 text-lg">→</div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-500">
                {surveyStart ? Math.round(((surveyComplete ?? 0) / surveyStart) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">완주율</p>
            </div>
          </div>
        </div>

        {/* 상담 신청 리드 목록 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-black tracking-widest text-amber-600">상담 신청 리드</p>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: leads && leads.length > 0 ? "#1a2744" : "#eee", color: leads && leads.length > 0 ? "white" : "#999" }}
            >
              총 {leads?.length ?? 0}건
            </span>
          </div>

          {!leads || leads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm text-gray-400">아직 상담 신청이 없습니다</p>
              <p className="text-xs text-gray-300 mt-1">업체 상세 페이지에서 신청 시 여기에 표시됩니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 border"
                  style={{ borderColor: "rgba(212,168,83,0.25)", background: "#fffdf8" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-sm" style={{ color: "#1a2744" }}>
                        {lead.name ?? "이름 없음"}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{formatDate(lead.created_at)}</span>
                    </div>
                    {lead.result_type && (
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(212,168,83,0.15)", color: "#7a6520" }}>
                        {TYPE_LABELS[lead.result_type] ?? lead.result_type}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {lead.kakao_id && (
                      <p className="text-sm">
                        <span className="text-xs text-gray-400 mr-1">카카오</span>
                        <span className="font-mono font-semibold" style={{ color: "#1a2744" }}>{lead.kakao_id}</span>
                      </p>
                    )}
                    {lead.email && (
                      <p className="text-sm">
                        <span className="text-xs text-gray-400 mr-1">이메일</span>
                        <span className="font-mono font-semibold" style={{ color: "#1a2744" }}>{lead.email}</span>
                      </p>
                    )}
                    {lead.consultation_intent && (
                      <p className="text-xs text-gray-500">
                        문의 업체: <strong>{lead.consultation_intent}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
