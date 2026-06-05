// 디자인 HTML .cl-status — 자연 360px 캔버스 기준.
// FIXES.md #6: U⁺ 통신사 제거. 시간만 + 신호/배터리 아이콘.

export function StatusBar() {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "12px 18px 6px",
        fontSize: 14,
        fontWeight: 700,
        color: "#222",
      }}
    >
      <span>9:41</span>
      <span
        className="inline-flex items-center"
        style={{ gap: 6, fontSize: 12, fontWeight: 600, color: "#222" }}
      >
        <svg
          width="17"
          height="13"
          viewBox="0 0 17 13"
          fill="none"
          stroke="#222"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M1 8.5 8.5 2 16 8.5" />
          <path d="M4 11l4.5-4 4.5 4" />
        </svg>
        <svg
          width="18"
          height="13"
          viewBox="0 0 18 13"
          fill="#222"
          aria-hidden
        >
          <rect x="1" y="6" width="2.5" height="6" rx="1" />
          <rect x="5" y="4" width="2.5" height="8" rx="1" />
          <rect x="9" y="2" width="2.5" height="10" rx="1" />
          <rect x="13" y="1" width="2.5" height="11" rx="1" fill="#C7C7C7" />
        </svg>
        {/* .cl-status .batt — bg #E5484D, font 11px-700, color #fff */}
        <span
          style={{
            background: "#E5484D",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 7,
          }}
        >
          15
        </span>
      </span>
    </div>
  );
}
