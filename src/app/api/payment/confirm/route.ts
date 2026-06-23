import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.PORTONE_API_KEY;
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiKey || !apiSecret) {
    console.error("[payment/confirm] 환경변수 누락 — PORTONE_API_KEY or PORTONE_API_SECRET");
    return NextResponse.json({ error: "env missing" }, { status: 500 });
  }

  let body: { imp_uid: string; merchant_uid: string; amount: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // 1. 포트원 액세스 토큰 발급
  const tokenRes = await fetch("https://api.iamport.kr/users/getToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imp_key: apiKey, imp_secret: apiSecret }),
  });
  const tokenJson = await tokenRes.json() as { response?: { access_token: string }; message?: string };
  const accessToken = tokenJson?.response?.access_token;
  if (!accessToken) {
    console.error("[payment/confirm] 토큰 발급 실패:", tokenJson?.message);
    return NextResponse.json({ error: "token error" }, { status: 502 });
  }

  // 2. imp_uid로 결제 정보 조회
  const paymentRes = await fetch(`https://api.iamport.kr/payments/${body.imp_uid}`, {
    headers: { Authorization: accessToken },
  });
  const paymentJson = await paymentRes.json() as {
    response?: { amount: number; status: string; merchant_uid: string; imp_uid: string };
    message?: string;
  };
  const payment = paymentJson?.response;
  if (!payment) {
    console.error("[payment/confirm] 결제 정보 없음:", paymentJson?.message);
    return NextResponse.json({ error: "payment not found" }, { status: 404 });
  }

  // 3. 금액·상태·merchant_uid 검증 (위변조 방지)
  if (
    payment.status !== "paid" ||
    payment.amount !== body.amount ||
    payment.merchant_uid !== body.merchant_uid
  ) {
    console.error("[payment/confirm] 검증 실패 — status:", payment.status, "amount:", payment.amount, "expected:", body.amount);
    return NextResponse.json({ error: "payment invalid" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, imp_uid: payment.imp_uid });
}
