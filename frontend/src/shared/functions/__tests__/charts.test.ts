import { describe, expect, it } from "vitest";
import { donutSegments, timelinePoints } from "../charts";
import { SpendingTimelinePoint } from "../../types";

describe("donutSegments", () => {
  it("returnează listă goală pentru date goale", () => {
    expect(donutSegments([])).toEqual([]);
  });

  it("returnează listă goală când suma totalurilor este 0 (evită împărțirea la zero)", () => {
    expect(donutSegments([{ name: "A", total: 0 }, { name: "B", total: 0 }])).toEqual([]);
  });

  it("un singur segment acoperă 0 -> 1 (100%)", () => {
    const result = donutSegments([{ name: "A", total: 100 }]);
    expect(result).toHaveLength(1);
    expect(result[0].start).toBe(0);
    expect(result[0].end).toBe(1);
  });

  it("două segmente egale se împart 0-0.5 și 0.5-1", () => {
    const result = donutSegments([
      { name: "A", total: 50 },
      { name: "B", total: 50 },
    ]);
    expect(result[0].start).toBe(0);
    expect(result[0].end).toBeCloseTo(0.5);
    expect(result[1].start).toBeCloseTo(0.5);
    expect(result[1].end).toBeCloseTo(1);
  });

  it("segmentele sunt cumulative, contigue (end[i] === start[i+1])", () => {
    const result = donutSegments([
      { name: "A", total: 10 },
      { name: "B", total: 20 },
      { name: "C", total: 70 },
    ]);
    expect(result[0].end).toBeCloseTo(result[1].start);
    expect(result[1].end).toBeCloseTo(result[2].start);
  });

  it("suma fracțiilor (end final) acoperă cercul complet = 1", () => {
    const result = donutSegments([
      { name: "A", total: 10 },
      { name: "B", total: 20 },
      { name: "C", total: 70 },
    ]);
    expect(result[result.length - 1].end).toBeCloseTo(1);
  });

  it("păstrează proporțiile corecte pentru 3 segmente inegale", () => {
    const result = donutSegments([
      { name: "A", total: 25 },
      { name: "B", total: 25 },
      { name: "C", total: 50 },
    ]);
    expect(result[0].end - result[0].start).toBeCloseTo(0.25);
    expect(result[1].end - result[1].start).toBeCloseTo(0.25);
    expect(result[2].end - result[2].start).toBeCloseTo(0.5);
  });

  it("un segment cu total 0 în mijlocul listei produce un interval de lungime 0", () => {
    const result = donutSegments([
      { name: "A", total: 50 },
      { name: "B", total: 0 },
      { name: "C", total: 50 },
    ]);
    expect(result[1].start).toBeCloseTo(result[1].end);
  });

  it("păstrează name și total în segmentul rezultat", () => {
    const result = donutSegments([{ name: "Living", total: 42 }]);
    expect(result[0].name).toBe("Living");
    expect(result[0].total).toBe(42);
  });

  it("gestionează un singur element cu total negativ (sumă negativă, geometrie degenerată dar fără crash)", () => {
    expect(() => donutSegments([{ name: "A", total: -10 }])).not.toThrow();
  });
});

function makePoint(overrides: Partial<SpendingTimelinePoint> = {}): SpendingTimelinePoint {
  return { month: "2026-01", cumulativeSpent: 0, cumulativeTotal: 0, ...overrides };
}

describe("timelinePoints", () => {
  it("returnează listă goală pentru date goale", () => {
    expect(timelinePoints([])).toEqual([]);
  });

  it("un singur punct are x = 0", () => {
    const result = timelinePoints([makePoint({ cumulativeSpent: 50, cumulativeTotal: 100 })]);
    expect(result[0].x).toBe(0);
  });

  it("un singur punct normalizează y relativ la propriul max (ySpent/yTotal <= 1)", () => {
    const result = timelinePoints([makePoint({ cumulativeSpent: 50, cumulativeTotal: 100 })]);
    expect(result[0].yTotal).toBe(1);
    expect(result[0].ySpent).toBeCloseTo(0.5);
  });

  it("primul punct are x=0, ultimul are x=1, pentru mai multe puncte", () => {
    const data = [
      makePoint({ month: "2026-01", cumulativeSpent: 10, cumulativeTotal: 20 }),
      makePoint({ month: "2026-02", cumulativeSpent: 20, cumulativeTotal: 40 }),
      makePoint({ month: "2026-03", cumulativeSpent: 30, cumulativeTotal: 60 }),
    ];
    const result = timelinePoints(data);
    expect(result[0].x).toBe(0);
    expect(result[2].x).toBe(1);
    expect(result[1].x).toBeCloseTo(0.5);
  });

  it("scalează ySpent și yTotal pe același max (cumulativeTotal maxim din serie)", () => {
    const data = [
      makePoint({ cumulativeSpent: 10, cumulativeTotal: 50 }),
      makePoint({ cumulativeSpent: 40, cumulativeTotal: 100 }),
    ];
    const result = timelinePoints(data);
    expect(result[1].yTotal).toBe(1);
    expect(result[0].yTotal).toBeCloseTo(0.5);
    expect(result[0].ySpent).toBeCloseTo(0.1);
    expect(result[1].ySpent).toBeCloseTo(0.4);
  });

  it("toate valorile y rămân în intervalul [0,1]", () => {
    const data = [
      makePoint({ cumulativeSpent: 0, cumulativeTotal: 10 }),
      makePoint({ cumulativeSpent: 5, cumulativeTotal: 30 }),
      makePoint({ cumulativeSpent: 30, cumulativeTotal: 30 }),
    ];
    const result = timelinePoints(data);
    for (const p of result) {
      expect(p.ySpent).toBeGreaterThanOrEqual(0);
      expect(p.ySpent).toBeLessThanOrEqual(1);
      expect(p.yTotal).toBeGreaterThanOrEqual(0);
      expect(p.yTotal).toBeLessThanOrEqual(1);
    }
  });

  it("dacă toate cumulativeTotal sunt 0, y-urile rămân 0 (evită împărțirea la zero)", () => {
    const data = [makePoint({ cumulativeSpent: 0, cumulativeTotal: 0 }), makePoint({ cumulativeSpent: 0, cumulativeTotal: 0 })];
    const result = timelinePoints(data);
    expect(result[0].ySpent).toBe(0);
    expect(result[0].yTotal).toBe(0);
    expect(result[1].ySpent).toBe(0);
    expect(result[1].yTotal).toBe(0);
  });

  it("păstrează month, cumulativeSpent, cumulativeTotal originale în output", () => {
    const data = [makePoint({ month: "2026-05", cumulativeSpent: 7, cumulativeTotal: 9 })];
    const result = timelinePoints(data);
    expect(result[0].month).toBe("2026-05");
    expect(result[0].cumulativeSpent).toBe(7);
    expect(result[0].cumulativeTotal).toBe(9);
  });

  it("gestionează cumulativeSpent egal cu cumulativeTotal (ySpent === yTotal)", () => {
    const result = timelinePoints([makePoint({ cumulativeSpent: 20, cumulativeTotal: 20 })]);
    expect(result[0].ySpent).toBe(result[0].yTotal);
  });
});
