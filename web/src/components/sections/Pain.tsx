import {
  Shirt,
  Clock,
  RefreshCw,
  User2,
  PackageX,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import type { Variant } from "@/lib/variant";

type PainPoint = {
  metric: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type PainContent = {
  tone: "light" | "dark";
  title: string;
  points: readonly PainPoint[];
};

const PAIN_CONTENT: Record<Variant, PainContent> = {
  A: {
    tone: "light",
    title: "이런 경험, 매일 하고 있지 않나요?",
    points: [
      {
        metric: "90벌",
        title: "매일 똑같은 10벌만 입어요",
        description:
          "옷장은 가득한데, 구석 옷은 있는지도 모르고 매일 같은 자리에 손이 가요.",
        icon: Shirt,
      },
      {
        metric: "30분",
        title: "데이트 전 옷장 앞에서 한참 헤매요",
        description:
          "입었다 벗었다 30분, 결국 어제 입던 옷. 특별한 날인데 또 똑같이 입어요.",
        icon: Clock,
      },
      {
        metric: "비슷한 옷 N개",
        title: "또 비슷한 옷 샀어요",
        description:
          "안 어울릴까 봐 결국 무채색 기본템만. 새 옷이지만 새 룩은 아니에요.",
        icon: RefreshCw,
      },
    ],
  },
  B: {
    tone: "dark",
    title: "온라인으로 옷 사면서 한 번쯤 겪죠?",
    points: [
      {
        metric: "키 ±10cm",
        title: "모델은 모델, 내 체형은 다르더라",
        description:
          "모델 사진 핏만 보고 샀더니, 키 차이로 기장 짧고 어깨 핏 안 살고.",
        icon: User2,
      },
      {
        metric: "구석 처박힘",
        title: "안 입는 옷이 쌓여요",
        description:
          "반품도 귀찮아서 옷장 구석으로. 산 돈도 입을 옷도 둘 다 없어요.",
        icon: PackageX,
      },
      {
        metric: "사진 vs 실물",
        title: "사진하고 다른 옷이 와요",
        description:
          "조명·보정으로 색감도 다르고, 만져보지 못해 소재 두께감도 모르고.",
        icon: EyeOff,
      },
    ],
  },
};

export function Pain({ variant }: { variant: Variant }) {
  const content = PAIN_CONTENT[variant];
  const isDark = content.tone === "dark";

  return (
    <section
      className={
        isDark
          ? "bg-dark-accent text-white"
          : "bg-background text-foreground"
      }
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <h2
          className={`text-3xl sm:text-4xl font-bold tracking-tight text-balance text-center max-w-2xl mx-auto ${
            isDark ? "text-white" : "text-foreground"
          }`}
        >
          {content.title}
        </h2>

        <ul className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {content.points.map((p) => (
            <PainCard key={p.title} point={p} dark={isDark} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function PainCard({ point, dark }: { point: PainPoint; dark: boolean }) {
  const Icon = point.icon;
  return (
    <li
      className={`flex flex-col rounded-2xl p-6 sm:p-7 ${
        dark
          ? "bg-white/[0.03] border border-white/10"
          : "bg-surface border border-border"
      }`}
    >
      <Icon className="text-accent" size={28} aria-hidden />
      <p className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-accent leading-none">
        {point.metric}
      </p>
      <h3
        className={`mt-4 text-lg font-semibold ${
          dark ? "text-white" : "text-foreground"
        }`}
      >
        {point.title}
      </h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          dark ? "text-white/70" : "text-muted"
        }`}
      >
        {point.description}
      </p>
    </li>
  );
}
