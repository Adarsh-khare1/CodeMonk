'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import api from "@/lib/api";

// ---------------- CONTEXT TYPES ----------------

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ---------------- CONTEXT ----------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------- PROVIDER ----------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
const fetchCurrentUser = async () => {
  try {
    const { data } = await api.get("/auth/me");

    // Add safety checks
    if (!data?.user) {
      setUser(null);
      return null;
    }

    const currentUser: User = {
      _id: data.user.id || data.user._id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
      avatar: data.user.avatar,
    };

    setUser(currentUser);
    return currentUser;
  } catch (err: any) {
    if (err.response?.status === 401) {
      console.log("👤 No active session (normal for guests)");
      setUser(null);
      return null;
    }

    console.error("Auth check failed:", err);
    setUser(null);
    throw err;
  }
};

  // ---------------- HYDRATE FROM COOKIE SESSION ----------------
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await fetchCurrentUser();
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.error("Auth bootstrap failed:", err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const handleAuthLogout = () => {
      setUser(null);
    };

    bootstrapAuth();
    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      const user: User = {
        _id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
      };

      setUser(user);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const signup = async (username: string, email: string, password: string) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/signup", { username, email, password });

      const user: User = {
        _id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
      };

      setUser(user);
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOGOUT ----------------
 const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.error("Logout error:", err);
  }

  setUser(null);
  setLoading(false);        // ← Important
  router.push("/");
  router.refresh();         // Refresh server components if needed
};

  // ---------------- GOOGLE LOGIN ----------------
  const loginWithGoogle = async (idToken: string) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/google", { idToken });

      const user: User = {
        _id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
      };

      setUser(user);
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------- HOOK ----------------

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
