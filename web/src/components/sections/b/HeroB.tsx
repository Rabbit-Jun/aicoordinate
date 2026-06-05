import { HeroBStartButton } from "./HeroBStartButton";

export function HeroB() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-warm to-background">
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-[1.2] text-foreground">
          옷장에 옷은 많은데,
          <br />
          <span className="text-accent">상상이 안 가서 또 그 조합?</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted text-pretty max-w-xl mx-auto">
          당신의 비서가 옷장 속 옷으로,
          <br />
          매일 새롭게 코디해 드립니다.
        </p>
        <div className="mt-8 flex justify-center">
          <HeroBStartButton />
        </div>
      </div>
    </section>
  );
}
