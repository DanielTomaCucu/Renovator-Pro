import { ComparisonGroupStatus } from "@/shared/types";

const styles: Record<ComparisonGroupStatus, string> = {
  [ComparisonGroupStatus.InAnaliza]: "bg-sky-100 text-sky-700",
  [ComparisonGroupStatus.Decis]: "bg-emerald-100 text-emerald-700",
};

/** Capsulă de status pentru un grup de comparație — aceeași formă vizuală ca `StatusChip` (StatusChip rămâne specific `ItemStatus`). */
export default function ComparisonGroupStatusChip({
  status,
  size = "md",
}: {
  status: ComparisonGroupStatus;
  size?: "sm" | "md";
}) {
  const sizeCls =
    size === "sm" ? "px-2 py-0.5 text-[9px] font-medium" : "px-2.5 py-0.5 text-[11px] font-bold";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full uppercase tracking-wide ${sizeCls} ${styles[status]}`}
    >
      {status}
    </span>
  );
}
