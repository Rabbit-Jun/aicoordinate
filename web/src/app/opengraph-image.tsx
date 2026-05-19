import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "내 옷장으로, AI가 코디한다 — 베타 대기열 모집 중";

const FONT_BOLD =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf";
const FONT_REGULAR =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Regular.otf";

// Edge runtime에서 정적 자산은 절대 URL이 필요하다.
// Vercel은 VERCEL_URL을 자동 주입(preview/production 다름), 로컬은 localhost.
function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function OpengraphImage() {
  const baseUrl = getBaseUrl();
  const logoUrl = `${baseUrl}/coordinate-logo.png`;

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
          padding: 80,
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
            paddingRight: 40,
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
              marginTop: 28,
              color: "#0a0a0a",
              fontSize: 92,
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
              marginTop: 32,
              fontSize: 28,
              color: "#525866",
              lineHeight: 1.45,
            }}
          >
            <div style={{ display: "flex" }}>내 옷 사진을 올리면,</div>
            <div style={{ display: "flex" }}>
              AI가 어울리는 코디를 합성해서 보여줍니다.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 22,
              color: "#6b7280",
            }}
          >
            aicoordinate.vercel.app
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 360,
          }}
        >
          <img
            src={logoUrl}
            alt="Coordi"
            width={320}
            height={412}
            style={{ objectFit: "contain" }}
          />
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
