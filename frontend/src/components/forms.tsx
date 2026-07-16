"use client";

import { type ReactNode } from "react";
import Spinner from "./Spinner";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-secondary";

export function PrimaryButton({
  children,
  pending = false,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean }) {
  return (
    <button
      {...props}
      disabled={disabled || pending}
      aria-busy={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending && <Spinner />}
      {children}
    </button>
  );
}
