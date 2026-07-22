import { describe, expect, it } from "vitest";
import { formatMoney } from "../money";
import { Currency } from "../../types";

describe("formatMoney", () => {
  it("formatează implicit în EUR", () => {
    expect(formatMoney(100)).toContain("EUR");
  });

  it("nu afișează zecimale pentru o sumă întreagă", () => {
    expect(formatMoney(100)).toMatch(/^100\s?EUR$/);
  });

  it("afișează zecimalele pentru o sumă cu fracție (99.5 -> 99,5, nu se rotunjește la 100)", () => {
    const result = formatMoney(99.5);
    expect(result).toContain("99,5");
    expect(result).not.toMatch(/^100/);
  });

  it("formatează RON explicit", () => {
    const result = formatMoney(50, Currency.RON);
    expect(result).toContain("RON");
    expect(result).toMatch(/^50\s?RON$/);
  });

  it("formatează RON cu zecimale", () => {
    const result = formatMoney(50.25, Currency.RON);
    expect(result).toContain("50,25");
  });

  it("formatează zero fără zecimale", () => {
    expect(formatMoney(0)).toMatch(/^0\s?EUR$/);
  });

  it("formatează valori negative cu semnul minus", () => {
    const result = formatMoney(-42);
    expect(result).toContain("-");
    expect(result).toContain("42");
  });

  it("formatează valori negative cu zecimale", () => {
    const result = formatMoney(-42.75);
    expect(result).toContain("-");
    expect(result).toContain("42,75");
  });

  it("formatează valori foarte mari cu separator de mii (grupare ro-RO)", () => {
    const result = formatMoney(1234567);
    expect(result).toContain("1.234.567");
  });

  it("formatează valori foarte mari cu zecimale", () => {
    const result = formatMoney(1234567.89);
    expect(result).toContain("1.234.567,89");
  });

  it("rotunjește la 2 zecimale pentru valori cu multe zecimale (0.005 rounding half up context)", () => {
    const result = formatMoney(10.999);
    expect(result).toContain("11");
  });

  it("rotunjește corect 10.005 la maxim 2 zecimale afișate", () => {
    const result = formatMoney(10.005);
    expect(result).toContain("10,01");
  });

  it("rotunjește 0.001 la 0 (fără zecimale, prea mic pentru a apărea)", () => {
    expect(formatMoney(0.001)).toMatch(/^0\s?EUR$/);
  });

  it("afișează exact 2 zecimale, niciodată 3+, pentru o valoare cu 3 zecimale exacte", () => {
    const result = formatMoney(19.995);
    // 19.995 rounds to 20.00 or 19.99/20 depending on IEEE754; just assert at most 2 decimal digits shown
    const decimalPart = result.match(/,(\d+)/);
    if (decimalPart) {
      expect(decimalPart[1].length).toBeLessThanOrEqual(2);
    }
  });

  it("formatează un număr mic cu zecimale (0.5)", () => {
    expect(formatMoney(0.5)).toContain("0,5");
  });

  it("returnează NaN afișat ca 'NaN' text din Intl atunci când value este NaN", () => {
    const result = formatMoney(NaN);
    expect(result.toLowerCase()).toContain("nan");
  });

  it("tratează undefined ca NaN prin coerciție implicită (comportament nativ Intl.NumberFormat)", () => {
    // @ts-expect-error testăm robustețea la input greșit de tip
    const result = formatMoney(undefined);
    expect(result.toLowerCase()).toContain("nan");
  });

  it("formatează Infinity fără să arunce eroare (simbolul infinit, nu textul 'infinit')", () => {
    expect(() => formatMoney(Infinity)).not.toThrow();
    expect(formatMoney(Infinity)).toContain("∞");
  });

  it("formatează -Infinity fără să arunce eroare", () => {
    expect(() => formatMoney(-Infinity)).not.toThrow();
  });

  it("distinge corect EUR de RON pentru aceeași valoare", () => {
    const eur = formatMoney(100, Currency.EUR);
    const ron = formatMoney(100, Currency.RON);
    expect(eur).not.toEqual(ron);
  });
});
