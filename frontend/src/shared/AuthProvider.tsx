"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthSession } from "./types";
import { authApi, setAccessToken, setSessionExpiredHandler } from "./api-client";

interface AuthContextValue {
  session: AuthSession | null;
  /** `true` cât timp încearcă refresh-ul silențios de la boot — durează mai mult dacă backend-ul (Render) are cold-start. */
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  registerNewProject: (username: string, password: string, projectName: string) => Promise<void>;
  registerWithInviteCode: (username: string, password: string, inviteCode: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => setSession(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Fără cookie de refresh valid (niciodată logat, sau logout anterior) → silentRefresh întoarce
    // null, nu aruncă — „nelogat” e starea normală la prima vizită, nu o eroare de afișat.
    authApi
      .silentRefresh()
      .then((result) => {
        if (!cancelled) setSession(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authApi.login(username, password);
    setSession(result);
  }, []);

  const registerNewProject = useCallback(async (username: string, password: string, projectName: string) => {
    const result = await authApi.registerNewProject(username, password, projectName);
    setSession(result);
  }, []);

  const registerWithInviteCode = useCallback(async (username: string, password: string, inviteCode: string) => {
    const result = await authApi.registerWithInviteCode(username, password, inviteCode);
    setSession(result);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setAccessToken(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, login, registerNewProject, registerWithInviteCode, logout }),
    [session, loading, login, registerNewProject, registerWithInviteCode, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
