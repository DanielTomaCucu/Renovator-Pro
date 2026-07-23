import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

vi.mock("@/shared/AuthProvider", () => ({
  useAuth: () => ({ session: { user: { id: "u1", username: "test" } } }),
}));

const getExchangeRate = vi.fn();
vi.mock("@/shared/api-client", () => ({
  exchangeRateApi: { get: (...args: unknown[]) => getExchangeRate(...args) },
}));

// Cerință user: caseta de curs valutar se arată când e selectat EURO (implicit la montare, indiferent
// de moneda curentă a proiectului), NU când e selectat LEI — invers față de comportamentul inițial
// (care o lega de "conversie efectiv necesară"). Conversia REALĂ (convertCurrency) rămâne neschimbată:
// se declanșează doar când moneda selectată diferă efectiv de cea curentă a proiectului.
describe("Setări — curs valutar automat", () => {
  beforeEach(() => {
    getExchangeRate.mockReset();
  });

  it("preîncarcă cursul de la API și îl marchează ca automat (BNR), vizibil implicit pe EURO", async () => {
    getExchangeRate.mockResolvedValue({ rate: 4.98, fetchedAt: "2026-07-23T06:00:00Z", source: "BNR" });
    const SetariPage = (await import("../page")).default;
    render(<SetariPage />);

    await waitFor(() => expect(screen.getByText(/automat \(bnr\)/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText("4.97")).toHaveValue("4.98");
  });

  it("caseta dispare când e selectat LEI (RON)", async () => {
    getExchangeRate.mockResolvedValue({ rate: 4.98, fetchedAt: "2026-07-23T06:00:00Z", source: "BNR" });
    const SetariPage = (await import("../page")).default;
    render(<SetariPage />);
    await waitFor(() => expect(screen.getByText(/automat \(bnr\)/i)).toBeInTheDocument());

    await userEvent.setup().click(screen.getByRole("button", { name: /lei \(ron\)/i }));

    expect(screen.queryByPlaceholderText("4.97")).not.toBeInTheDocument();
  });

  it("la editare manuală, badge-ul trece pe 'introdus manual' și nu mai e suprascris de API", async () => {
    getExchangeRate.mockResolvedValue({ rate: 4.98, fetchedAt: "2026-07-23T06:00:00Z", source: "BNR" });
    const SetariPage = (await import("../page")).default;
    render(<SetariPage />);

    await waitFor(() => expect(screen.getByText(/automat \(bnr\)/i)).toBeInTheDocument());

    // Lipire/autofill dintr-o singură scriere (consecvent cu testele similare din RoomTechnicalCard —
    // evită particularitățile tastării caracter-cu-caracter simulate în happy-dom pe câmpuri controlate).
    const input = screen.getByPlaceholderText("4.97");
    fireEvent.change(input, { target: { value: "5,10" } });

    expect(screen.getByText(/introdus manual/i)).toBeInTheDocument();
    expect(input).toHaveValue("5.10");
  });

  it("dacă API-ul eșuează, arată eroare și lasă câmpul editabil manual (fallback 4.97)", async () => {
    getExchangeRate.mockRejectedValue(new Error("502"));
    const SetariPage = (await import("../page")).default;
    render(<SetariPage />);

    await waitFor(() => expect(screen.getByText(/indisponibil/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText("4.97")).toHaveValue("4.97");
  });
});
