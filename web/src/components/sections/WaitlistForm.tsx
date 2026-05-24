"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { readUtmFromUrl, serializeUtmForStorage } from "@/lib/utm";
import { joinWaitlist } from "@/lib/waitlist";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "duplicate" }
  | { kind: "invalid" }
  | { kind: "error"; message: string };

type Theme = "light" | "dark";

type Props = {
  theme?: Theme;
  ctaText?: string;
  onSuccess?: () => void;
  pricingIntent?: "free" | "subscribe" | null;
};

export function WaitlistForm({
  theme = "light",
  ctaText = "대기열 등록",
  onSuccess,
  pricingIntent,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    setStatus({ kind: "submitting" });
    track({ name: "waitlist_submit_attempt" });

    const result = await joinWaitlist({
      email,
      source: serializeUtmForStorage(readUtmFromUrl()),
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      pricingIntent: pricingIntent ?? null,
    });

    switch (result.status) {
      case "ok":
        setStatus({ kind: "success" });
        track({ name: "waitlist_submitted" });
        onSuccess?.();
        return;
      case "duplicate":
        setStatus({ kind: "duplicate" });
        track({ name: "waitlist_failed", props: { reason: "duplicate" } });
        return;
      case "invalid_email":
        setStatus({ kind: "invalid" });
        track({ name: "waitlist_failed", props: { reason: "invalid_email" } });
        return;
      case "error":
        setStatus({ kind: "error", message: result.message });
        track({ name: "waitlist_failed", props: { reason: "server_error" } });
        return;
    }
  }

  const isLocked = status.kind === "success" || status.kind === "submitting";
  const isDark = theme === "dark";

  const inputClass = isDark
    ? "flex-1 rounded-full border border-white/20 bg-white/[0.06] px-5 py-3.5 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-60"
    : "flex-1 rounded-full border border-border bg-background px-5 py-3.5 text-base placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60";

  const buttonClass = isDark
    ? "rounded-full bg-accent text-accent-foreground px-6 py-3.5 text-base font-semibold transition-transform duration-150 will-change-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    : "rounded-full bg-foreground text-background px-6 py-3.5 text-base font-semibold transition hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <label htmlFor="email" className="sr-only">
        이메일 주소
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.kind !== "idle" && status.kind !== "submitting") {
              setStatus({ kind: "idle" });
            }
          }}
          disabled={isLocked}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={isLocked || email.length === 0}
          className={buttonClass}
        >
          {status.kind === "submitting" ? "등록 중…" : ctaText}
        </button>
      </div>
      <FormFeedback status={status} theme={theme} />
    </form>
  );
}

function FormFeedback({ status, theme }: { status: Status; theme: Theme }) {
  if (status.kind === "idle" || status.kind === "submitting") return null;

  const isPositive = status.kind === "success" || status.kind === "duplicate";
  const isDark = theme === "dark";

  const tone = isPositive
    ? "text-accent"
    : isDark
      ? "text-red-300"
      : "text-red-600";

  const message =
    status.kind === "success"
      ? "등록 완료! 베타 슬롯이 열리면 이메일로 가장 먼저 알려드릴게요."
      : status.kind === "duplicate"
        ? "이미 등록된 이메일이에요. 베타 슬롯 안내를 곧 보내드릴게요."
        : status.kind === "invalid"
          ? "이메일 형식이 올바르지 않아요."
          : `등록 중 오류가 발생했어요: ${status.message}`;

  return <p className={`mt-3 text-sm ${tone}`}>{message}</p>;
}
