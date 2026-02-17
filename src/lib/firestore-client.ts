const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export function firestoreValueToJs(val: Record<string, unknown>): unknown {
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return parseInt(val.integerValue as string, 10);
  if ("doubleValue" in val) return val.doubleValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("nullValue" in val) return null;
  if ("timestampValue" in val) return new Date(val.timestampValue as string);
  if ("arrayValue" in val) {
    const arr = val.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in val) {
    const map = val.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map.fields || {})) {
      result[k] = firestoreValueToJs(v);
    }
    return result;
  }
  return null;
}

export function parseDocument(doc: { name: string; fields?: Record<string, Record<string, unknown>> }): Record<string, unknown> & { id: string } {
  const id = doc.name.split("/").pop()!;
  const result: Record<string, unknown> = { id };
  if (doc.fields) {
    for (const [k, v] of Object.entries(doc.fields)) {
      result[k] = firestoreValueToJs(v);
    }
  }
  return result as Record<string, unknown> & { id: string };
}

export function jsValueToFirestore(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(jsValueToFirestore) } };
  }
  if (typeof value === "object") {
    const fields: Record<string, Record<string, unknown>> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = jsValueToFirestore(v);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

export async function queryCollection(
  idToken: string,
  collection: string,
  userId: string,
  orderByField?: string,
  limitCount?: number,
  additionalFilters?: { field: string; op: string; value: unknown }[]
): Promise<(Record<string, unknown> & { id: string })[]> {
  const filters = [
    {
      fieldFilter: {
        field: { fieldPath: "userId" },
        op: "EQUAL",
        value: { stringValue: userId },
      },
    },
    ...(additionalFilters || []).map((f) => ({
      fieldFilter: {
        field: { fieldPath: f.field },
        op: f.op,
        value: typeof f.value === "boolean" ? { booleanValue: f.value } : { stringValue: f.value },
      },
    })),
  ];

  const query: Record<string, unknown> = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: filters.length === 1
        ? filters[0]
        : { compositeFilter: { op: "AND", filters } },
      ...(limitCount ? { limit: limitCount } : {}),
    },
  };

  const res = await fetch(`${FIRESTORE_BASE}:runQuery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(query),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data
    .filter((item: { document?: unknown }) => item.document)
    .map((item: { document: { name: string; fields?: Record<string, Record<string, unknown>> } }) => parseDocument(item.document));
}

export async function getDocument(
  idToken: string,
  collection: string,
  docId: string
): Promise<(Record<string, unknown> & { id: string }) | null> {
  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return null;
  const doc = await res.json();
  return parseDocument(doc);
}

export async function updateDocument(
  idToken: string,
  collection: string,
  docId: string,
  fields: Record<string, unknown>
): Promise<boolean> {
  const fieldPaths = Object.keys(fields).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const firestoreFields: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of Object.entries(fields)) {
    firestoreFields[k] = jsValueToFirestore(v);
  }

  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}?${fieldPaths}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: firestoreFields }),
  });

  return res.ok;
}

export async function addDocument(
  idToken: string,
  collection: string,
  data: Record<string, unknown>
): Promise<string | null> {
  const firestoreFields: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of Object.entries(data)) {
    firestoreFields[k] = jsValueToFirestore(v);
  }

  const res = await fetch(`${FIRESTORE_BASE}/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: firestoreFields }),
  });

  if (!res.ok) return null;
  const doc = await res.json();
  return doc.name.split("/").pop() as string;
}

export async function deleteDocument(
  idToken: string,
  collection: string,
  docId: string
): Promise<boolean> {
  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return res.ok;
}

export { FIRESTORE_BASE };
