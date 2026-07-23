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
  const [submitted, setSubmitted] = useState(false);

  const { run: handleSubmit, pending } = useAsyncAction(async () => {
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(errorMessage(err));
    }
  });

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
          <p className="text-sm text-muted">Introdu emailul contului — îți trimitem un link de resetare.</p>

          {submitted ? (
            <div className="space-y-2 rounded-lg border border-line bg-surface-low p-4">
              <p className="text-sm text-primary">
                Dacă există un cont cu acest email, am trimis un link de resetare a parolei.
              </p>
              <p className="text-xs text-muted">Linkul expiră în 30 de minute și poate fi folosit o singură dată.</p>
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
