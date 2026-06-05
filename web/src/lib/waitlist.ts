import { getSupabaseClient } from "./supabase";

export type WaitlistJoinInput = {
  email: string;
  source?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  // 구독 흐름 폐기(2026-06-01). 호출처에서 항상 "free" 전달.
  // pricing_intent 컬럼은 의미 재활용 이력: yes/maybe/no → free/subscribe → free.
  // device_pref 컬럼은 방치(앱배지 신호 폐기).
  pricingIntent?: "free" | null;
};

export type WaitlistJoinResult =
  | { status: "ok" }
  | { status: "duplicate" }
  | { status: "invalid_email" }
  | { status: "error"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(raw));
}

export async function joinWaitlist(
  input: WaitlistJoinInput,
): Promise<WaitlistJoinResult> {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return { status: "invalid_email" };
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("waitlist").insert({
      email,
      source: input.source ?? null,
      referrer: input.referrer ?? null,
      user_agent: input.userAgent ?? null,
      pricing_intent: input.pricingIntent ?? null,
    });

    if (!error) return { status: "ok" };

    // Postgres unique_violation
    if (error.code === "23505") return { status: "duplicate" };

    return { status: "error", message: error.message };
  } catch (e) {
    // 환경변수 누락 등 클라이언트 생성 자체가 실패한 경우
    const message = e instanceof Error ? e.message : "알 수 없는 오류";
    return { status: "error", message };
  }
}
