import type { Metadata } from "next";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import "./globals.css";

const siteTitle = "내 옷장으로 만드는 AI 코디";
const siteDescription =
  "내 옷 사진을 올리면, AI가 어울리는 조합을 골라 내 모습에 합성해서 보여줍니다.";
const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "내 옷장으로, AI가 코디한다",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aicoordinate.vercel.app"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "ko_KR",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}
