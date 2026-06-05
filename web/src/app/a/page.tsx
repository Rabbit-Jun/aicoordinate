import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { LandingBodyB } from "@/components/sections/b/LandingBodyB";
import {
  HEADLINE_A,
  SUB_A,
  PAIN_HEADLINE_A,
  PAIN_CARDS_A,
} from "./copy";

export default function PageA() {
  return (
    <>
      <AnalyticsProvider variant="a" />
      <LandingBodyB
        variant="a"
        heroHeadline={HEADLINE_A}
        heroSub={SUB_A}
        painHeadline={PAIN_HEADLINE_A}
        painCards={PAIN_CARDS_A}
        demoOrder="closet-first"
      />
    </>
  );
}
