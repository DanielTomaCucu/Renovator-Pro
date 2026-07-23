"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/AuthProvider";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { Field, inputCls, PrimaryButton } from "@/components/forms";
import { NAV_ICONS } from "@/shared/icons";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "A apărut o eroare neașteptată. Încearcă din nou.";
}

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { run: handleSubmit, pending } = useAsyncAction(async () => {
    setError(null);
    try {
      await login(username, password);
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
          <h2 className="font-heading text-lg font-bold text-primary">Autentificare</h2>

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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              required
            />
          </Field>

          <p className="-mt-2 text-right text-xs">
            <Link href="/forgot-password" className="font-semibold text-secondary hover:underline">
              Ai uitat parola?
            </Link>
          </p>

          {error && <p className="text-sm font-medium text-tertiary">{error}</p>}

          <PrimaryButton type="submit" pending={pending}>
            Intră în cont
          </PrimaryButton>

          <p className="text-center text-sm text-muted">
            Nu ai cont?{" "}
            <Link href="/register" className="font-semibold text-secondary hover:underline">
              Înregistrează-te
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
