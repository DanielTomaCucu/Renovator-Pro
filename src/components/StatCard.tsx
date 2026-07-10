export default function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "default" | "secondary" | "tertiary";
}) {
  const valueColor =
    accent === "secondary"
      ? "text-secondary"
      : accent === "tertiary"
        ? "text-tertiary"
        : "text-foreground";

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className={`mt-2 font-mono text-2xl font-semibold ${valueColor}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
