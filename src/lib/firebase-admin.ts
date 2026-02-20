// Firebase Admin replacement using REST APIs (compatible with Cloudflare Workers)
// Verifies Firebase ID tokens using Google's public keys
// Accesses Firestore via REST API

interface GoogleKey {
  kid: string;
  n: string;
  e: string;
  kty: string;
  alg: string;
  use: string;
}

let cachedKeys: { keys: GoogleKey[]; expiry: number } | null = null;

async function getGooglePublicKeys(): Promise<GoogleKey[]> {
  if (cachedKeys && Date.now() < cachedKeys.expiry) {
    return cachedKeys.keys;
  }

  // Firebase ID tokens are signed by securetoken@system.gserviceaccount.com
  const res = await fetch(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  );
  const data = await res.json();
  cachedKeys = {
    keys: data.keys,
    expiry: Date.now() + 3600 * 1000, // cache for 1 hour
  };
  return data.keys;
}

function base64UrlDecode(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

async function importPublicKey(jwk: GoogleKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
      alg: "RS256",
      ext: true,
    },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

// Store last verification error for debugging
let lastVerifyError = "";

export function getLastVerifyError(): string {
  return lastVerifyError;
}

export async function verifyIdToken(
  token: string
): Promise<{ uid: string; email: string } | null> {
  lastVerifyError = "";
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      lastVerifyError = "invalid token format";
      return null;
    }

    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));

    // Check expiry
    if (payload.exp * 1000 < Date.now()) {
      lastVerifyError = `token expired (exp: ${payload.exp}, now: ${Math.floor(Date.now() / 1000)})`;
      return null;
    }

    // Check issuer
    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim();
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
      lastVerifyError = `issuer mismatch (expected: securetoken.google.com/${projectId}, got: ${payload.iss})`;
      return null;
    }

    // Check audience
    if (payload.aud !== projectId) {
      lastVerifyError = `audience mismatch (expected: ${projectId}, got: ${payload.aud})`;
      return null;
    }

    // Verify signature
    const keys = await getGooglePublicKeys();
    const key = keys.find((k) => k.kid === header.kid);
    if (!key) {
      lastVerifyError = `signing key not found (kid: ${header.kid})`;
      return null;
    }

    const cryptoKey = await importPublicKey(key);
    const signatureData = base64UrlDecode(parts[2]);
    const signedData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`).buffer as ArrayBuffer;

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signatureData,
      signedData
    );

    if (!valid) {
      lastVerifyError = "signature verification failed";
      return null;
    }

    return { uid: payload.sub, email: payload.email || "" };
  } catch (err) {
    lastVerifyError = `exception: ${err instanceof Error ? err.message : String(err)}`;
    return null;
  }
}

// Firestore REST API helpers
const FIRESTORE_BASE = () =>
  `https://firestore.googleapis.com/v1/projects/${(process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim()}/databases/(default)/documents`;

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyPem = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKeyPem) {
    throw new Error(`Firebase admin credentials not configured (email: ${clientEmail ? "set" : "missing"}, key: ${privateKeyPem ? "set" : "missing"})`);
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const encodedClaim = btoa(JSON.stringify(claim))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const signInput = `${encodedHeader}.${encodedClaim}`;

  // Import private key — split into lines and keep only pure base64 lines.
  // This handles non-standard dash characters (em-dash, en-dash) in PEM headers
  // that prevent exact string matching, while correctly discarding header/footer.
  const pemBody = privateKeyPem
    .replace(/\\n/g, "\n")
    .split("\n")
    .filter(line => /^[A-Za-z0-9+/=]+$/.test(line.trim()))
    .join("");
  const pemBinary = atob(pemBody);
  const pemBytes = new Uint8Array(pemBinary.length);
  for (let i = 0; i < pemBinary.length; i++) {
    pemBytes[i] = pemBinary.charCodeAt(i);
  }
  const keyData = pemBytes.buffer as ArrayBuffer;

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  } catch (err) {
    throw new Error(`Failed to import private key: ${err instanceof Error ? err.message : String(err)}`);
  }

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signInput).buffer as ArrayBuffer
  );

  const encodedSignature = btoa(
    String.fromCharCode(...new Uint8Array(signature))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signInput}.${encodedSignature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${tokenData.error_description || tokenData.error || JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

// Convert Firestore document to plain object
function docToObject(doc: Record<string, unknown>): Record<string, unknown> {
  const fields = doc.fields as Record<string, Record<string, unknown>> | undefined;
  if (!fields) return {};

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = firestoreValueToJs(value);
  }
  return result;
}

function firestoreValueToJs(value: Record<string, unknown>): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    const arr = value.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in value) {
    const map = value.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map.fields || {})) {
      obj[k] = firestoreValueToJs(v);
    }
    return obj;
  }
  return null;
}

function jsToFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(jsToFirestoreValue) } };
  }
  if (typeof value === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = jsToFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

export const firestore = {
  async getDoc(
    collectionName: string,
    docId: string
  ): Promise<{ exists: boolean; id: string; data: Record<string, unknown> }> {
    const token = await getAccessToken();
    const res = await fetch(`${FIRESTORE_BASE()}/${collectionName}/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 404) {
      return { exists: false, id: docId, data: {} };
    }

    const doc = await res.json();
    return { exists: true, id: docId, data: docToObject(doc) };
  },

  async query(
    collectionName: string,
    filters: Array<{ field: string; op: string; value: unknown }>,
    orderByField?: string,
    orderDirection?: "ASCENDING" | "DESCENDING",
    limitCount?: number
  ): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
    const token = await getAccessToken();
    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim();

    const structuredQuery: Record<string, unknown> = {
      from: [{ collectionId: collectionName }],
    };

    if (filters.length > 0) {
      structuredQuery.where = {
        compositeFilter: {
          op: "AND",
          filters: filters.map((f) => ({
            fieldFilter: {
              field: { fieldPath: f.field },
              op: f.op,
              value: jsToFirestoreValue(f.value),
            },
          })),
        },
      };
    }

    if (orderByField) {
      structuredQuery.orderBy = [
        {
          field: { fieldPath: orderByField },
          direction: orderDirection || "ASCENDING",
        },
      ];
    }

    if (limitCount) {
      structuredQuery.limit = limitCount;
    }

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ structuredQuery }),
      }
    );

    const results = await res.json();

    if (!Array.isArray(results)) return [];

    return results
      .filter((r: Record<string, unknown>) => r.document)
      .map((r: Record<string, unknown>) => {
        const doc = r.document as Record<string, unknown>;
        const name = doc.name as string;
        const id = name.split("/").pop()!;
        return { id, data: docToObject(doc) };
      });
  },

  async addDoc(
    collectionName: string,
    data: Record<string, unknown>
  ): Promise<string> {
    const token = await getAccessToken();
    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      fields[key] = jsToFirestoreValue(value);
    }

    const res = await fetch(`${FIRESTORE_BASE()}/${collectionName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    const doc = await res.json();

    if (!res.ok || !doc.name) {
      const errorMsg = doc.error?.message || doc.error?.status || JSON.stringify(doc);
      throw new Error(`Firestore addDoc failed: ${errorMsg}`);
    }

    const name = doc.name as string;
    return name.split("/").pop()!;
  },

  async updateDoc(
    collectionName: string,
    docId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const token = await getAccessToken();
    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      fields[key] = jsToFirestoreValue(value);
    }

    const updateMask = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${k}`)
      .join("&");

    await fetch(
      `${FIRESTORE_BASE()}/${collectionName}/${docId}?${updateMask}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );
  },

  async setDoc(
    collectionName: string,
    docId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const token = await getAccessToken();
    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      fields[key] = jsToFirestoreValue(value);
    }

    await fetch(
      `${FIRESTORE_BASE()}/${collectionName}/${docId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );
  },

  async deleteDoc(
    collectionName: string,
    docId: string
  ): Promise<void> {
    const token = await getAccessToken();
    await fetch(`${FIRESTORE_BASE()}/${collectionName}/${docId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
