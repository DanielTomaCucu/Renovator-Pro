import { AuthSession, ProjectMember } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * Access token JWT ținut EXCLUSIV în memorie (nu localStorage — o pagină XSS ar putea citi
 * localStorage, nu variabile de modul). Se pierde la refresh de pagină — de-asta `AuthProvider`
 * face un refresh silențios la boot, folosind cookie-ul httpOnly de refresh.
 */
let accessToken: string | null = null;

/** Apelat de `AuthProvider` când o sesiune expiră iremediabil (refresh eșuat) — curăță starea globală de UI. */
let sessionExpiredHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/**
 * Construiește mesajul de eroare dintr-un `ProblemDetail` — dacă backend-ul a atașat `fieldErrors`
 * (validare Bean Validation, ex. „Payload invalid"), afișăm mesajele per-câmp în loc de textul generic,
 * altfel userul nu află ce anume e greșit în formular.
 */
function problemMessage(problem: { detail?: string; fieldErrors?: Record<string, string> } | null, status: number): string {
  if (problem?.fieldErrors && Object.keys(problem.fieldErrors).length > 0) {
    return Object.values(problem.fieldErrors).join(" ");
  }
  return problem?.detail ?? `Eroare API (${status})`;
}

async function rawFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as Record<string, string>) };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}

/** Refresh silențios pe cookie-ul httpOnly — folosit atât la boot cât și la retry pe 401. */
async function trySilentRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken: string };
    accessToken = data.accessToken;
    return true;
  } catch {
    return false;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
  const res = await rawFetch(path, init);

  // 401 pe un endpoint autentificat, cu token deja prezent (deci expirat, nu „nelogat") — o singură
  // încercare de refresh + retry; dacă refresh-ul eșuează, sesiunea chiar s-a terminat.
  if (res.status === 401 && !isRetry && accessToken !== null) {
    const refreshed = await trySilentRefresh();
    if (refreshed) {
      return apiFetch<T>(path, init, true);
    }
    accessToken = null;
    sessionExpiredHandler?.();
    throw new ApiError("Sesiune expirată — autentifică-te din nou", 401);
  }

  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new ApiError(problemMessage(problem, res.status), res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch<void>(path, { method: "DELETE" }),
};

/**
 * Endpoint-urile `/api/auth/**` (register/login/refresh/logout) folosesc `credentials: "include"`
 * direct — cookie-ul de refresh trebuie să circule cross-site (Vercel ↔ Render), independent de
 * `api.*` (care e pentru date, cu retry pe 401).
 */
async function authFetch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new ApiError(problemMessage(problem, res.status), res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

interface CurrentUserBody {
  user: { id: string; username: string };
  project: { id: string; title: string; totalBudget: number; currency: string; totalArea?: number };
  role: string;
}

interface AuthResponseBody extends CurrentUserBody {
  accessToken: string;
}

function toSession(body: CurrentUserBody): AuthSession {
  return {
    user: body.user,
    project: body.project as AuthSession["project"],
    role: body.role as AuthSession["role"],
  };
}

function handleAuthResponse(body: AuthResponseBody): AuthSession {
  accessToken = body.accessToken;
  return toSession(body);
}

export const authApi = {
  registerNewProject: (username: string, password: string, projectName: string) =>
    authFetch<AuthResponseBody>("/api/auth/register", { username, password, projectName }).then(handleAuthResponse),
  registerWithInviteCode: (username: string, password: string, inviteCode: string) =>
    authFetch<AuthResponseBody>("/api/auth/register", { username, password, inviteCode }).then(handleAuthResponse),
  login: (username: string, password: string) =>
    authFetch<AuthResponseBody>("/api/auth/login", { username, password }).then(handleAuthResponse),
  logout: async () => {
    try {
      await authFetch<void>("/api/auth/logout");
    } finally {
      accessToken = null;
    }
  },
  /** La boot de pagină: încearcă să refolosească sesiunea din cookie-ul httpOnly, fără input de la user. */
  silentRefresh: async (): Promise<AuthSession | null> => {
    const refreshed = await trySilentRefresh();
    if (!refreshed) return null;
    return api.get<CurrentUserBody>("/api/auth/me").then(toSession);
  },
};

/** Partajare proiect (AUTH-7) — folosite din Setări, doar OWNER pentru cod/ștergere membru. */
export const sharingApi = {
  getInviteCode: (projectId: string) => api.get<{ inviteCode: string }>(`/api/projects/${projectId}/invite-code`),
  regenerateInviteCode: (projectId: string) =>
    api.post<{ inviteCode: string }>(`/api/projects/${projectId}/invite-code/regenerate`, undefined),
  listMembers: (projectId: string) => api.get<ProjectMember[]>(`/api/projects/${projectId}/members`),
  removeMember: (projectId: string, userId: string) => api.delete(`/api/projects/${projectId}/members/${userId}`),
};
