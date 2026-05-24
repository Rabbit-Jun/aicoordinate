import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Hero } from "@/components/sections/Hero";
import { LandingBody } from "@/components/sections/LandingBody";

const HEADLINE_B = (
  <>
    이 옷 입으면 어떨지,{" "}
    <span className="text-accent">상상이 안 가서</span> 또 그 옷?
  </>
);

const SUBHEADLINE_B = (
  <>
    마네킹이 입은 모습으로 보여주니까, <br />
    머릿속으로 그릴 필요 없어요.
    새 조합도 한눈에.
  </>
);

export default function PageB() {
  return (
    <>
      <AnalyticsProvider variant="b" />
      <LandingBody
        hero={<Hero headline={HEADLINE_B} subheadline={SUBHEADLINE_B} />}
      />
    </>
  );
}
