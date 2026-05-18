"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { joinWaitlist } from "@/lib/waitlist";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "duplicate" }
  | { kind: "invalid" }
  | { kind: "error"; message: string };

function readUtmSource(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("utm_source");
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    setStatus({ kind: "submitting" });
    track({ name: "waitlist_submit_attempt" });

    const result = await joinWaitlist({
      email,
      source: readUtmSource(),
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });

    switch (result.status) {
      case "ok":
        setStatus({ kind: "success" });
        track({ name: "waitlist_submitted" });
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
          className="flex-1 rounded-full border border-border bg-background px-5 py-3.5 text-base placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLocked || email.length === 0}
          className="rounded-full bg-foreground text-background px-6 py-3.5 text-base font-semibold transition hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status.kind === "submitting" ? "등록 중…" : "대기열 등록"}
        </button>
      </div>
      <FormFeedback status={status} />
    </form>
  );
}

function FormFeedback({ status }: { status: Status }) {
  if (status.kind === "idle" || status.kind === "submitting") return null;

  const tone =
    status.kind === "success" || status.kind === "duplicate"
      ? "text-accent"
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
