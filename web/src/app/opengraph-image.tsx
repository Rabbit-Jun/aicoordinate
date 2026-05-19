import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "내 옷장으로, AI가 코디한다 — 베타 대기열 모집 중";

const FONT_BOLD =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf";
const FONT_REGULAR =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Regular.otf";

export default async function OpengraphImage() {
  const [fontBold, fontRegular] = await Promise.all([
    fetch(FONT_BOLD).then((r) => r.arrayBuffer()),
    fetch(FONT_REGULAR).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 96,
          background:
            "linear-gradient(135deg, #fafafa 0%, #ffffff 55%, #eef0ff 100%)",
          fontFamily: "Pretendard",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 22px",
              background: "rgba(99, 102, 241, 0.12)",
              color: "#4f46e5",
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            베타 사용자 모집 중
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 32,
              color: "#0a0a0a",
              fontSize: 108,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.045em",
            }}
          >
            <div style={{ display: "flex" }}>내 옷장으로,</div>
            <div style={{ display: "flex" }}>AI가 코디한다.</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 40,
              fontSize: 34,
              color: "#525866",
              lineHeight: 1.45,
              maxWidth: 920,
            }}
          >
            <div style={{ display: "flex" }}>
              내 옷 사진을 올리면, AI가 어울리는 코디를
            </div>
            <div style={{ display: "flex" }}>합성해서 보여줍니다.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#6b7280",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700, color: "#0a0a0a" }}>
            Coordi
          </div>
          <div style={{ display: "flex" }}>aicoordinate.vercel.app</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Pretendard",
          data: fontBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Pretendard",
          data: fontRegular,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
