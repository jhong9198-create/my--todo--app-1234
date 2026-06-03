export interface TrackPayload {
  eventName: string;
  resultType?: string;
  topRecommendation?: string;
  selectedAnswers?: Record<string, unknown>;
  accuracy?: string;
  interest?: string;
  consultationIntent?: string;
  name?: string;
  phone?: string;
}

// 세션 내 중복 방지 대상 이벤트 (pathname 단위)
const SESSION_DEDUPE_EVENTS = new Set([
  "quiz_start",
  "result_reached",
  "businesses_page_visit",
]);

function getSessionKey(eventName: string, pathname: string) {
  return `wg_tracked::${eventName}::${pathname}`;
}

function isDuplicate(eventName: string): boolean {
  if (typeof window === "undefined") return false;
  if (!SESSION_DEDUPE_EVENTS.has(eventName)) return false;

  const key = getSessionKey(eventName, window.location.pathname);
  if (sessionStorage.getItem(key)) return true;

  sessionStorage.setItem(key, "1");
  return false;
}

export async function trackEvent(payload: TrackPayload): Promise<void> {
  if (typeof window === "undefined") return;

  if (isDuplicate(payload.eventName)) {
    console.log(`[track] skipped duplicate: ${payload.eventName}`);
    return;
  }

  try {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        createdAt: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      console.log(`[track] ✓ ${payload.eventName}`);
    } else {
      const text = await res.text();
      console.warn(`[track] ✗ ${payload.eventName}:`, text);
    }
  } catch (err) {
    console.warn(`[track] error (${payload.eventName}):`, err);
  }
}
