"use client";

import { useState } from "react";
import { WaitlistForm } from "./WaitlistForm";
import { PostCTA } from "./PostCTA";
import type { Variant } from "@/lib/variant";

type Props = {
  variant: Variant;
  ctaText: string;
};

export function WaitlistFormBlock({ variant, ctaText }: Props) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <PostCTA variant={variant} />;
  }

  return (
    <WaitlistForm
      theme="dark"
      ctaText={ctaText}
      onSuccess={() => setSubmitted(true)}
    />
  );
}
