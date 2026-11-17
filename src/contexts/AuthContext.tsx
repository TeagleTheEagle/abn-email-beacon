"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type AuthResult = { error: string | null };
type SignOutScope = "local" | "global" | "others";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: (scope?: SignOutScope, clearOnError?: boolean) => Promise<AuthResult>;
  refreshProfile: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const sessionVersion = useRef(0);

  const clearSession = useCallback(() => {
    sessionVersion.current += 1;
    setUser(null);
    setProfile(null);
  }, []);

  const fetchProfile = useCallback(async (userId: string, version: number): Promise<AuthResult> => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    // A response for an old account or a signed-out session must never restore stale private data.
    if (!mounted.current || version !== sessionVersion.current)
      return { error: "Profile request superseded" };
    if (error) {
      setProfile(null);
      return { error: error.message };
    }
    setProfile(data);
    return { error: null };
  }, []);

  const applyUser = useCallback(
    (nextUser: User) => {
      sessionVersion.current += 1;
      const version = sessionVersion.current;
      setUser(nextUser);
      setProfile(null);
      setLoading(false);
      void fetchProfile(nextUser.id, version);
    },
    [fetchProfile],
  );

  const refreshProfile = async () => {
    if (!user) return { error: "No signed-in account" };
    return fetchProfile(user.id, sessionVersion.current);
  };

  const signOut = async (scope: SignOutScope = "local", clearOnError = false) => {
    try {
      const { error } = await supabase.auth.signOut({ scope });
      if (error) {
        if (clearOnError) clearSession();
        return { error: error.message };
      }
      clearSession();
      return { error: null };
    } catch (error) {
      if (clearOnError) clearSession();
      return { error: error instanceof Error ? error.message : "Could not sign out" };
    }
  };

  useEffect(() => {
    mounted.current = true;
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!mounted.current) return;
        if (error) {
          clearSession();
        } else if (session?.user) {
          applyUser(session.user);
        } else {
          clearSession();
        }
      } catch {
        if (mounted.current) clearSession();
      } finally {
        if (mounted.current) setLoading(false);
      }
    };
    void initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted.current) return;
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
        applyUser(session.user);
      } else if (event === "SIGNED_OUT") {
        clearSession();
        setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [applyUser, clearSession]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
