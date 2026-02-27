import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getPlaidClient } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";

export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const plaid = getPlaidClient();
    const response = await plaid.linkTokenCreate({
      user: { client_user_id: user.uid },
      client_name: "AI Credit Repair",
      products: [Products.Assets],
      country_codes: [CountryCode.Us],
      language: "en",
    });
    return NextResponse.json({ linkToken: response.data.link_token });
  } catch (err) {
    console.error("Plaid link token error:", err);
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
  }
}
