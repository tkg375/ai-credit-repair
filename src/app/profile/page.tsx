"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!user) return;

    fetch("/api/users/profile", {
      headers: { Authorization: `Bearer ${user.idToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile;
        if (p) {
          setFullName(p.fullName || "");
          setDateOfBirth(p.dateOfBirth || "");
          setPhone(p.phone || "");
          setAddress(p.address || "");
          setAddress2(p.address2 || "");
          setCity(p.city || "");
          setState(p.state || "");
          setZip(p.zip || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ fullName, dateOfBirth, phone, address, address2, city, state, zip }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    setError("");
    try {
      // 1. Delete all Firestore data server-side
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.idToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete account data");

      // 2. Delete Firebase Auth account using the user's ID token
      const authRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: user.idToken }),
        }
      );
      if (!authRes.ok) {
        const d = await authRes.json();
        throw new Error(d.error?.message || "Failed to delete auth account");
      }

      // 3. Sign out and redirect
      await signOut();
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthenticatedLayout activeNav="profile">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent mb-1">
          My Profile
        </h1>
        <p className="text-slate-500 mb-8 text-sm">Manage your account information</p>

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lime-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {(fullName || user?.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{fullName || "No name set"}</p>
              <p className="text-slate-500 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                placeholder="(555) 000-0000"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold mb-4">Mailing Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                placeholder="123 Main St"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Apt / Suite (optional)</label>
              <input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                placeholder="Apt 4B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                placeholder="New York"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                  placeholder="NY"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ZIP</label>
                <input
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                  placeholder="10001"
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 mb-12"
        >
          {saving ? "Saving..." : saveSuccess ? "✓ Saved!" : "Save Changes"}
        </button>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h2 className="font-semibold text-red-600 mb-1">Danger Zone</h2>
          <p className="text-sm text-slate-500 mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                This will permanently delete all your disputes, credit reports, scores, and account data.
                Type <span className="font-mono font-bold">DELETE</span> to confirm.
              </p>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm font-mono"
                placeholder="DELETE"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-40"
                >
                  {deleting ? "Deleting..." : "Permanently Delete"}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthenticatedLayout>
  );
}
