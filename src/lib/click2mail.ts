import { XMLParser } from "fast-xml-parser";

const STAGING_BASE = "https://stage-rest.click2mail.com/molpro";
const PRODUCTION_BASE = "https://rest.click2mail.com/molpro";

function getBaseUrl(): string {
  return process.env.CLICK2MAIL_STAGING === "true" ? STAGING_BASE : PRODUCTION_BASE;
}

function getAuthHeader(): string {
  const username = process.env.CLICK2MAIL_USERNAME;
  const password = process.env.CLICK2MAIL_PASSWORD;
  if (!username || !password) {
    throw new Error("Click2Mail credentials not configured (CLICK2MAIL_USERNAME, CLICK2MAIL_PASSWORD)");
  }
  return "Basic " + btoa(`${username}:${password}`);
}

const xmlParser = new XMLParser({ ignoreAttributes: false });

function parseXml(xml: string): Record<string, unknown> {
  return xmlParser.parse(xml);
}

export interface Click2MailAddress {
  firstName?: string;
  lastName?: string;
  organization: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface Click2MailJobStatus {
  id: string;
  status: string;
  description?: string;
}

export interface Click2MailTracking {
  barcode?: string;
  status?: string;
  statusDate?: string;
  statusLocation?: string;
}

/** Upload a PDF document to Click2Mail. Returns the document ID. */
export async function uploadDocument(pdfBuffer: Uint8Array, documentName: string): Promise<string> {
  const formData = new FormData();
  formData.append("documentName", documentName);
  formData.append("documentFormat", "pdf");
  formData.append("documentClass", "Letter 8.5 x 11");
  formData.append("file", new Blob([pdfBuffer as BlobPart], { type: "application/pdf" }), `${documentName}.pdf`);

  const res = await fetch(`${getBaseUrl()}/documents`, {
    method: "POST",
    headers: {
      Accept: "application/xml",
      Authorization: getAuthHeader(),
    },
    body: formData,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Click2Mail document upload failed (${res.status}): ${text}`);
  }

  const parsed = parseXml(text);
  const doc = parsed.document as Record<string, unknown> | undefined;
  if (!doc?.id) {
    throw new Error(`Click2Mail document upload returned unexpected response: ${text}`);
  }

  return String(doc.id);
}

/** Upload a recipient address list. Returns the address list ID after CASS validation. */
export async function uploadAddressList(address: Click2MailAddress): Promise<string> {
  const addressXml = `<addressList>
  <addressListName>Dispute-${Date.now()}</addressListName>
  <addressMappingId>1</addressMappingId>
  <addresses>
    <address>
      <Firstname>${escapeXml(address.firstName || "")}</Firstname>
      <Lastname>${escapeXml(address.lastName || "")}</Lastname>
      <Organization>${escapeXml(address.organization)}</Organization>
      <Address1>${escapeXml(address.address1)}</Address1>
      <Address2>${escapeXml(address.address2 || "")}</Address2>
      <Address3></Address3>
      <City>${escapeXml(address.city)}</City>
      <State>${escapeXml(address.state)}</State>
      <Postalcode>${escapeXml(address.zip)}</Postalcode>
      <Country>US</Country>
    </address>
  </addresses>
</addressList>`;

  const res = await fetch(`${getBaseUrl()}/addressLists`, {
    method: "POST",
    headers: {
      Accept: "application/xml",
      "Content-Type": "application/xml",
      Authorization: getAuthHeader(),
    },
    body: addressXml,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Click2Mail address upload failed (${res.status}): ${text}`);
  }

  const parsed = parseXml(text);
  const addrList = parsed.addressList as Record<string, unknown> | undefined;
  if (!addrList?.id) {
    throw new Error(`Click2Mail address upload returned unexpected response: ${text}`);
  }

  const addressId = String(addrList.id);

  // Poll until CASS standardization completes (status 5)
  await waitForAddressValidation(addressId);

  return addressId;
}

/** Poll address list until CASS-validated (status 5). Timeout after 30 seconds. */
async function waitForAddressValidation(addressId: string): Promise<void> {
  const maxAttempts = 15;
  const delayMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${getBaseUrl()}/addressLists/${addressId}`, {
      headers: {
        Accept: "application/xml",
        Authorization: getAuthHeader(),
      },
    });

    const text = await res.text();
    const parsed = parseXml(text);
    const addrList = parsed.addressList as Record<string, unknown> | undefined;
    const status = addrList?.status !== undefined ? Number(addrList.status) : -1;

    if (status === 5) return; // CASS Standardized — ready
    if (status < 0 || status > 10) {
      throw new Error(`Click2Mail address validation failed with status ${status}: ${text}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Click2Mail address CASS validation timed out after 30 seconds");
}

/** Create a mail job linking a document and address list. Returns the job ID. */
export async function createJob(documentId: string, addressId: string): Promise<string> {
  const jobParams = new URLSearchParams({
    documentClass: "Letter 8.5 x 11",
    layout: "Address on Separate Page",
    productionTime: "Next Day",
    envelope: "#10 Single Window",
    color: "Black and White",
    paperType: "White 24#",
    printOption: "Simplex",
    documentId,
    addressId,
  });

  const res = await fetch(`${getBaseUrl()}/jobs`, {
    method: "POST",
    headers: {
      Accept: "application/xml",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: getAuthHeader(),
    },
    body: jobParams.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Click2Mail job creation failed (${res.status}): ${text}`);
  }

  const parsed = parseXml(text);
  const job = parsed.job as Record<string, unknown> | undefined;
  if (!job?.id) {
    throw new Error(`Click2Mail job creation returned unexpected response: ${text}`);
  }

  return String(job.id);
}

/** Submit a job for printing and mailing. */
export async function submitJob(jobId: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/jobs/${jobId}/submit`, {
    method: "POST",
    headers: {
      Accept: "application/xml",
      Authorization: getAuthHeader(),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Click2Mail job submission failed (${res.status}): ${text}`);
  }
}

/** Get the current status of a mail job. */
export async function getJobStatus(jobId: string): Promise<Click2MailJobStatus> {
  const res = await fetch(`${getBaseUrl()}/jobs/${jobId}`, {
    headers: {
      Accept: "application/xml",
      Authorization: getAuthHeader(),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Click2Mail job status check failed (${res.status}): ${text}`);
  }

  const parsed = parseXml(text);
  const job = parsed.job as Record<string, unknown> | undefined;

  return {
    id: String(job?.id || jobId),
    status: String(job?.status || "UNKNOWN"),
    description: job?.description ? String(job.description) : undefined,
  };
}

/** Get USPS tracking info for a mailed job. Returns null if not yet available. */
export async function getTracking(jobId: string): Promise<Click2MailTracking | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/jobs/${jobId}/tracking?trackingType=IMB`, {
      headers: {
        Accept: "application/xml",
        Authorization: getAuthHeader(),
      },
    });

    if (!res.ok) return null;

    const text = await res.text();
    const parsed = parseXml(text);
    const tracking = parsed.tracking as Record<string, unknown> | undefined;
    if (!tracking) return null;

    // The tracking response may contain a mailpiece array or single object
    const mailpiece = (tracking.mailpieces as Record<string, unknown>)?.mailpiece as Record<string, unknown> | undefined;

    return {
      barcode: mailpiece?.barcode ? String(mailpiece.barcode) : undefined,
      status: mailpiece?.status ? String(mailpiece.status) : undefined,
      statusDate: mailpiece?.statusDate ? String(mailpiece.statusDate) : undefined,
      statusLocation: mailpiece?.statusLocation ? String(mailpiece.statusLocation) : undefined,
    };
  } catch {
    return null;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
