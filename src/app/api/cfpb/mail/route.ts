import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { sendLetter, letterToHtml, type PostGridAddress } from "@/lib/postgrid";

// CFPB mailing address
const CFPB_ADDRESS: PostGridAddress = {
  name: "Consumer Financial Protection Bureau",
  address_line1: "PO Box 27170",
  address_line2: "",
  address_city: "Washington",
  address_state: "DC",
  address_zip: "20038",
};

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.POSTGRID_API_KEY) {
    return NextResponse.json({ error: "Mail service is not configured." }, { status: 503 });
  }

  const { complaintText, fromAddress } = await req.json();

  if (!complaintText) return NextResponse.json({ error: "complaintText is required" }, { status: 400 });
  if (!fromAddress?.name || !fromAddress?.address_line1 || !fromAddress?.address_city || !fromAddress?.address_state || !fromAddress?.address_zip) {
    return NextResponse.json({ error: "fromAddress is required" }, { status: 400 });
  }

  try {
    const html = letterToHtml(complaintText);
    const letter = await sendLetter({
      to: CFPB_ADDRESS,
      from: {
        name: fromAddress.name,
        address_line1: fromAddress.address_line1,
        address_line2: fromAddress.address_line2 || "",
        address_city: fromAddress.address_city,
        address_state: fromAddress.address_state,
        address_zip: fromAddress.address_zip,
      },
      html,
      description: "CFPB Complaint Letter",
    });

    return NextResponse.json({
      success: true,
      mailJobId: letter.id,
      expectedDelivery: letter.expected_delivery_date,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("CFPB mail error:", msg);
    return NextResponse.json({ error: "Failed to mail complaint", details: msg }, { status: 500 });
  }
}
