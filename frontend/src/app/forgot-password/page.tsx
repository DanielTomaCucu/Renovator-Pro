"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/shared/api-client";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { Field, inputCls, PrimaryButton } from "@/components/forms";
import { NAV_ICONS } from "@/shared/icons";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "A apărut o eroare neașteptată. Încearcă din nou.";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const { run: handleSubmit, pending } = useAsyncAction(async () => {
    setError(null);
    setResetToken(null);
    try {
      const { resetToken } = await authApi.forgotPassword(email);
      setResetToken(resetToken);
    } catch (err) {
      setError(errorMessage(err));
    }
  });

  const resetUrl = resetToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password?token=${encodeURIComponent(resetToken)}`
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>
              {NAV_ICONS.logo}
            </span>
          </div>
          <h1 className="font-heading text-xl font-bold text-primary">Renovator Pro</h1>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-primary">Ai uitat parola?</h2>
          <p className="text-sm text-muted">Introdu emailul contului — îți arătăm aici linkul de resetare.</p>

          {resetUrl ? (
            <div className="space-y-3 rounded-lg border border-line bg-surface-low p-4">
              {/* Mod dev — proiectul n-are niciun serviciu de email configurat, linkul apare direct aici
                  în loc să plece pe email real. Vezi ForgotPasswordResponse (backend). */}
              <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                Link de resetare (mod dev — fără email real)
              </p>
              <Link
                href={`/reset-password?token=${encodeURIComponent(resetToken!)}`}
                className="block break-all rounded-md bg-surface px-3 py-2 font-mono text-xs text-secondary underline"
              >
                {resetUrl}
              </Link>
              <p className="text-xs text-muted">Link-ul expiră în 30 de minute și poate fi folosit o singură dată.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <Field label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  required
                />
              </Field>

              {error && <p className="text-sm font-medium text-tertiary">{error}</p>}

              <PrimaryButton type="submit" pending={pending}>
                Trimite link de resetare
              </PrimaryButton>
            </form>
          )}

          <p className="text-center text-sm text-muted">
            <Link href="/login" className="font-semibold text-secondary hover:underline">
              Înapoi la autentificare
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
