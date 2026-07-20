"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/AuthProvider";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { Field, inputCls, PrimaryButton } from "@/components/forms";
import { NAV_ICONS } from "@/shared/icons";

type RegisterMode = "new-project" | "join";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "A apărut o eroare neașteptată. Încearcă din nou.";
}

export default function RegisterPage() {
  const { registerNewProject, registerWithInviteCode } = useAuth();
  const [mode, setMode] = useState<RegisterMode>("new-project");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [projectName, setProjectName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { run: handleSubmit, pending } = useAsyncAction(async () => {
    setError(null);
    try {
      if (mode === "new-project") {
        await registerNewProject(username, password, projectName);
      } else {
        await registerWithInviteCode(username, password, inviteCode);
      }
    } catch (err) {
      setError(errorMessage(err));
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {NAV_ICONS.logo}
            </span>
          </div>
          <h1 className="font-heading text-xl font-bold text-primary">Renovator Pro</h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4 rounded-xl border border-line bg-surface p-6 shadow-sm"
        >
          <h2 className="font-heading text-lg font-bold text-primary">Creează cont</h2>

          {/* Toggle mod (D6, docs/cerinte-autentificare.md): proiect nou vs. alăturare la unul existent. */}
          <div className="flex gap-1 rounded-lg border border-line bg-surface-low p-1">
            <button
              type="button"
              onClick={() => setMode("new-project")}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-bold transition-all ${
                mode === "new-project" ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-surface"
              }`}
            >
              Creez proiect nou
            </button>
            <button
              type="button"
              onClick={() => setMode("join")}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-bold transition-all ${
                mode === "join" ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-surface"
              }`}
            >
              Mă alătur unui proiect
            </button>
          </div>

          <Field label="Nume de utilizator">
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              required
            />
          </Field>

          <Field label="Parolă">
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              className={inputCls}
              required
            />
          </Field>

          {mode === "new-project" ? (
            <Field label="Numele proiectului">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ex: Renovare Apartament Centru"
                className={inputCls}
                required
              />
            </Field>
          ) : (
            <Field label="Cod de invitație">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ex: K7XMQ2NP3A"
                className={`${inputCls} font-mono uppercase`}
                required
              />
            </Field>
          )}

          {error && <p className="text-sm font-medium text-tertiary">{error}</p>}

          <PrimaryButton type="submit" pending={pending}>
            Creează cont
          </PrimaryButton>

          <p className="text-center text-sm text-muted">
            Ai deja cont?{" "}
            <Link href="/login" className="font-semibold text-secondary hover:underline">
              Autentifică-te
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
