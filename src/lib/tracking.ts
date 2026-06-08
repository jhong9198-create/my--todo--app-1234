export interface TrackPayload {
  eventName: string;
  createdAt?: string;
  sessionId?: string;
  deviceId?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  resultType?: string;
  topRecommendation?: string;
  selectedAnswers?: Record<string, unknown>;
  accuracy?: string;
  interest?: string;
  consultationIntent?: string;
  name?: string;
  phone?: string;
  kakaoId?: string;
  email?: string;
  quittingWord?: string;
  userAgent?: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "wg_session_id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "wg_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

function getUTMParams(): { utmSource?: string; utmCampaign?: string; utmMedium?: string } {
  if (typeof window === "undefined") return {};

  // URL에 UTM 있으면 localStorage에 저장 (페이지 이동해도 유지)
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source");
  const campaign = params.get("utm_campaign");
  const medium = params.get("utm_medium");

  if (source) localStorage.setItem("wg_utm_source", source);
  if (campaign) localStorage.setItem("wg_utm_campaign", campaign);
  if (medium) localStorage.setItem("wg_utm_medium", medium);

  return {
    utmSource: localStorage.getItem("wg_utm_source") ?? undefined,
    utmCampaign: localStorage.getItem("wg_utm_campaign") ?? undefined,
    utmMedium: localStorage.getItem("wg_utm_medium") ?? undefined,
  };
}

export async function trackEvent(payload: TrackPayload): Promise<void> {
  try {
    const utm = getUTMParams();
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...utm,
        ...payload,
        createdAt: payload.createdAt ?? new Date().toISOString(),
        sessionId: payload.sessionId ?? getSessionId(),
        deviceId: payload.deviceId ?? getDeviceId(),
      }),
    });
  } catch {
    // fire-and-forget, 실패해도 UX에 영향 없음
  }
}
