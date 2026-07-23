/**
 * Geolocation + reverse-geocoding pe Nominatim (OpenStreetMap, gratuit, fără cheie API) — folosite de
 * `StoreLocationPicker` (hartă interactivă cu pin). Coordonatele NU se salvează nicăieri, doar numele
 * rezultat (dacă userul confirmă).
 */

export interface GeocodedPlace {
  /** Nume de magazin/comerț dacă OSM îl are (`shop`/`amenity`); altfel `null` — reverse-geocoding la
   * zoom de stradă găsește rar un nume de magazin exact, mai ales pe un pin plasat aproximativ. */
  name: string | null;
  /** Prima parte a adresei complete — afișată mereu ca fallback/context, chiar dacă `name` există. */
  address: string;
}

/** Poziția curentă a telefonului — `null` la refuz de permisiune, timeout, sau lipsă suport. */
export async function getCurrentPosition(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    // `navigator.geolocation` truthy, nu doar `"geolocation" in navigator` — proprietatea poate exista
    // dar fi `null`/`undefined` (ex. medii de test, unele webview-uri), caz în care `in` întoarce `true`
    // dar apelul de mai jos ar arunca.
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

/** Reverse-geocode pentru o pereche de coordonate — apelat la fiecare mutare a pinului pe hartă. */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodedPlace | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&accept-language=ro`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    const name: string | undefined = data?.address?.shop || data?.address?.amenity || data?.name;
    const address: string =
      (typeof data?.display_name === "string" ? data.display_name.split(",").slice(0, 3).join(",").trim() : undefined) ??
      `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    return { name: name ?? null, address };
  } catch {
    return null;
  }
}
