import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/sections/Hero";
import { Pain } from "@/components/sections/Pain";
import { Solution } from "@/components/sections/Solution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Comparison } from "@/components/sections/Comparison";
import { Pricing } from "@/components/sections/Pricing";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <AppShell>
      <main className="min-h-screen">
        <Hero />
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
