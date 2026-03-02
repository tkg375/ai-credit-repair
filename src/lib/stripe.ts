import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!);
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  pro: {
    name: "Credit 800",
    price: 500, // $5.00 in cents
    priceId: process.env["STRIPE_PRO_PRICE_ID"] || "",
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
      "Mail disputes via USPS ($2/letter)",
    ],
  },
} as const;
