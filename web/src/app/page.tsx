import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Waitlist } from "@/components/sections/Waitlist";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen">
        <Hero />
        <HowItWorks />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
