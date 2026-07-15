import { ItemStatus } from "@/shared/types";
import { STATUS_ICONS } from "@/shared/icons";

const styles: Record<ItemStatus, string> = {
  [ItemStatus.Cumparat]: "bg-emerald-100 text-emerald-700",
  [ItemStatus.InAsteptare]: "bg-amber-100 text-amber-700",
  [ItemStatus.Planificat]: "bg-sky-100 text-sky-700",
};

export default function StatusChip({
  status,
  size = "md",
}: {
  status: ItemStatus;
  size?: "sm" | "md";
}) {
  const sizeCls =
    size === "sm"
      ? "px-2 py-0.5 text-[9px] font-medium gap-0.5"
      : "px-2.5 py-0.5 text-[11px] font-bold gap-1";
  const iconSize = size === "sm" ? 10 : 12;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full uppercase tracking-wide ${sizeCls} ${styles[status]}`}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: iconSize,
          fontVariationSettings: `"FILL" 0, "wght" 400, "GRAD" 0, "opsz" ${iconSize}`,
        }}
      >
        {STATUS_ICONS[status]}
      </span>
      {status}
    </span>
  );
}
