import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function DELETE() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = user.uid;

  try {
    // Delete all user documents from every collection
    const collections = [
      COLLECTIONS.creditReports,
      COLLECTIONS.reportItems,
      COLLECTIONS.disputes,
      COLLECTIONS.creditScores,
      COLLECTIONS.actionPlans,
    ];

    for (const col of collections) {
      const docs = await firestore.query(col, [{ field: "userId", op: "EQUAL", value: uid }]);
      await Promise.all(docs.map((doc) => firestore.deleteDoc(col, doc.id)));
    }

    // Delete the user profile document
    await firestore.deleteDoc(COLLECTIONS.users, uid);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Failed to delete account data" }, { status: 500 });
  }
}
