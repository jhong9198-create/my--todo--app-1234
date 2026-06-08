export interface TrackPayload {
  eventName: string;
  createdAt?: string;
  sessionId?: string;
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

export async function trackEvent(payload: TrackPayload): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        createdAt: payload.createdAt ?? new Date().toISOString(),
        sessionId: payload.sessionId ?? getSessionId(),
      }),
    });
  } catch {
    // fire-and-forget, 실패해도 UX에 영향 없음
  }
}
