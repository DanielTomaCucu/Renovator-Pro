import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Stare goală reutilizată de toate paginile principale (Elemente/Configurare/Tabel/Grafice) când
 * proiectul nu are încă nicio cameră — un card gol fără text era percepută ca „aplicație stricată",
 * nu ca „nu ai date încă". Icon + mesaj + CTA spre `/configurare` (unde se adaugă prima cameră).
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const action = actionLabel ? (
    <>
      {actionHref ? (
        <Link
          href={actionHref}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </>
  ) : null;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <span className="material-symbols-outlined text-5xl text-muted/40">{icon}</span>
      <h3 className="font-heading text-base font-bold text-primary">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {action as ReactNode}
    </div>
  );
}
