import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoomFormDrawer from "../RoomFormDrawer";

const addRoom = vi.fn();
const updateRoom = vi.fn();

vi.mock("@/shared/store", () => ({
  useStore: () => ({ addRoom, updateRoom }),
}));

describe("RoomFormDrawer — Buget alocat (regresie virgulă)", () => {
  it("acceptă virgulă în câmpul Buget alocat și trimite valoarea numerică corectă la submit", async () => {
    const user = userEvent.setup();
    render(<RoomFormDrawer open onClose={() => {}} />);

    const budgetInput = screen.getByPlaceholderText("ex: 1200");
    await user.type(budgetInput, "1234,56");
    expect(budgetInput).toHaveValue("1234.56");

    await user.type(screen.getByPlaceholderText("Ex: Dormitor Oaspeți"), "Living");
    await user.click(screen.getByRole("button", { name: /salvează camera/i }));

    expect(addRoom).toHaveBeenCalledWith(
      expect.objectContaining({ allocatedBudget: 1234.56 })
    );
  });
});

describe("RoomFormDrawer — iconițe tip cameră (Material Symbols, nu emoji)", () => {
  it("folosește iconițele Material Symbols din shared/icons, consecvente cu restul aplicației", () => {
    render(<RoomFormDrawer open onClose={() => {}} />);

    // ROOM_TYPE_ICONS (shared/icons.ts): king_bed/bathtub/chair/soup_kitchen/deck/balcony —
    // niciun emoji (🛏️🛁🛋️🍳🌿🪟) nu mai trebuie să apară în grid-ul de tip cameră.
    expect(document.querySelectorAll(".material-symbols-outlined").length).toBeGreaterThanOrEqual(6);
    expect(screen.getByText("king_bed")).toBeInTheDocument();
    expect(screen.getByText("bathtub")).toBeInTheDocument();
    expect(screen.getByText("chair")).toBeInTheDocument();
    expect(screen.getByText("soup_kitchen")).toBeInTheDocument();
    expect(screen.getByText("deck")).toBeInTheDocument();
    expect(screen.getByText("balcony")).toBeInTheDocument();
    expect(screen.queryByText("🛏️")).not.toBeInTheDocument();
  });
});
