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
  title: "다이어트 어디가?",
  description: "4가지 질문으로 나에게 딱 맞는 다이어트 방법과 업체를 추천해드립니다. PT, 비만클리닉, 한의원, 관리실, 식단배송, 온라인코칭 비교.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: "var(--warm-white)" }}>
        {children}
        <footer className="text-center py-6 text-xs text-gray-400 space-y-1">
          <p>다이어트 어디가? — 나에게 맞는 다이어트 업체 추천 서비스</p>
          <p>업체 정보는 참고용이며, 실제 상담 후 결정하시기 바랍니다</p>
        </footer>
      </body>
    </html>
  );
}
