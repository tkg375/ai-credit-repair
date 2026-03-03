import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Credit Score Simulator",
  description:
    "See exactly how paying off debt, disputing errors, or opening new accounts will affect your credit score before you act.",
  openGraph: {
    title: "Credit Score Simulator — Credit 800",
    description:
      "Simulate the credit score impact of paying off debt, removing collections, or disputing errors — before you make a move.",
    url: "https://credit-800.com/simulator",
  },
  twitter: {
    title: "Credit Score Simulator — Credit 800",
    description:
      "Simulate the credit score impact of paying off debt, removing collections, or disputing errors — before you make a move.",
  },
};

export default function SimulatorLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
