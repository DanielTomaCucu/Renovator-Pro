import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

/**
 * Fallback la nivel de sursă pt. paginile/componentele care depind de `StoreProvider`/context de sesiune
 * (randare izolată ar necesita mock-uri grele de auth+backend, disproporționat pt. acest fix punctual).
 * Confirmă că toate câmpurile numerice zecimale identificate ca afectate de bug-ul "virgulă respinsă de
 * type=number" au fost migrate la `DecimalInput` (text + inputMode="decimal", vezi src/components/forms.tsx)
 * și că nu a mai rămas niciun `type="number"` folosit pt. preț/cantitate/dimensiuni în aceste fișiere.
 */
const root = path.resolve(__dirname, "../../..");

const files = [
  "src/app/comparator/[groupId]/OfferFormDrawer.tsx",
  "src/app/elemente/page.tsx",
  "src/app/configurare/RoomShapeWallsEditor.tsx",
  "src/app/configurare/RoomTechnicalCard.tsx",
  "src/app/configurare/page.tsx",
  "src/app/setari/page.tsx",
  "src/components/RoomFormDrawer.tsx",
  "src/components/ItemFormDrawer.tsx",
];

describe("Migrare inputuri numerice zecimale -> DecimalInput (fix virgulă RO)", () => {
  for (const relPath of files) {
    it(`${relPath}: importă DecimalInput și nu mai conține type="number"`, () => {
      const src = readFileSync(path.join(root, relPath), "utf8");
      expect(src).toContain("DecimalInput");
      expect(src).not.toMatch(/type="number"/);
    });
  }
});
