import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Pain } from "./Pain";
import { Solution } from "./Solution";
import { HowItWorks } from "./HowItWorks";
import { Comparison } from "./Comparison";
import { Pricing } from "./Pricing";
import { Footer } from "./Footer";

export function LandingBody({ hero }: { hero: ReactNode }) {
  return (
    <AppShell>
      <main className="min-h-screen">
        {hero}
        <Pain />
        <Solution />
        <HowItWorks />
        <Comparison />
        <Pricing />
      </main>
      <Footer />
    </AppShell>
  );
}
