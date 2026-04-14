import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Analyze Creditor Letter",
  description:
    "Upload a letter from a creditor or debt collector. Credit 800 identifies your legal rights, breaks down their claims, and drafts a response letter for you.",
  openGraph: {
    title: "Analyze Creditor Letter — Credit 800",
    description:
      "Instant creditor letter analysis: understand your rights, decode debt collector tactics, and get a draft response in seconds.",
    url: "https://credit-800.com/analyze-letter",
  },
  twitter: {
    title: "Analyze Creditor Letter — Credit 800",
    description:
      "Instant creditor letter analysis: understand your rights, decode debt collector tactics, and get a draft response in seconds.",
  },
};

export default function AnalyzeLetterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
