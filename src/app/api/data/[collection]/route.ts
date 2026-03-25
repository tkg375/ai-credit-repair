import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore } from "@/lib/firebase-admin";

// POST /api/data/[collection]
// Query a collection. userId filter is added automatically from auth.
// Body: { extraFilters?: [{field, op, value}], orderBy?: string, orderDirection?: "ASCENDING"|"DESCENDING", limit?: number }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { collection } = await params;
  const body = await request.json().catch(() => ({})) as {
    extraFilters?: { field: string; op: string; value: unknown }[];
    orderBy?: string;
    orderDirection?: "ASCENDING" | "DESCENDING";
    limit?: number;
  };

  const filters = [
    { field: "userId", op: "EQUAL", value: user.uid },
    ...(body.extraFilters || []),
  ];

  const docs = await firestore.query(
    collection,
    filters,
    body.orderBy,
    body.orderDirection,
    body.limit
  );

  return NextResponse.json({ documents: docs.map((d) => ({ id: d.id, ...d.data })) });
}
