import {
  Camera,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

type Step = {
  number: string;
  title: string;
  description: string;
  icons: ReadonlyArray<LucideIcon>;
};

const STEPS: ReadonlyArray<Step> = [
  {
    number: "1",
    title: "내 옷을 담아요",
    description:
      "사진을 찍거나, 온라인 쇼핑몰 구매내역에서 자동으로 가져와요.",
    icons: [Camera, ShoppingBag],
  },
  {
    number: "2",
    title: "마네킹이 코디를 입어요",
    description:
      "AI가 어울리는 조합을 찾아 마네킹에 입혀줘요. 여러 코디를 한눈에.",
    icons: [Sparkles],
  },
  {
    number: "3",
    title: "마네킹을 나에게 맞춰요",
    description:
      "체형·헤어·피부 톤을 나에 가깝게 맞춰서, 진짜 내가 입은 느낌으로 봐요.",
    icons: [SlidersHorizontal],
  },
];

export function HowItWorks() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground text-center">
          3단계로 시작해요
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted text-pretty max-w-xl mx-auto text-center">
          복잡할 것 같죠? 옷만 넣으면 나머지는 AI가 다 해요.
        </p>

        <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepCard({ step }: { step: Step }) {
  return (
    <li className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold"
      >
        {step.number}
      </div>
      <div className="mt-5 flex items-center gap-3 text-accent">
        {step.icons.map((Icon, i) => (
          <Icon key={i} size={28} strokeWidth={1.75} aria-hidden />
        ))}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {step.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {step.description}
      </p>
    </li>
  );
}
