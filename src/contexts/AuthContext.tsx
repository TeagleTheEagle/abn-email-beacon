"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface AuthContextValue {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!error && data) {
      setProfile(data);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted) {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? "" });
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" });
        fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      } else if (event === "USER_UPDATED" && session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" });
        fetchProfile(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
