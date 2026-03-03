import type { Metadata, Viewport } from "next";
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

// NEW: Viewport export for PWA mobile status bars
export const viewport: Viewport = {
  themeColor: "#0f172a", // Dark slate color for a premium feel
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// NEW: Added PWA manifest and Apple Web App meta tags
export const metadata: Metadata = {
  title: "Hand of MCQ | Modern Proctored Testing",
  description: "Create, manage, and proctor multiple-choice tests securely. Advanced analytics and anti-cheat technology.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hand of MCQ",
  },
  applicationName: "Hand of MCQ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-slate-950 text-slate-50 selection:bg-blue-500/30 selection:text-blue-200 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}