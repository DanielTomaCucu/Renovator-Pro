"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthSession, MyProject } from "./types";
import { authApi, setAccessToken, setSessionExpiredHandler } from "./api-client";

interface AuthContextValue {
  session: AuthSession | null;
  /** `true` cât timp încearcă refresh-ul silențios de la boot — durează mai mult dacă backend-ul (Render) are cold-start. */
  loading: boolean;
  /** Toate proiectele userului curent (multi-proiect) — folosit de selectorul de proiecte din Setări. */
  projects: MyProject[];
  login: (username: string, password: string) => Promise<void>;
  registerNewProject: (username: string, email: string, password: string, projectName: string) => Promise<void>;
  registerWithInviteCode: (username: string, email: string, password: string, inviteCode: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Alăturare la un alt proiect (cont deja existent) — comută imediat sesiunea pe el. */
  joinProject: (inviteCode: string) => Promise<void>;
  /** Comută sesiunea activă pe un proiect la care userul e deja membru. */
  switchProject: (projectId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setSession(null);
      setProjects([]);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  // Best-effort — dacă lista de proiecte eșuează, sesiunea principală (session) rămâne validă; doar
  // selectorul de proiecte din Setări n-ar avea date, nu blocăm restul aplicației pentru asta.
  const refreshProjects = useCallback(async () => {
    try {
      setProjects(await authApi.listMyProjects());
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Fără cookie de refresh valid (niciodată logat, sau logout anterior) → silentRefresh întoarce
    // null, nu aruncă — „nelogat” e starea normală la prima vizită, nu o eroare de afișat.
    authApi
      .silentRefresh()
      .then(async (result) => {
        if (cancelled) return;
        setSession(result);
        if (result) await refreshProjects();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshProjects]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authApi.login(username, password);
      setSession(result);
      await refreshProjects();
    },
    [refreshProjects]
  );

  const registerNewProject = useCallback(
    async (username: string, email: string, password: string, projectName: string) => {
      const result = await authApi.registerNewProject(username, email, password, projectName);
      setSession(result);
      await refreshProjects();
    },
    [refreshProjects]
  );

  const registerWithInviteCode = useCallback(
    async (username: string, email: string, password: string, inviteCode: string) => {
      const result = await authApi.registerWithInviteCode(username, email, password, inviteCode);
      setSession(result);
      await refreshProjects();
    },
    [refreshProjects]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setAccessToken(null);
    setSession(null);
    setProjects([]);
  }, []);

  const joinProject = useCallback(
    async (inviteCode: string) => {
      const result = await authApi.joinProject(inviteCode);
      setSession(result);
      await refreshProjects();
    },
    [refreshProjects]
  );

  const switchProject = useCallback(async (projectId: string) => {
    const result = await authApi.switchProject(projectId);
    setSession(result);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      projects,
      login,
      registerNewProject,
      registerWithInviteCode,
      logout,
      joinProject,
      switchProject,
    }),
    [session, loading, projects, login, registerNewProject, registerWithInviteCode, logout, joinProject, switchProject]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
