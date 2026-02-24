import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
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
  title: {
    default: "Credit 800 — AI-Powered Credit Repair",
    template: "%s | Credit 800",
  },
  description:
    "Credit 800 uses AI to analyze your credit report, automatically generate FCRA-compliant dispute letters, and build a personalized action plan to reach an 800 credit score.",
  keywords: [
    "credit repair",
    "AI credit repair",
    "dispute credit report",
    "improve credit score",
    "FCRA dispute letters",
    "credit bureau dispute",
    "remove collections",
    "credit score 800",
    "fix bad credit",
    "credit repair software",
    "automated credit repair",
    "dispute collections",
    "credit report errors",
    "raise credit score fast",
  ],
  authors: [{ name: "Credit 800", url: "https://credit-800.com" }],
  creator: "Credit 800",
  publisher: "Credit 800",
  metadataBase: new URL("https://credit-800.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://credit-800.com",
    siteName: "Credit 800",
    title: "Credit 800 — AI-Powered Credit Repair",
    description:
      "Analyze your credit report, dispute inaccuracies automatically, and get a personalized plan to reach an 800 credit score with AI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Credit 800 — AI-Powered Credit Repair",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Credit 800 — AI-Powered Credit Repair",
    description:
      "AI-powered credit repair: dispute letters, score analysis, and a personalized plan to reach 800.",
    images: ["/og-image.png"],
    creator: "@credit800",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Credit 800",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#14b8a6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
