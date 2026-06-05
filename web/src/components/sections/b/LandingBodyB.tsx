import dynamic from "next/dynamic";
import { AppShell } from "@/components/AppShell";
import { SectionTracker } from "@/components/SectionTracker";
import { Footer } from "../Footer";
import { HeroB } from "./HeroB";
import { PainB } from "./PainB";
import { MannequinB } from "./MannequinB";
import { ComparisonB } from "./ComparisonB";
import { FinalCtaB } from "./FinalCtaB";

const CoordiDemo = dynamic(() => import("./CoordiDemo"));
const ClosetDemo = dynamic(() => import("./ClosetDemo"));

export function LandingBodyB() {
  return (
    <AppShell>
      <main className="min-h-screen">
        <HeroB />
        <SectionTracker section="pain" variant="b">
          <PainB />
        </SectionTracker>
        <SectionTracker section="coordi_demo" variant="b">
          <CoordiDemo />
        </SectionTracker>
        <SectionTracker section="closet_demo" variant="b">
          <ClosetDemo />
        </SectionTracker>
        <SectionTracker section="mannequin" variant="b">
          <MannequinB />
        </SectionTracker>
        <SectionTracker section="comparison" variant="b">
          <ComparisonB />
        </SectionTracker>
        <SectionTracker section="final_cta" variant="b">
          <FinalCtaB />
        </SectionTracker>
      </main>
      <Footer />
    </AppShell>
  );
}
