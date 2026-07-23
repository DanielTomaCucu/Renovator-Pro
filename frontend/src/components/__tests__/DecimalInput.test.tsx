import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecimalInput } from "../forms";

/** Wrapper controlat — simulează exact cum e folosit componenta în formulare reale (useState + onChange). */
function ControlledDecimalInput({ initial = "", placeholder }: { initial?: string; placeholder?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <DecimalInput value={value} onChange={setValue} placeholder={placeholder} />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("DecimalInput", () => {
  it("acceptă virgulă și o normalizează la punct (bug raportat: prețul cu ',' nu se salva)", async () => {
    const user = userEvent.setup();
    render(<ControlledDecimalInput placeholder="ex: 0.00" />);
    await user.type(screen.getByPlaceholderText("ex: 0.00"), "12,50");

    expect(screen.getByTestId("value")).toHaveTextContent("12.50");
    expect(Number(screen.getByTestId("value").textContent)).toBeCloseTo(12.5);
  });

  it("acceptă punct direct", async () => {
    const user = userEvent.setup();
    render(<ControlledDecimalInput />);
    await user.type(screen.getByRole("textbox"), "3.5");
    expect(screen.getByTestId("value")).toHaveTextContent("3.5");
  });

  it("respinge caractere non-numerice (litere)", async () => {
    const user = userEvent.setup();
    render(<ControlledDecimalInput />);
    await user.type(screen.getByRole("textbox"), "abc");
    expect(screen.getByTestId("value")).toHaveTextContent("");
  });

  it("permite un câmp gol (ștergere completă)", async () => {
    const user = userEvent.setup();
    render(<ControlledDecimalInput initial="5" />);
    await user.clear(screen.getByRole("textbox"));
    expect(screen.getByTestId("value")).toHaveTextContent("");
  });

  it("respinge a doua virgulă/punct (nu produce stări invalide gen '1.2.3')", async () => {
    const user = userEvent.setup();
    render(<ControlledDecimalInput initial="1.2" />);
    await user.type(screen.getByRole("textbox"), ".");
    expect(screen.getByTestId("value")).toHaveTextContent("1.2");
  });

  it("suportă cifre zecimale multiple după virgulă", async () => {
    const user = userEvent.setup();
    render(<ControlledDecimalInput />);
    await user.type(screen.getByRole("textbox"), "1234,999");
    expect(screen.getByTestId("value")).toHaveTextContent("1234.999");
  });
});
