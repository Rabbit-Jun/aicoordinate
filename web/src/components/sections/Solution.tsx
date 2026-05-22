import Image from "next/image";
import { Check } from "lucide-react";

type Cody = {
  src: string;
  alt: string;
  label: string;
};

const CODIES: readonly Cody[] = [
  {
    src: "/mockup/cody-trench.jpg",
    alt: "베이지 트렌치코트와 브릭 터틀넥, 미디엄블루 스트레이트 데님 코디",
    label: "트렌치 + 터틀넥",
  },
  {
    src: "/mockup/cody-quilted-stripe.jpg",
    alt: "카키 퀼팅 재킷과 네이비·화이트 스트라이프 폴로, 다크그레이 카고 데님 코디",
    label: "퀼팅 + 스트라이프",
  },
  {
    src: "/mockup/cody-sherpa-jogger.jpg",
    alt: "화이트 보아 플리스 집업과 빈티지 그래픽 티, 다크그레이 조거 코디",
    label: "보아 플리스 + 조거",
  },
  {
    src: "/mockup/cody-sherpa-denim.jpg",
    alt: "화이트 크롭 보아 집업과 화이트 티, 미디엄블루 스트레이트 데님 코디",
    label: "크롭 보아 + 데님",
  },
  {
    src: "/mockup/cody-vest-shirt.jpg",
    alt: "네이비 케이블 베스트와 라이트블루 셔츠, 베이지 치노 코디",
    label: "니트베스트 + 셔츠",
  },
  {
    src: "/mockup/cody-jacket-skirt.jpg",
    alt: "네이비 크롭 유틸리티 재킷과 라이트블루 셔츠, 올리브 카고 미디스커트 코디",
    label: "유틸 재킷 + 스커트",
  },
];

const SOLUTION_BULLETS = [
  "옷 사진만 올리면 AI가 어울리는 조합을 자동으로 찾아요",
  "각 조합을 마네킹이 입은 모습으로 — 핏·실루엣까지 한눈에",
  "여러 코디를 격자로 펼쳐놓고, 마음에 드는 걸 고르기만",
];

export function Solution() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <header className="max-w-2xl">

          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-balance leading-[1.2]">
            상상하지 마세요.
            <br />
            <span className="text-accent">입은 모습</span>으로 바로 보여드립니다
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted text-pretty">
            AI가 내 옷장 옷으로 어울리는 조합을 찾아, 마네킹에 입혀서 보여줘요.
            <br />
            머릿속으로 그려볼 필요 없이, 여러 코디를 격자로 한 번에 훑어보세요.
          </p>
          <ul className="mt-7 space-y-3">
            {SOLUTION_BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 mt-0.5 shrink-0">
                  <Check size={14} className="text-accent" aria-hidden />
                </span>
                <span className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </header>

        <ul
          aria-label="마네킹 코디 6장"
          className="
            mt-12 sm:mt-14
            flex md:grid md:grid-cols-3
            overflow-x-auto md:overflow-visible
            snap-x snap-mandatory md:snap-none
            gap-3 md:gap-4
            -mx-6 md:mx-0 px-6 md:px-0
            pb-2 md:pb-0
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {CODIES.map((c) => (
            <li
              key={c.src}
              className="
                relative flex-none md:flex-auto
                w-[240px] sm:w-[260px] md:w-auto
                snap-start md:snap-align-none
                rounded-2xl overflow-hidden
                border border-border bg-surface
                transition-transform duration-200 ease-out
                hover:-translate-y-1 hover:scale-[1.02]
              "
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={c.src}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 768px) 357px, 260px"
                  className="object-cover"
                />
              </div>
              <p className="px-3 py-2.5 text-xs sm:text-sm font-medium text-foreground/85">
                {c.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
