import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OfferFormDrawer from "../OfferFormDrawer";

const addOffer = vi.fn();
const updateOffer = vi.fn();

vi.mock("@/shared/store", () => ({
  useStore: () => ({ addOffer, updateOffer }),
}));

// Leaflet manipulează DOM-ul direct și cere geolocation/rețea reală — mockuit ca să testăm doar
// integrarea (butonul deschide harta, confirmarea completează câmpul Magazin), nu Leaflet însuși.
vi.mock("../StoreLocationPicker", () => ({
  default: ({ onConfirm, onCancel }: { onConfirm: (name: string) => void; onCancel: () => void }) => (
    <div data-testid="store-picker">
      <button onClick={() => onConfirm("Dedeman Detectat")}>confirmă-mock</button>
      <button onClick={onCancel}>anulează-mock</button>
    </div>
  ),
}));

describe("OfferFormDrawer — alegerea magazinului pe hartă", () => {
  it("butonul de locație deschide StoreLocationPicker, ascuns implicit", () => {
    render(<OfferFormDrawer state={{ open: true }} groupId="g1" onClose={() => {}} />);
    expect(screen.queryByTestId("store-picker")).not.toBeInTheDocument();

    userEvent.setup().click(screen.getByTitle("Alege magazinul pe hartă"));
  });

  it("confirmarea din hartă completează câmpul Magazin și închide harta", async () => {
    const user = userEvent.setup();
    render(<OfferFormDrawer state={{ open: true }} groupId="g1" onClose={() => {}} />);

    await user.click(screen.getByTitle("Alege magazinul pe hartă"));
    expect(screen.getByTestId("store-picker")).toBeInTheDocument();

    await user.click(screen.getByText("confirmă-mock"));

    expect(screen.queryByTestId("store-picker")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex: Dedeman")).toHaveValue("Dedeman Detectat");
  });

  it("anularea din hartă NU modifică câmpul Magazin", async () => {
    const user = userEvent.setup();
    render(<OfferFormDrawer state={{ open: true }} groupId="g1" onClose={() => {}} />);

    await user.click(screen.getByTitle("Alege magazinul pe hartă"));
    await user.click(screen.getByText("anulează-mock"));

    expect(screen.queryByTestId("store-picker")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex: Dedeman")).toHaveValue("");
  });
});
