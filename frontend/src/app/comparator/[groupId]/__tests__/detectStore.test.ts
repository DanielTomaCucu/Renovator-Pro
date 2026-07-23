import { describe, expect, it, vi, afterEach } from "vitest";
import { reverseGeocode, getCurrentPosition } from "../detectStore";

describe("reverseGeocode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("întoarce numele magazinului (shop) și adresa scurtă dacă Nominatim îl are", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          address: { shop: "Dedeman" },
          display_name: "Dedeman, Strada X, Sector 1, București, România",
        }),
      })
    );

    const result = await reverseGeocode(44.43, 26.1);
    expect(result).toEqual({ name: "Dedeman", address: "Dedeman, Strada X, Sector 1" });
  });

  it("folosește amenity dacă shop lipsește", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ address: { amenity: "Farmacia Sensiblu" }, display_name: "Farmacia Sensiblu, X" }),
      })
    );
    const result = await reverseGeocode(44.43, 26.1);
    expect(result?.name).toBe("Farmacia Sensiblu");
  });

  it("name e null dacă nu găsește shop/amenity — dar adresa tot apare", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ address: {}, display_name: "Strada Y, Sector 2, București" }),
      })
    );
    const result = await reverseGeocode(44.43, 26.1);
    expect(result?.name).toBeNull();
    expect(result?.address).toBe("Strada Y, Sector 2, București");
  });

  it("întoarce null la eroare de rețea (fetch aruncă)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await reverseGeocode(44.43, 26.1);
    expect(result).toBeNull();
  });

  it("întoarce null dacă răspunsul HTTP nu e ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const result = await reverseGeocode(44.43, 26.1);
    expect(result).toBeNull();
  });

  it("cade pe fallback 'lat, lon' dacă display_name lipsește complet", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ address: {} }) })
    );
    const result = await reverseGeocode(44.4268, 26.1025);
    expect(result?.address).toBe("44.42680, 26.10250");
  });
});

describe("getCurrentPosition", () => {
  it("întoarce null dacă geolocation nu e suportat (proprietate lipsă sau null)", async () => {
    const original = (globalThis.navigator as unknown as { geolocation?: unknown }).geolocation;
    Object.defineProperty(globalThis.navigator, "geolocation", { value: null, configurable: true });

    const result = await getCurrentPosition();
    expect(result).toBeNull();

    Object.defineProperty(globalThis.navigator, "geolocation", { value: original, configurable: true });
  });

  it("întoarce coordonatele dacă userul acceptă permisiunea", async () => {
    Object.defineProperty(globalThis.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 44.1, longitude: 26.2 } } as GeolocationPosition),
      },
    });
    const result = await getCurrentPosition();
    expect(result).toEqual({ lat: 44.1, lon: 26.2 });
  });

  it("întoarce null dacă userul refuză permisiunea", async () => {
    Object.defineProperty(globalThis.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error({ code: 1, message: "denied" } as GeolocationPositionError),
      },
    });
    const result = await getCurrentPosition();
    expect(result).toBeNull();
  });
});
