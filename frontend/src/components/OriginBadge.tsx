import { ItemOrigin } from "@/shared/types";
import { COMPARATOR_ICONS, TECHNICAL_ICONS } from "@/shared/icons";

/** Capsulă mică ce marchează un element NEintrodus manual: generat din Configurare, sau ales din Comparator. */
export default function OriginBadge({ origin }: { origin: ItemOrigin }) {
  if (origin === ItemOrigin.Configurare) {
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

  if (origin === ItemOrigin.Comparator) {
    return (
      <span
        className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700"
        title="Ales din Comparatorul de Oferte"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
          {COMPARATOR_ICONS.chosen}
        </span>
        Din Comparator
      </span>
    );
  }

  return null;
}
