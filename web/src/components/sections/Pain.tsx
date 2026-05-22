import {
  Shirt,
  HelpCircle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

type PainPoint = {
  metric: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const PAIN_TITLE = "이런 경험, 매일 하고 있지 않나요?";

const PAIN_POINTS: readonly PainPoint[] = [
  {
    metric: "90벌",
    title: "매일 똑같은 10벌만 입어요",
    description:
      "옷장은 가득한데, 구석 옷은 있는지도 모르고 매일 같은 자리에 손이 가요.",
    icon: Shirt,
  },
  {
    metric: "상상 불가",
    title: "이거랑 저거, 어울릴지 안 그려져요",
    description:
      "머릿속으로 조합해봐도 입은 모습이 안 그려져서, 결국 늘 입던 안전한 조합으로.",
    icon: HelpCircle,
  },
  {
    metric: "비슷한 옷 N개",
    title: "또 비슷한 옷 샀어요",
    description:
      "안 어울릴까 봐 결국 무채색 기본템만. 새 옷이지만 새 룩은 아니에요.",
    icon: RefreshCw,
  },
];

export function Pain() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-center max-w-2xl mx-auto text-foreground">
          {PAIN_TITLE}
        </h2>

        <ul className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PAIN_POINTS.map((p) => (
            <PainCard key={p.title} point={p} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function PainCard({ point }: { point: PainPoint }) {
  const Icon = point.icon;
  return (
    <li className="flex flex-col rounded-2xl p-6 sm:p-7 bg-surface border border-border">
      <Icon className="text-accent" size={28} aria-hidden />
      <p className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-accent leading-none">
        {point.metric}
      </p>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {point.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {point.description}
      </p>
    </li>
  );
}
