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
