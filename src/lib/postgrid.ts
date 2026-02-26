const POSTGRID_BASE = "https://api.postgrid.com/print-mail/v1";

function getApiKey(): string {
  const key = process.env.POSTGRID_API_KEY;
  if (!key) {
    throw new Error("POSTGRID_API_KEY environment variable is not configured");
  }
  return key;
}

export interface PostGridAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

export interface PostGridTrackingEvent {
  id: string;
  type: string;
  name: string;
  date_created: string;
  location?: string;
}

export interface PostGridLetter {
  id: string;
  description?: string;
  url?: string;
  status: string;
  tracking_number?: string;
  tracking_events: PostGridTrackingEvent[];
  expected_delivery_date?: string;
  send_date?: string;
  date_created: string;
}

/** Convert our internal address shape to PostGrid's API format. */
function toPostGridAddress(addr: PostGridAddress): Record<string, unknown> {
  const parts = addr.name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") || "",
    addressLine1: addr.address_line1,
    addressLine2: addr.address_line2 || "",
    city: addr.address_city,
    provinceOrState: addr.address_state,
    postalOrZip: addr.address_zip,
    countryCode: "US",
  };
}

/** Normalize a PostGrid API letter response to our internal shape. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeLetter(data: any): PostGridLetter {
  const trackingEvents: PostGridTrackingEvent[] = (data.trackingEvents ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => ({
      id: e.id ?? "",
      type: e.type ?? "",
      name: e.name ?? "",
      date_created: e.datetime ?? e.date_created ?? "",
      location: e.location,
    })
  );

  return {
    id: data.id,
    description: data.description,
    url: data.url,
    status: data.status ?? "ready",
    tracking_number: undefined,
    tracking_events: trackingEvents,
    expected_delivery_date: data.expectedDeliveryDate ?? data.expected_delivery_date,
    send_date: data.sendDate ?? data.send_date,
    date_created: data.createdAt ?? data.date_created ?? "",
  };
}

/** Send a letter via PostGrid. Returns the created letter object. */
export async function sendLetter(options: {
  to: PostGridAddress;
  from: PostGridAddress;
  html: string;
  description?: string;
}): Promise<PostGridLetter> {
  const res = await fetch(`${POSTGRID_BASE}/letters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
    },
    body: JSON.stringify({
      to: toPostGridAddress(options.to),
      from: toPostGridAddress(options.from),
      html: options.html,
      description: options.description || "Credit dispute letter",
      color: false,
      doubleSided: false,
      mailingClass: "first_class",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || JSON.stringify(data);
    throw new Error(`PostGrid API error (${res.status}): ${msg}`);
  }

  return normalizeLetter(data);
}

/** Retrieve a letter by ID to check status and tracking. */
export async function getLetter(letterId: string): Promise<PostGridLetter> {
  const res = await fetch(`${POSTGRID_BASE}/letters/${letterId}`, {
    headers: {
      "x-api-key": getApiKey(),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || JSON.stringify(data);
    throw new Error(`PostGrid API error (${res.status}): ${msg}`);
  }

  return normalizeLetter(data);
}

/** Convert plain text letter content to simple HTML for PostGrid. */
export function letterToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: letter; margin: 0.75in; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5px;
    line-height: 1.4;
    color: #000;
    margin: 0;
    padding: 0;
  }
</style>
</head>
<body>
<div style="white-space: pre-wrap; font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; line-height: 1.4;">${escaped}</div>
</body>
</html>`;
}
