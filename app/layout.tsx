import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xcelerate AI — Your AI Company Starts With One Idea",
  description:
    "From idea to launch, your AI team works alongside you. Xcelerate AI turns your idea into a complete business: brand, product, growth, and operations.",
  keywords: ["AI startup", "AI company", "business builder", "startup OS"],
  openGraph: {
    title: "Xcelerate AI",
    description: "One idea. One AI company. Everything you need to launch.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}

