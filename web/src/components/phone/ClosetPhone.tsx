"use client";

import { CoordiPhone, type CoordiCard } from "./CoordiPhone";

// 디자인 HTML .closet-phone — 옷장 전용 props (탭/picked/zoom 캡션/cl-add) 주입.
// title "나의 옷장", 탭 전체/상의/하의/아우터/신발·벨트.
// cl-add: bg #FFFFFF, icon #181717 (디자인 HTML inline override 원문).

const CLOSET_TABS = ["전체", "상의", "하의", "아우터", "신발·벨트"] as const;

type Props = {
  cards: ReadonlyArray<CoordiCard>;
  heroName: string;
};

export function ClosetPhone({ cards, heroName }: Props) {
  const heroIndex = Math.max(
    0,
    cards.findIndex((c) => c.name === heroName),
  );
  return (
    <CoordiPhone
      title="나의 옷장"
      cards={cards}
      heroIndex={heroIndex}
      tabs={CLOSET_TABS}
      pickedLabel="선택한 옷"
      zoomCaption="내 옷장 속 아이템"
      addButton={{ background: "#FFFFFF", color: "#181717" }}
    />
  );
}
