import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoomTechnicalCard from "../RoomTechnicalCard";
import { RoomType } from "@/shared/types";
import type { Room } from "@/shared/types";

vi.mock("@/shared/store", () => ({
  useStore: () => ({ updateRoom: vi.fn(), deleteRoom: vi.fn() }),
}));

const room: Room = {
  id: "r1",
  type: RoomType.Dormitor,
  name: "Dormitor",
  allocatedBudget: 0,
};

describe("RoomTechnicalCard — Suprafață (MP) (regresie virgulă)", () => {
  it("acceptă virgulă în câmpul Suprafață și o normalizează la punct", async () => {
    const user = userEvent.setup();
    render(<RoomTechnicalCard room={room} />);

    // Deschide cardul, apoi secțiunea „Pardoseală”. Folosim heading-ul cu numele camerei (nu un
    // rol "button" — există și un buton "Editează camera Dormitor" care ar da match ambiguu pe /dormitor/i).
    await user.click(screen.getByRole("heading", { name: "Dormitor" }));
    await user.click(screen.getByText(/Pardoseală/i));

    // Lipire/autofill dintr-o singură scriere.
    const areaInput = screen.getByPlaceholderText("ex: 5.40");
    fireEvent.change(areaInput, { target: { value: "12,5" } });

    expect(areaInput).toHaveValue("12.5");
  });

  it("nu pierde punctul zecimal la tastare caracter-cu-caracter (câmpul e legat de un number din draft, care face round-trip prin Number() la fiecare literă)", async () => {
    const user = userEvent.setup();
    render(<RoomTechnicalCard room={room} />);

    await user.click(screen.getByRole("heading", { name: "Dormitor" }));
    await user.click(screen.getByText(/Pardoseală/i));

    const areaInput = screen.getByPlaceholderText("ex: 5.40");
    await user.type(areaInput, "12,5");

    expect(areaInput).toHaveValue("12.5");
  });
});
