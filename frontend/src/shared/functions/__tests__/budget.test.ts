import { describe, expect, it } from "vitest";
import { budgetEfficiency } from "../budget";

describe("budgetEfficiency", () => {
  it("calculează procentul normal (spent < estimated)", () => {
    expect(budgetEfficiency(100, 50)).toBe(50);
  });

  it("rotunjește la cel mai apropiat număr întreg", () => {
    expect(budgetEfficiency(3, 1)).toBe(33);
  });

  it("rotunjește în sus la .5", () => {
    expect(budgetEfficiency(8, 3)).toBe(38); // 37.5 -> Math.round -> 38
  });

  it("returnează 100 când spent == estimated", () => {
    expect(budgetEfficiency(100, 100)).toBe(100);
  });

  it("returnează 0 pentru spent 0", () => {
    expect(budgetEfficiency(100, 0)).toBe(0);
  });

  it("returnează 0 când estimated este 0, indiferent de spent (evită împărțirea la zero)", () => {
    expect(budgetEfficiency(0, 0)).toBe(0);
    expect(budgetEfficiency(0, 500)).toBe(0);
  });

  it("returnează peste 100 când spent depășește estimated", () => {
    expect(budgetEfficiency(100, 150)).toBe(150);
  });

  it("gestionează depășiri mari", () => {
    expect(budgetEfficiency(10, 1000)).toBe(10000);
  });

  it("gestionează valori estimate negative ca truthy (nu trece prin ramura 0)", () => {
    expect(budgetEfficiency(-100, -50)).toBe(50);
  });

  it("gestionează spent negativ cu estimated pozitiv", () => {
    expect(budgetEfficiency(100, -50)).toBe(-50);
  });

  it("gestionează valori fracționare", () => {
    expect(budgetEfficiency(150.5, 75.25)).toBe(50);
  });

  it("returnează un întreg pentru valori foarte mici (evită NaN prin rotunjire)", () => {
    expect(Number.isInteger(budgetEfficiency(1000000, 1))).toBe(true);
  });
});
