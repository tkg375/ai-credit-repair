"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  idToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Firebase Auth REST API endpoints
const AUTH_BASE = "https://identitytoolkit.googleapis.com/v1/accounts";

async function signInWithPassword(email: string, password: string): Promise<User> {
  const res = await fetch(`${AUTH_BASE}:signInWithPassword?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Sign in failed");
  }

  const data = await res.json();
  return {
    uid: data.localId,
    email: data.email,
    displayName: data.displayName || null,
    idToken: data.idToken,
    refreshToken: data.refreshToken,
  };
}

async function signUpWithPassword(email: string, password: string): Promise<User> {
  const res = await fetch(`${AUTH_BASE}:signUp?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Sign up failed");
  }

  const data = await res.json();
  return {
    uid: data.localId,
    email: data.email,
    displayName: data.displayName || null,
    idToken: data.idToken,
    refreshToken: data.refreshToken,
  };
}

async function refreshIdToken(refreshToken: string): Promise<{ idToken: string; refreshToken: string }> {
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await res.json();
  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
  };
}

async function getUserData(idToken: string): Promise<{ uid: string; email: string; displayName: string | null }> {
  const res = await fetch(`${AUTH_BASE}:lookup?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    throw new Error("Failed to get user data");
  }

  const data = await res.json();
  const user = data.users?.[0];
  if (!user) throw new Error("User not found");

  return {
    uid: user.localId,
    email: user.email,
    displayName: user.displayName || null,
  };
}

async function syncSession(user: User | null) {
  if (user) {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: user.idToken }),
    });
  } else {
    await fetch("/api/auth/session", { method: "DELETE" });
  }
}

const STORAGE_KEY = "creditai_auth";

function saveUser(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const stored = loadUser();
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        // Try to refresh the token
        const tokens = await refreshIdToken(stored.refreshToken);
        const userData = await getUserData(tokens.idToken);
        const refreshedUser: User = {
          ...userData,
          idToken: tokens.idToken,
          refreshToken: tokens.refreshToken,
        };
        saveUser(refreshedUser);
        setUser(refreshedUser);
        await syncSession(refreshedUser);
      } catch {
        // Token expired or invalid, clear storage
        clearUser();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await signInWithPassword(email, password);
    saveUser(user);
    setUser(user);
    await syncSession(user);
  };

  const signUp = async (email: string, password: string) => {
    const user = await signUpWithPassword(email, password);
    saveUser(user);
    setUser(user);
    await syncSession(user);
  };

  const signInWithGoogle = async () => {
    // Google Sign-In requires the Firebase SDK or a popup/redirect flow
    // For REST API only, we'd need to implement OAuth manually
    // For now, throw an error directing users to email/password
    throw new Error("Google sign-in requires email/password. Please use email registration.");
  };

  const signOut = async () => {
    clearUser();
    setUser(null);
    await syncSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: true,
      signIn: async () => {},
      signUp: async () => {},
      signInWithGoogle: async () => {},
      signOut: async () => {},
    };
  }
  return context;
}
