import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Credit Education",
  description:
    "Learn how to build, protect, and repair your credit with 12 in-depth modules covering FCRA rights, dispute strategies, debt management, and identity protection.",
  openGraph: {
    title: "Credit Education — Credit 800",
    description:
      "Master credit repair with AI-guided education modules: dispute strategies, FCRA rights, debt payoff, and identity protection.",
    url: "https://credit-800.com/education",
  },
  twitter: {
    title: "Credit Education — Credit 800",
    description:
      "Master credit repair with AI-guided education modules: dispute strategies, FCRA rights, debt payoff, and identity protection.",
  },
};

export default function EducationLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
