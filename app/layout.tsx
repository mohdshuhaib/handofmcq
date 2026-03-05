import type { Metadata, Viewport } from "next";
import { Inter, Anek_Malayalam } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anekMalayalam = Anek_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-anek",
  display: "swap",
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
  metadataBase: new URL("https://handofmcq.vercel.app"),
  title: "Hand of MCQ | Modern Proctored Testing",
  description: "Create, manage, and proctor multiple-choice tests securely. Advanced analytics and anti-cheat technology.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hand of MCQ",
  },
  openGraph: {
    title: "Hand of MCQ | Modern Proctored Testing",
    description: "Create, manage, and proctor multiple-choice tests securely. Advanced analytics and anti-cheat technology.",
    url: "https://handofmcq.vercel.app",
    siteName: "Hand of MCQ",
    images: [
      {
        url: "/web-app-manifest-512x512.png", // Using the icon we know is in your public folder
        width: 512,
        height: 512,
        alt: "Hand of MCQ Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  applicationName: "MCQ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${anekMalayalam.variable} font-inter antialiased bg-slate-950 text-slate-50 selection:bg-blue-500/30 selection:text-blue-200 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}