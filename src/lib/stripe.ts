import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "3 dispute letters per month",
      "Basic credit tools",
      "1 credit report upload",
      "Education modules",
    ],
  },
  pro: {
    name: "Pro",
    price: 1999, // $19.99 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Unlimited dispute letters",
      "Escalation letters (Round 2/3)",
      "CFPB complaint generator",
      "Credit score simulator",
      "Document vault",
      "Debt payoff optimizer",
      "Card recommendations",
      "Priority AI analysis",
      "Score tracking & charts",
      "Smart notifications",
    ],
  },
} as const;
