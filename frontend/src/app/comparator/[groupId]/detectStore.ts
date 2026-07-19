/**
 * Detectează numele magazinului din locația curentă a telefonului: geolocation → reverse-geocoding pe
 * Nominatim (OpenStreetMap, gratuit, fără cheie API). Rezultat DOAR o sugestie — userul o poate edita/
 * șterge oricând. Best-effort: `null` la refuz de permisiune, timeout, sau lipsă de nume util în răspuns
 * — niciodată o eroare care blochează formularul. Coordonatele NU se salvează nicăieri.
 */
export async function detectStoreName(): Promise<string | null> {
  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
  if (!position) return null;

  const { latitude, longitude } = position.coords;
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&accept-language=ro`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    const name: string | undefined = data?.name || data?.address?.shop || data?.address?.amenity;
    if (name) return name;
    const firstSegment = typeof data?.display_name === "string" ? data.display_name.split(",")[0]?.trim() : undefined;
    return firstSegment || null;
  } catch {
    return null;
  }
}
