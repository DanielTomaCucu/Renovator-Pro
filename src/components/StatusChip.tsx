import { ItemStatus } from "@/shared/types";

const styles: Record<ItemStatus, string> = {
  [ItemStatus.Cumparat]: "bg-emerald-100 text-emerald-700",
  [ItemStatus.InAsteptare]: "bg-amber-100 text-amber-700",
  [ItemStatus.Planificat]: "bg-sky-100 text-sky-700",
};

export default function StatusChip({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}
