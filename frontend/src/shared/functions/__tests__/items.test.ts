import { describe, expect, it } from "vitest";
import {
  itemTotal,
  totalEstimated,
  totalSpent,
  boughtCount,
  itemsForRoom,
  roomSubtotal,
  roomSpent,
  materialUnit,
} from "../items";
import { Item, ItemStatus, ItemOrigin, MaterialType } from "../../types";

let idCounter = 0;
function makeItem(overrides: Partial<Item> = {}): Item {
  idCounter += 1;
  return {
    id: `item-${idCounter}`,
    roomId: "room-1",
    name: "Test item",
    materialType: MaterialType.Gresie,
    source: "Magazin",
    status: ItemStatus.InAsteptare,
    quantity: 1,
    unitPrice: 10,
    origin: ItemOrigin.Manual,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("itemTotal", () => {
  it("calculează cantitate x preț unitar", () => {
    expect(itemTotal(makeItem({ quantity: 3, unitPrice: 10 }))).toBe(30);
  });

  it("returnează 0 pentru cantitate 0", () => {
    expect(itemTotal(makeItem({ quantity: 0, unitPrice: 100 }))).toBe(0);
  });

  it("returnează 0 pentru preț unitar 0", () => {
    expect(itemTotal(makeItem({ quantity: 5, unitPrice: 0 }))).toBe(0);
  });

  it("gestionează cantități fracționare (mp/ml)", () => {
    expect(itemTotal(makeItem({ quantity: 23.6, unitPrice: 15.5 }))).toBeCloseTo(365.8);
  });

  it("gestionează valori negative de cantitate (posibil corecție/retur)", () => {
    expect(itemTotal(makeItem({ quantity: -2, unitPrice: 10 }))).toBe(-20);
  });

  it("gestionează preț unitar negativ", () => {
    expect(itemTotal(makeItem({ quantity: 2, unitPrice: -5 }))).toBe(-10);
  });
});

describe("totalEstimated", () => {
  it("returnează 0 pentru listă goală", () => {
    expect(totalEstimated([])).toBe(0);
  });

  it("însumează un singur element", () => {
    expect(totalEstimated([makeItem({ quantity: 2, unitPrice: 5 })])).toBe(10);
  });

  it("însumează mai multe elemente indiferent de status", () => {
    const items = [
      makeItem({ quantity: 1, unitPrice: 10, status: ItemStatus.InAsteptare }),
      makeItem({ quantity: 2, unitPrice: 5, status: ItemStatus.Cumparat }),
      makeItem({ quantity: 1, unitPrice: 3, status: ItemStatus.Planificat }),
    ];
    expect(totalEstimated(items)).toBe(23);
  });

  it("ignoră statusul complet (include toate elementele)", () => {
    const items = [
      makeItem({ quantity: 1, unitPrice: 100, status: ItemStatus.InAsteptare }),
    ];
    expect(totalEstimated(items)).toBe(100);
  });
});

describe("totalSpent", () => {
  it("returnează 0 pentru listă goală", () => {
    expect(totalSpent([])).toBe(0);
  });

  it("returnează 0 dacă niciun element nu e Cumpărat", () => {
    const items = [
      makeItem({ quantity: 1, unitPrice: 10, status: ItemStatus.InAsteptare }),
      makeItem({ quantity: 1, unitPrice: 10, status: ItemStatus.Planificat }),
    ];
    expect(totalSpent(items)).toBe(0);
  });

  it("include DOAR elementele cu status Cumpărat, într-o listă mixtă", () => {
    const items = [
      makeItem({ quantity: 1, unitPrice: 10, status: ItemStatus.InAsteptare }),
      makeItem({ quantity: 2, unitPrice: 5, status: ItemStatus.Cumparat }),
      makeItem({ quantity: 1, unitPrice: 3, status: ItemStatus.Planificat }),
      makeItem({ quantity: 4, unitPrice: 2, status: ItemStatus.Cumparat }),
    ];
    // Cumparat: 2*5=10 + 4*2=8 => 18 (celelalte ignorate: 10, 3)
    expect(totalSpent(items)).toBe(18);
  });

  it("include toate elementele dacă toate sunt Cumpărat", () => {
    const items = [
      makeItem({ quantity: 1, unitPrice: 10, status: ItemStatus.Cumparat }),
      makeItem({ quantity: 1, unitPrice: 20, status: ItemStatus.Cumparat }),
    ];
    expect(totalSpent(items)).toBe(30);
  });
});

describe("boughtCount", () => {
  it("returnează 0 pentru listă goală", () => {
    expect(boughtCount([])).toBe(0);
  });

  it("returnează 0 dacă nimic nu e Cumpărat", () => {
    const items = [makeItem({ status: ItemStatus.InAsteptare }), makeItem({ status: ItemStatus.Planificat })];
    expect(boughtCount(items)).toBe(0);
  });

  it("numără doar elementele Cumpărat dintr-o listă mixtă", () => {
    const items = [
      makeItem({ status: ItemStatus.Cumparat }),
      makeItem({ status: ItemStatus.InAsteptare }),
      makeItem({ status: ItemStatus.Cumparat }),
      makeItem({ status: ItemStatus.Planificat }),
      makeItem({ status: ItemStatus.Cumparat }),
    ];
    expect(boughtCount(items)).toBe(3);
  });

  it("numără toate elementele dacă toate sunt Cumpărat", () => {
    const items = [makeItem({ status: ItemStatus.Cumparat }), makeItem({ status: ItemStatus.Cumparat })];
    expect(boughtCount(items)).toBe(2);
  });
});

describe("itemsForRoom", () => {
  it("returnează listă goală pentru listă goală de elemente", () => {
    expect(itemsForRoom([], "room-1")).toEqual([]);
  });

  it("filtrează corect elementele unei camere", () => {
    const items = [
      makeItem({ roomId: "room-1" }),
      makeItem({ roomId: "room-2" }),
      makeItem({ roomId: "room-1" }),
    ];
    expect(itemsForRoom(items, "room-1")).toHaveLength(2);
  });

  it("returnează listă goală pentru un roomId inexistent", () => {
    const items = [makeItem({ roomId: "room-1" }), makeItem({ roomId: "room-2" })];
    expect(itemsForRoom(items, "room-inexistent")).toEqual([]);
  });

  it("nu modifică lista originală (returnează un array nou filtrat)", () => {
    const items = [makeItem({ roomId: "room-1" })];
    const result = itemsForRoom(items, "room-1");
    expect(result).not.toBe(items);
  });
});

describe("roomSubtotal", () => {
  it("returnează 0 pentru o cameră fără elemente", () => {
    expect(roomSubtotal([], "room-1")).toBe(0);
  });

  it("returnează 0 pentru un roomId care nu apare în listă", () => {
    const items = [makeItem({ roomId: "room-2", quantity: 1, unitPrice: 100 })];
    expect(roomSubtotal(items, "room-1")).toBe(0);
  });

  it("însumează toate elementele camerei indiferent de status", () => {
    const items = [
      makeItem({ roomId: "room-1", quantity: 2, unitPrice: 10, status: ItemStatus.InAsteptare }),
      makeItem({ roomId: "room-1", quantity: 1, unitPrice: 5, status: ItemStatus.Cumparat }),
      makeItem({ roomId: "room-2", quantity: 100, unitPrice: 100, status: ItemStatus.Cumparat }),
    ];
    expect(roomSubtotal(items, "room-1")).toBe(25);
  });
});

describe("roomSpent", () => {
  it("returnează 0 pentru o cameră fără elemente", () => {
    expect(roomSpent([], "room-1")).toBe(0);
  });

  it("returnează 0 pentru un roomId inexistent", () => {
    const items = [makeItem({ roomId: "room-2", quantity: 1, unitPrice: 10, status: ItemStatus.Cumparat })];
    expect(roomSpent(items, "room-1")).toBe(0);
  });

  it("include doar elementele Cumpărat ale camerei respective", () => {
    const items = [
      makeItem({ roomId: "room-1", quantity: 2, unitPrice: 10, status: ItemStatus.Cumparat }),
      makeItem({ roomId: "room-1", quantity: 5, unitPrice: 10, status: ItemStatus.InAsteptare }),
      makeItem({ roomId: "room-2", quantity: 1, unitPrice: 1000, status: ItemStatus.Cumparat }),
    ];
    expect(roomSpent(items, "room-1")).toBe(20);
  });

  it("nu amestecă elementele altor camere Cumpărate", () => {
    const items = [
      makeItem({ roomId: "room-1", quantity: 1, unitPrice: 10, status: ItemStatus.Cumparat }),
      makeItem({ roomId: "room-2", quantity: 1, unitPrice: 500, status: ItemStatus.Cumparat }),
    ];
    expect(roomSpent(items, "room-1")).toBe(10);
    expect(roomSpent(items, "room-2")).toBe(500);
  });
});

describe("materialUnit", () => {
  it.each([
    [MaterialType.Gresie, "mp"],
    [MaterialType.Faianta, "mp"],
    [MaterialType.Parchet, "mp"],
    [MaterialType.Tapet, "mp"],
    [MaterialType.FolieParchet, "mp"],
    [MaterialType.Plinta, "ml"],
    [MaterialType.GlafFereastra, "ml"],
    [MaterialType.Vopsea, "l"],
    [MaterialType.Amorsa, "l"],
    [MaterialType.ChitRosturi, "kg"],
    [MaterialType.AdezivPlacari, "saci"],
    [MaterialType.Sanitare, "buc"],
    [MaterialType.Mobila, "buc"],
    [MaterialType.Electrocasnice, "buc"],
    [MaterialType.CorpuriIluminat, "buc"],
    [MaterialType.Altele, "buc"],
  ])("returnează unitatea '%s' -> '%s'", (materialType, expected) => {
    expect(materialUnit(materialType)).toBe(expected);
  });
});
