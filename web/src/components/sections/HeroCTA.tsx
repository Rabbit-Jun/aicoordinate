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
      className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-7 py-4 text-base font-semibold transition hover:opacity-90 active:opacity-80"
    >
      {children}
    </button>
  );
}
