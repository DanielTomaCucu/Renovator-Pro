"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/shared/api-client";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { Field, inputCls, PrimaryButton } from "@/components/forms";
import { NAV_ICONS } from "@/shared/icons";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "A apărut o eroare neașteptată. Încearcă din nou.";
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { run: handleSubmit, pending } = useAsyncAction(async () => {
    setError(null);
    if (newPassword !== confirmNewPassword) {
      setError("Parolele nu coincid");
      return;
    }
    try {
      await authApi.resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    }
  });

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <span className="material-symbols-outlined text-4xl text-secondary">check_circle</span>
        <p className="text-sm text-muted">
          Parola a fost schimbată. Toate sesiunile active au fost deconectate — intră din nou cu parola nouă.
        </p>
        <Link href="/login" className="font-semibold text-secondary hover:underline">
          Mergi la autentificare
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-4"
    >
      <Field label="Token de resetare">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="lipit din link sau din pagina „Ai uitat parola?”"
          className={`${inputCls} font-mono text-xs`}
          required
        />
      </Field>

      <Field label="Parolă nouă">
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          maxLength={72}
          className={inputCls}
          required
        />
      </Field>

      <Field label="Confirmă parola nouă">
        <input
          type="password"
          autoComplete="new-password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          minLength={8}
          maxLength={72}
          className={inputCls}
          required
        />
      </Field>

      {error && <p className="text-sm font-medium text-tertiary">{error}</p>}

      <PrimaryButton type="submit" pending={pending}>
        Schimbă parola
      </PrimaryButton>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h2 className="font-heading text-lg font-bold text-primary">Resetează parola</h2>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
