import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dispute Letter Templates",
  description:
    "Professional FCRA and FDCPA dispute letter templates: bureau disputes, goodwill letters, pay-for-delete, debt validation, cease & desist, and inquiry removal.",
  openGraph: {
    title: "Dispute Letter Templates — Credit 800",
    description:
      "Generate professional credit dispute letters in seconds. FCRA & FDCPA compliant templates for bureau disputes, debt validation, goodwill requests, and more.",
    url: "https://credit-800.com/templates",
  },
  twitter: {
    title: "Dispute Letter Templates — Credit 800",
    description:
      "Generate professional credit dispute letters in seconds. FCRA & FDCPA compliant templates for bureau disputes, debt validation, goodwill requests, and more.",
  },
};

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
