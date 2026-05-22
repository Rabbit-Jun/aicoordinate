"use client";

import { Smartphone } from "lucide-react";
import { track } from "@/lib/analytics";
import { useEmailModal } from "../AppShell";

type Platform = "ios" | "android";

const BADGES: ReadonlyArray<{
  platform: Platform;
  storeName: string;
}> = [
  { platform: "ios", storeName: "App Store" },
  { platform: "android", storeName: "Google Play" },
];

export function AppBadges() {
  const { openModal } = useEmailModal();

  function handleClick(platform: Platform) {
    track({ name: "app_badge_clicked", props: { platform } });
    openModal(platform);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
      {BADGES.map((b) => (
        <button
          key={b.platform}
          type="button"
          data-track="app_badge_clicked"
          onClick={() => handleClick(b.platform)}
          aria-label={`${b.storeName}에서 출시 알림 받기`}
          className="
            inline-flex items-center gap-3
            rounded-2xl bg-foreground text-background
            px-5 py-3 min-w-[180px]
            transition-transform duration-150 will-change-transform
            hover:-translate-y-0.5 hover:opacity-95
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
            active:translate-y-0 active:scale-[0.98]
          "
        >
          <Smartphone size={26} strokeWidth={1.5} aria-hidden />
          <span className="text-sm sm:text-base font-semibold">
            {b.storeName}
          </span>
        </button>
      ))}
    </div>
  );
}
