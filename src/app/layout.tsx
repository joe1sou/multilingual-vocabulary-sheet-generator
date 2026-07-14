import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/opendyslexic/400.css";
import "@fontsource/opendyslexic/700.css";
import "@fontsource/noto-sans-arabic/400.css";
import "@fontsource/noto-sans-arabic/700.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vocabulary Studio | Joe Ramses",
  description:
    "Turn lesson materials into structured, illustrated multilingual vocabulary sheets for primary classrooms.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}<Analytics /></body>
    </html>
  );
}
