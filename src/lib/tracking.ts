export interface TrackPayload {
  eventName: string;
  createdAt?: string;
  resultType?: string;
  topRecommendation?: string;
  selectedAnswers?: Record<string, unknown>;
  accuracy?: string;
  interest?: string;
  consultationIntent?: string;
  name?: string;
  phone?: string;
}

export async function trackEvent(payload: TrackPayload): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        createdAt: payload.createdAt ?? new Date().toISOString(),
      }),
    });
  } catch {
    // fire-and-forget, 실패해도 UX에 영향 없음
  }
}
