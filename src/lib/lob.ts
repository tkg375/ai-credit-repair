const LOB_BASE = "https://api.lob.com/v1";

function getApiKey(): string {
  const key = process.env.LOB_API_KEY;
  if (!key) {
    throw new Error("LOB_API_KEY environment variable is not configured");
  }
  return key;
}

function getAuthHeader(): string {
  return "Basic " + btoa(`${getApiKey()}:`);
}

export interface LobAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

export interface LobTrackingEvent {
  id: string;
  type: string;
  name: string;
  date_created: string;
  location?: string;
}

export interface LobLetter {
  id: string;
  description?: string;
  url?: string;
  carrier: string;
  tracking_number?: string;
  tracking_events: LobTrackingEvent[];
  expected_delivery_date?: string;
  send_date?: string;
  date_created: string;
}

/** Send a letter via Lob. Returns the created letter object. */
export async function sendLetter(options: {
  to: LobAddress;
  from: LobAddress;
  html: string;
  description?: string;
}): Promise<LobLetter> {
  const res = await fetch(`${LOB_BASE}/letters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      to: options.to,
      from: options.from,
      file: options.html,
      color: false,
      double_sided: false,
      address_placement: "insert_blank_page",
      mail_type: "usps_first_class",
      use_type: "operational",
      description: options.description || "Credit dispute letter",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Lob API error (${res.status}): ${msg}`);
  }

  return data as LobLetter;
}

/** Retrieve a letter by ID to check status and tracking. */
export async function getLetter(letterId: string): Promise<LobLetter> {
  const res = await fetch(`${LOB_BASE}/letters/${letterId}`, {
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Lob API error (${res.status}): ${msg}`);
  }

  return data as LobLetter;
}

/** Convert plain text letter content to simple HTML for Lob. */
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
  @page { size: letter; margin: 1in; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    line-height: 1.5;
    color: #000;
    margin: 0;
    padding: 0;
  }
</style>
</head>
<body>
<div style="white-space: pre-wrap; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.5;">${escaped}</div>
</body>
</html>`;
}
