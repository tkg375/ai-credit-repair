import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore } from "@/lib/firebase-admin";

type Params = { params: Promise<{ collection: string; id: string }> };

function isOwner(user: { uid: string }, collection: string, doc: { id: string; data: Record<string, unknown> }): boolean {
  if (collection === "users") return doc.id === user.uid;
  return doc.data.userId === user.uid;
}

// GET /api/data/[collection]/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { collection, id } = await params;
  const doc = await firestore.getDoc(collection, id);
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isOwner(user, collection, doc)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ id: doc.id, ...doc.data });
}

// PATCH /api/data/[collection]/[id]
// Body: plain key-value object with fields to update
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { collection, id } = await params;
  const doc = await firestore.getDoc(collection, id);
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isOwner(user, collection, doc)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates = await request.json() as Record<string, unknown>;
  // Prevent overwriting ownership fields
  delete updates.id;
  delete updates.userId;

  await firestore.updateDoc(collection, id, updates);
  return NextResponse.json({ success: true });
}

// DELETE /api/data/[collection]/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { collection, id } = await params;
  const doc = await firestore.getDoc(collection, id);
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isOwner(user, collection, doc)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await firestore.deleteDoc(collection, id);
  return NextResponse.json({ success: true });
}
