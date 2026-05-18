import { getSupabaseClient } from "./supabase";

export type WaitlistJoinInput = {
  email: string;
  source?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
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

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("waitlist").insert({
    email,
    source: input.source ?? null,
    referrer: input.referrer ?? null,
    user_agent: input.userAgent ?? null,
  });

  if (!error) return { status: "ok" };

  // Postgres unique_violation
  if (error.code === "23505") return { status: "duplicate" };

  return { status: "error", message: error.message };
}
