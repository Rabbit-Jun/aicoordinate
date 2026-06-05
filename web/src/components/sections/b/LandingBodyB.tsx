import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionTracker } from "@/components/SectionTracker";
import type { LandingVariant } from "@/lib/analytics";
import { Footer } from "../Footer";
import { HeroB } from "./HeroB";
import { PainB, type PainCard } from "./PainB";
import { MannequinB } from "./MannequinB";
import { ComparisonB } from "./ComparisonB";
import { FinalCtaB } from "./FinalCtaB";

const CoordiDemo = dynamic(() => import("./CoordiDemo"));
const ClosetDemo = dynamic(() => import("./ClosetDemo"));

type Props = {
  variant: LandingVariant;
  heroHeadline?: ReactNode;
  heroSub?: ReactNode;
  painHeadline?: ReactNode;
  painCards?: ReadonlyArray<PainCard>;
  // /b = coordi-first, /a = closet-first
  demoOrder?: "coordi-first" | "closet-first";
};

export function LandingBodyB({
  variant,
  heroHeadline,
  heroSub,
  painHeadline,
  painCards,
  demoOrder = "coordi-first",
}: Props) {
  const closetSection = (
    <SectionTracker key="closet" section="closet_demo" variant={variant}>
      <ClosetDemo />
    </SectionTracker>
  );
  const coordiSection = (
    <SectionTracker key="coordi" section="coordi_demo" variant={variant}>
      <CoordiDemo />
    </SectionTracker>
  );
  const demos =
    demoOrder === "closet-first"
      ? [closetSection, coordiSection]
      : [coordiSection, closetSection];

  return (
    <AppShell>
      <main className="min-h-screen">
        <HeroB headline={heroHeadline} sub={heroSub} />
        <SectionTracker section="pain" variant={variant}>
          <PainB headline={painHeadline} cards={painCards} />
        </SectionTracker>
        {demos}
        <SectionTracker section="mannequin" variant={variant}>
          <MannequinB />
        </SectionTracker>
        <SectionTracker section="comparison" variant={variant}>
          <ComparisonB />
        </SectionTracker>
        <SectionTracker section="final_cta" variant={variant}>
          <FinalCtaB />
        </SectionTracker>
      </main>
      <Footer />
    </AppShell>
  );
}
