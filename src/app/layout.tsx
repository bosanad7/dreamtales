import type { Metadata, Viewport } from "next";
import "./globals.css";
import StarBackground from "@/components/layout/StarBackground";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "DreamTales – AI Bedtime Stories",
  description:
    "Create personalized AI-powered bedtime stories for your child, with illustrations, voice narration, and soothing music.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0616",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full relative" style={{ background: "linear-gradient(135deg, #0a0616 0%, #0f0826 50%, #090515 100%)" }}>
        <StarBackground />
        <Header />
        <main className="relative z-10 pt-20 pb-10 px-4 min-h-dvh">
          <div className="max-w-md mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
