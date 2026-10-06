import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "순위ZIP | 세상의 흥미로운 순위를 한곳에",
  description: "스포츠, 영화, 드라마, 자동차, OTT 등 사람들이 궁금해하는 순위를 보기 쉽게 모았습니다.",
  metadataBase: new URL("https://rankingzip.pidinfo.chatgpt.site"),
  keywords: ["순위", "랭킹", "스포츠 순위", "영화 관객 순위", "UFC 체급별 랭킹", "자동차 판매 순위", "OTT 순위"],
  openGraph: { title: "순위ZIP", description: "세상의 흥미로운 순위를 한곳에", type: "website", locale: "ko_KR", url: "https://rankingzip.pidinfo.chatgpt.site", images: [{ url: "/og.png", width: 1200, height: 630, alt: "순위ZIP - 세상의 흥미로운 순위를 한곳에" }] },
  twitter: { card: "summary_large_image", title: "순위ZIP", description: "세상의 흥미로운 순위를 한곳에", images: ["/og.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
