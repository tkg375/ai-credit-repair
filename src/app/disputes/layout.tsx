import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Credit Disputes",
  description:
    "AI-generated FCRA-compliant dispute letters for Equifax, Experian, and TransUnion. Track dispute status and manage your entire credit repair campaign.",
  openGraph: {
    title: "Credit Disputes — Credit 800",
    description:
      "Automate credit bureau disputes with AI. Generate FCRA-compliant letters for Equifax, Experian, and TransUnion and track every dispute in one place.",
    url: "https://credit-800.com/disputes",
  },
  twitter: {
    title: "Credit Disputes — Credit 800",
    description:
      "Automate credit bureau disputes with AI. Generate FCRA-compliant letters for Equifax, Experian, and TransUnion and track every dispute in one place.",
  },
};

export default function DisputesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
