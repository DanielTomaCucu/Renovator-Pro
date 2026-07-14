import { ItemOrigin } from "@/shared/types";
import { TECHNICAL_ICONS } from "@/shared/icons";

/** Capsulă mică ce marchează un element generat automat din „Configurare Apartament" (nu unul introdus manual). */
export default function OriginBadge({ origin }: { origin: ItemOrigin }) {
  if (origin !== ItemOrigin.Configurare) return null;

  return (
    <span
      className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-secondary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-secondary"
      title="Generat automat din Configurare Apartament"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
        {TECHNICAL_ICONS.calculatedResults}
      </span>
      Din Configurare
    </span>
  );
}
