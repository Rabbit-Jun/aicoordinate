"use client";

import { track } from "@/lib/analytics";

type Props = {
  targetId: string;
  children: React.ReactNode;
};

export function HeroCTA({ targetId, children }: Props) {
  function handleClick() {
    track({ name: "hero_cta_clicked", props: { target: targetId } });
    const el = document.getElementById(targetId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground px-7 py-4 text-base font-semibold shadow-sm transition-transform duration-150 will-change-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}
