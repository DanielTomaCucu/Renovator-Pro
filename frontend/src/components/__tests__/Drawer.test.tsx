import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Drawer from "../Drawer";

// Regresie: pe iOS Safari, un `onClick` simplu pe backdrop nu se declanșează mereu fiabil la tap real
// (deși funcționează perfect cu click de mouse) — Drawer trebuie să închidă și pe `pointerup`.
describe("Drawer — închidere prin atingerea fundalului (backdrop)", () => {
  it("apelează onClose la click pe backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Drawer open title="Titlu" onClose={onClose}>
        <p>Conținut</p>
      </Drawer>
    );
    const backdrop = container.querySelector(".bg-black\\/40")!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("apelează onClose la pointerup pe backdrop (tap real pe iOS)", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Drawer open title="Titlu" onClose={onClose}>
        <p>Conținut</p>
      </Drawer>
    );
    const backdrop = container.querySelector(".bg-black\\/40")!;
    fireEvent.pointerUp(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("NU apelează onClose la click/pointerup în interiorul sheet-ului (conținut)", () => {
    const onClose = vi.fn();
    const { getByText } = render(
      <Drawer open title="Titlu" onClose={onClose}>
        <p>Conținut</p>
      </Drawer>
    );
    const content = getByText("Conținut");
    fireEvent.click(content);
    fireEvent.pointerUp(content);
    expect(onClose).not.toHaveBeenCalled();
  });
});

// Cerere explicită user: pe mobil, zona de tragere (bara) era singurul loc din header care închidea
// la atingere — restul header-ului (titlul) nu reacționa la tap. Extindem zona de închidere la tot
// header-ul (titlu inclus), nu doar bara mică de deasupra lui.
describe("Drawer — închidere prin atingerea header-ului (titlu)", () => {
  it("apelează onClose la click pe titlu", () => {
    const onClose = vi.fn();
    const { getByText } = render(
      <Drawer open title="Adaugă Element Nou" onClose={onClose}>
        <p>Conținut</p>
      </Drawer>
    );
    fireEvent.click(getByText("Adaugă Element Nou"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("apelează onClose la pointerup pe titlu (tap real pe iOS)", () => {
    const onClose = vi.fn();
    const { getByText } = render(
      <Drawer open title="Adaugă Element Nou" onClose={onClose}>
        <p>Conținut</p>
      </Drawer>
    );
    fireEvent.pointerUp(getByText("Adaugă Element Nou"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
