import type { Metadata } from "next";
import { Geist, Geist_Mono, Nanum_Brush_Script } from "next/font/google";
import "./globals.css";
import NatureBg from "@/app/components/NatureBg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nanumBrush = Nanum_Brush_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brush",
});

export const metadata: Metadata = {
  title: "곁 — 무너진 날에도, 다시 내 곁으로",
  description: "무너진 날에도, 다시 내 곁으로 돌아오는 기록",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${nanumBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NatureBg />
        {children}
      </body>
    </html>
  );
}
