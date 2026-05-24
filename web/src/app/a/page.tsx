import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Hero } from "@/components/sections/Hero";
import { LandingBody } from "@/components/sections/LandingBody";

const HEADLINE_A = (
  <>
    내 옷장에 <span className="text-accent">100벌</span>, 그런데 안 입는 옷이
    절반이죠?
  </>
);

const SUBHEADLINE_A =
  "AI가 잊고 있던 옷까지 꺼내, 새로운 조합을 찾아드려요.\n" +
  "새 옷 사지 않고도 매일 새 룩.";

export default function PageA() {
  return (
    <>
      <AnalyticsProvider variant="a" />
      <LandingBody
        hero={<Hero headline={HEADLINE_A} subheadline={SUBHEADLINE_A} />}
      />
    </>
  );
}
