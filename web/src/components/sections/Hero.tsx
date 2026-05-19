import { HeroCTA } from "./HeroCTA";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 text-center">
        <p className="text-sm font-medium text-accent">베타 사용자 모집 중</p>
        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
          내 옷장으로,
          AI가 코디한다.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted text-pretty mx-auto max-w-2xl">
          내 옷 사진을 올리면, AI가 어울리는 조합을 골라 내 모습에 입혀
          보여줍니다.<br /> 새 옷을 사기 전에, 가진 옷부터 더 잘 입어보세요.
        </p>
        <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
          <HeroCTA targetId="waitlist">베타 대기열에 등록하기</HeroCTA>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition"
          >
            어떻게 작동하나요? →
          </a>
        </div>
        <p className="mt-6 text-xs text-muted">
          가입은 무료입니다. 베타 슬롯은 선착순으로 안내드립니다.
        </p>
      </div>
    </section>
  );
}
