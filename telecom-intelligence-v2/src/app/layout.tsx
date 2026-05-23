import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TelecomIntelligence | WORLD TELECOM",
  description: "منصة TelecomIntelligence الرقمية لإدارة أعمال WORLD TELECOM - تونس",
  keywords: ["WORLD TELECOM", "TelecomIntelligence", "اتصالات", "تونس", "ذكاء اصطناعي"],
  authors: [{ name: "WORLD TELECOM - Mehrez ALOUI" }],
  icons: { icon: "/wt-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <SessionProviderWrapper>
          {children}
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}