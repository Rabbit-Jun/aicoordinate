import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Hero } from "@/components/sections/Hero";
import { LandingBody } from "@/components/sections/LandingBody";

export default function HomePage() {
  return (
    <>
      <AnalyticsProvider variant="default" />
      <LandingBody hero={<Hero />} />
    </>
  );
}
