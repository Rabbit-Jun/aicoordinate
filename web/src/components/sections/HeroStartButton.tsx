"use client";

import { track } from "@/lib/analytics";
import { useEmailModal } from "../AppShell";

export function HeroStartButton() {
  const { openModal } = useEmailModal();

  function handleClick() {
    track({ name: "hero_cta_clicked", props: { target: "free_start_modal" } });
    openModal();
  }

  return (
    <button
      type="button"
      data-track="hero_cta_clicked"
      onClick={handleClick}
      className="
        inline-flex items-center justify-center
        rounded-full bg-accent text-accent-foreground
        px-7 py-4 text-base font-semibold
        transition-transform duration-150 will-change-transform
        hover:-translate-y-0.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
        active:translate-y-0 active:scale-[0.98]
      "
    >
      무료로 시작하기
    </button>
  );
}
