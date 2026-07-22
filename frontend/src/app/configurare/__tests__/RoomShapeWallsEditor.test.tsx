import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RoomShape, Wall } from "@/shared/types";
import { RoomShapeLengthInputs } from "../RoomShapeWallsEditor";

/** Wrapper controlat pt. forma Pătrat — un singur input "Latura camerei (m)". */
function ControlledSquare() {
  const [wallLengths, setWallLengths] = useState<Record<Wall, number>>({
    [Wall.Nord]: 0,
    [Wall.Sud]: 0,
    [Wall.Est]: 0,
    [Wall.Vest]: 0,
  });
  return (
    <RoomShapeLengthInputs
      shape={RoomShape.Patrat}
      wallLengths={wallLengths}
      onChangeLengths={setWallLengths}
    />
  );
}

describe("RoomShapeLengthInputs (Pătrat) — DecimalInput regression", () => {
  it("acceptă virgula ca separator zecimal la 'Latura camerei' (bug raportat: prețul/dimensiunea cu ',' nu se salva)", () => {
    render(<ControlledSquare />);
    const input = screen.getByPlaceholderText("ex: 2.40") as HTMLInputElement;

    // Câmpul e legat de un `number` în state (nu un string), deci simulăm o singură scriere
    // (ex. lipire) — evită round-trip-ul prin Number() la fiecare literă tastată, care nu ține
    // de bug-ul testat aici (acceptarea virgulei ca separator zecimal).
    fireEvent.change(input, { target: { value: "2,45" } });

    // Valoarea normalizată la punct trebuie să ajungă înapoi în input (via onChangeLengths -> state -> value).
    expect(input.value).toBe("2.45");
  });

  it("nu (mai) este un input type=number nativ — acceptă text cu virgulă direct în DOM", () => {
    render(<ControlledSquare />);
    const input = screen.getByPlaceholderText("ex: 2.40") as HTMLInputElement;
    expect(input.type).toBe("text");
    expect(input.getAttribute("inputmode")).toBe("decimal");
  });
});
