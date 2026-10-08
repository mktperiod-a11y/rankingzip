import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "순위ZIP | 스포츠·영화·OTT·자동차 순위 한눈에",
  description: "KBO·UFC 랭킹, 영화 관객 수, 넷플릭스 TOP 10, 자동차 판매량까지 출처와 기준일을 밝힌 순위를 한곳에 모았습니다.",
  metadataBase: new URL("https://mktperiod-a11y.github.io/rankingzip/"),
  keywords: ["순위", "랭킹", "스포츠 순위", "영화 관객 순위", "UFC 체급별 랭킹", "자동차 판매 순위", "OTT 순위"],
  openGraph: { title: "순위ZIP", siteName: "순위ZIP", description: "세상의 흥미로운 순위를 한곳에", type: "website", locale: "ko_KR", url: "./", images: [{ url: "og.png", width: 1200, height: 630, alt: "순위ZIP - 세상의 흥미로운 순위를 한곳에" }] },
  twitter: { card: "summary_large_image", title: "순위ZIP", description: "세상의 흥미로운 순위를 한곳에", images: ["og.png"] },
  icons: {
    icon: [{ url: "favicon.ico", sizes: "48x48" }, { url: "favicon.svg", type: "image/svg+xml" }, { url: "icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="alternate" type="application/rss+xml" title="순위ZIP 업데이트" href="/feed.xml" />
        <link rel="stylesheet" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
