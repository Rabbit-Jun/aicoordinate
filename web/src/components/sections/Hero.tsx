import Image from "next/image";
import { HeroCTA } from "./HeroCTA";

type Item = { src: string; alt: string };

const wardrobeItems: Item[] = [
  { src: "/mockup/jaket.png", alt: "자켓" },
  { src: "/mockup/navy-blouse.png", alt: "네이비 블라우스" },
  { src: "/mockup/navy-trousers.png", alt: "네이비 트라우저" },
  { src: "/mockup/tweed-jaket.png", alt: "트위드 자켓" },
  { src: "/mockup/jeen.png", alt: "진" },
  { src: "/mockup/skarf.png", alt: "스카프" },
  { src: "/mockup/tee.png", alt: "티셔츠" },
];

const aiOutfitItems: Item[] = [
  { src: "/mockup/jaket.png", alt: "자켓" },
  { src: "/mockup/tee.png", alt: "티셔츠" },
  { src: "/mockup/jeen.png", alt: "진" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium text-accent">
              베타 사용자 모집 중
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              내 옷장으로,
              <br />
              AI가 코디한다.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted text-pretty max-w-xl">
              내 옷 사진을 올리면, AI가 어울리는 조합을 골라 내 모습에 입혀
              보여줍니다. 새 옷을 사기 전에, 가진 옷부터 더 잘 입어보세요.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
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

          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
      <PreviewItem caption="내 옷장의 옷을 사진으로 간단하게 저장해 주세요.">
        <WardrobeTile />
      </PreviewItem>
      <PreviewItem caption="AI가 옷장의 옷을 조합해, 가장 어울리는 코디를 추천해 줘요.">
        <AiOutfitTile />
      </PreviewItem>
      <PreviewItem caption="전신 사진을 올려주시면, AI가 미리 옷을 입은 모습을 보여줘요.">
        <SingleImageTile
          src="/mockup/model-before.jpg"
          alt="합성 전 사용자 사진"
          label="내 사진"
        />
      </PreviewItem>
      <PreviewItem caption="옷을 갈아입는 시간을 아끼고, 원하는 옷을 빠르게.">
        <SingleImageTile
          src="/mockup/model-after.png"
          alt="AI 합성 결과"
          label="합성 결과"
          accent
        />
      </PreviewItem>
    </div>
  );
}

function PreviewItem({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {children}
      <p className="text-xs sm:text-sm text-muted leading-relaxed px-1 text-pretty">
        {caption}
      </p>
    </div>
  );
}

type TileShellProps = {
  label: string;
  accent?: boolean;
  children: React.ReactNode;
};

function TileShell({ label, accent, children }: TileShellProps) {
  const palette = accent
    ? "bg-gradient-to-br from-accent/15 to-accent/5 border-accent/20"
    : "bg-surface border-border";
  return (
    <div
      className={`aspect-[3/4] rounded-2xl border ${palette} p-3 flex flex-col gap-2 overflow-hidden`}
    >
      <span className="text-xs font-medium text-foreground/70 px-1">
        {label}
      </span>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

function WardrobeTile() {
  return (
    <TileShell label="내 옷장">
      <div className="grid grid-cols-2 grid-rows-4 gap-1.5 h-full">
        {wardrobeItems.map((item) => (
          <ItemCell key={item.src} item={item} sizes="80px" />
        ))}
        <div className="rounded-md bg-foreground/5" aria-hidden />
      </div>
    </TileShell>
  );
}

function AiOutfitTile() {
  return (
    <TileShell label="AI 코디" accent>
      <div className="flex flex-col gap-1.5 h-full">
        {aiOutfitItems.map((item) => (
          <ItemCell key={item.src} item={item} sizes="180px" />
        ))}
      </div>
    </TileShell>
  );
}

function ItemCell({ item, sizes }: { item: Item; sizes: string }) {
  return (
    <div className="relative bg-white rounded-md overflow-hidden flex-1">
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        className="object-contain p-1.5"
      />
    </div>
  );
}

type SingleImageTileProps = {
  src: string;
  alt: string;
  label: string;
  accent?: boolean;
};

function SingleImageTile({ src, alt, label, accent }: SingleImageTileProps) {
  return (
    <TileShell label={label} accent={accent}>
      <div className="relative h-full rounded-md overflow-hidden bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 280px, 45vw"
          className="object-cover"
        />
      </div>
    </TileShell>
  );
}
