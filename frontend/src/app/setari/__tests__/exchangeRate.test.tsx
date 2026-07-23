import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Currency } from "@/shared/types";

const updateProject = vi.fn();
const convertCurrency = vi.fn();

vi.mock("@/shared/store", () => ({
  useStore: () => ({
    project: { id: "p1", title: "Proiect", totalBudget: 1000, currency: Currency.EUR },
    updateProject,
    convertCurrency,
  }),
}));

vi.mock("@/components/ProjectSharingCard", () => ({ default: () => null }));
vi.mock("@/components/ProjectSwitcherCard", () => ({ default: () => null }));

const getExchangeRate = vi.fn();
vi.mock("@/shared/api-client", () => ({
  exchangeRateApi: { get: (...args: unknown[]) => getExchangeRate(...args) },
}));

describe("Setări — curs valutar automat", () => {
  beforeEach(() => {
    getExchangeRate.mockReset();
  });

  it("preîncarcă cursul de la API și îl marchează ca automat (BNR)", async () => {
    getExchangeRate.mockResolvedValue({ rate: 4.98, fetchedAt: "2026-07-23T06:00:00Z", source: "BNR" });
    const SetariPage = (await import("../page")).default;
    render(<SetariPage />);

    // Comută pe RON ca să apară secțiunea de curs valutar (conversionNeeded).
    await userEvent.setup().click(screen.getByRole("button", { name: /lei \(ron\)/i }));

    await waitFor(() => expect(screen.getByText(/curs automat \(bnr\)/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText("4.97")).toHaveValue("4.98");
  });

  it("la editare manuală, badge-ul trece pe 'introdus manual' și nu mai e suprascris de API", async () => {
    getExchangeRate.mockResolvedValue({ rate: 4.98, fetchedAt: "2026-07-23T06:00:00Z", source: "BNR" });
    const SetariPage = (await import("../page")).default;
    const user = userEvent.setup();
    render(<SetariPage />);

    await user.click(screen.getByRole("button", { name: /lei \(ron\)/i }));
    await waitFor(() => expect(screen.getByText(/curs automat \(bnr\)/i)).toBeInTheDocument());

    const input = screen.getByPlaceholderText("4.97");
    await user.clear(input);
    await user.type(input, "5,10");

    expect(screen.getByText(/introdus manual/i)).toBeInTheDocument();
    expect(input).toHaveValue("5.10");
  });

  it("dacă API-ul eșuează, arată eroare și lasă câmpul editabil manual (fallback 4.97)", async () => {
    getExchangeRate.mockRejectedValue(new Error("502"));
    const SetariPage = (await import("../page")).default;
    render(<SetariPage />);

    await userEvent.setup().click(screen.getByRole("button", { name: /lei \(ron\)/i }));

    await waitFor(() => expect(screen.getByText(/nu e disponibil/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText("4.97")).toHaveValue("4.97");
  });
});
