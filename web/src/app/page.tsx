import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { LandingBodyB } from "@/components/sections/b/LandingBodyB";

export default function HomePage() {
  return (
    <>
      <AnalyticsProvider variant="default" />
      <LandingBodyB variant="default" demoOrder="coordi-first" />
    </>
  );
}
