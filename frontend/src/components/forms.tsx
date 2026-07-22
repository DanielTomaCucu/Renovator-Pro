"use client";

import { type ReactNode, useState } from "react";
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

/**
 * Input numeric zecimal care acceptă ȘI virgulă ca separator (tastatură RO) — `type="number"` nativ
 * respinge virgula indiferent de `lang="ro"` (formatul e mereu cu punct, per spec HTML), ceea ce lasă
 * câmpul gol/invalid la tastare și prețul/cantitatea salvată devine tăcut 0. Normalizează la punct intern,
 * păstrează stări intermediare de tastare valide ("", "12", "12.", "12.5").
 */
export function DecimalInput({
  value,
  onChange,
  className,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  // State local, resincronizat din prop DOAR când valoarea numerică s-a schimbat cu adevărat din afară
  // (nu ecoul propriului onChange, dus prin Number() și înapoi la string de un consumator care ține
  // draftul ca number) — altfel "12," devine "12" la fiecare literă tastată și punctul zecimal se
  // pierde în timpul tastării ("12." → Number → 12 → "12", urmat de "5" dă "125" în loc de "12.5").
  // Pattern „adjusting state during render" (nu useEffect), la fel ca în ItemFormDrawer/RoomFormDrawer.
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (Number(value || 0) !== Number(draft || 0)) setDraft(value);
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      className={className ?? `${inputCls} font-mono`}
      value={draft}
      onChange={(e) => {
        const raw = e.target.value.replace(",", ".");
        if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
          setDraft(raw);
          onChange(raw);
        }
      }}
    />
  );
}

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
