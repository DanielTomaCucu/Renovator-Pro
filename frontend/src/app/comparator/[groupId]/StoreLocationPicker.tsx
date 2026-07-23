"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import Spinner from "@/components/Spinner";
import { inputCls } from "@/components/forms";
import { getCurrentPosition, reverseGeocode } from "./detectStore";

/** Centrul implicit al hărții dacă geolocația e refuzată/indisponibilă — București. */
const DEFAULT_CENTER: [number, number] = [44.4268, 26.1025];
const DEFAULT_ZOOM = 15;
const PIN_ZOOM = 18;

/**
 * Pin simplu (Material Symbol inline, fără imagini externe) — evită problema clasică Leaflet+bundler
 * unde iconițele implicite (`marker-icon.png`) nu se găsesc după build, fiindcă path-urile relative din
 * pachet nu supraviețuiesc Turbopack/Webpack fără configurare suplimentară.
 */
function makePinIcon(Leaflet: typeof L) {
  return Leaflet.divIcon({
    className: "",
    html: `<span class="material-symbols-outlined" style="font-size:36px;color:#f97316;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">location_on</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 34],
  });
}

/**
 * Hartă interactivă (Leaflet + tile-uri OpenStreetMap, gratuit, fără cheie API) pentru alegerea
 * magazinului: pornește pe locația curentă a telefonului (dacă permisă), userul poate trage pinul
 * oriunde (ex. peste magazinul corect, dacă detecția automată greșește sau nu găsește nimic). La
 * fiecare mutare, reverse-geocode pe Nominatim sugerează un nume — editabil înainte de confirmare.
 */
export default function StoreLocationPicker({
  onConfirm,
  onCancel,
}: {
  onConfirm: (storeName: string) => void;
  onCancel: () => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [loadingLocation, setLoadingLocation] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");

  async function handleMove(lat: number, lon: number) {
    setGeocoding(true);
    setAddress(null);
    try {
      const place = await reverseGeocode(lat, lon);
      if (place) {
        setAddress(place.address);
        if (place.name) setStoreName(place.name);
      }
    } finally {
      setGeocoding(false);
    }
  }

  // Inițializare hartă o singură dată (nu la fiecare render) — Leaflet manipulează DOM-ul direct,
  // incompatibil cu re-randări React; encapsulăm totul într-un singur efect de montare/demontare.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const Leaflet = (await import("leaflet")).default;
      if (cancelled || !mapContainerRef.current) return;

      const map = Leaflet.map(mapContainerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = Leaflet.marker(DEFAULT_CENTER, { icon: makePinIcon(Leaflet), draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        handleMove(lat, lng);
      });
      map.on("click", (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        handleMove(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;

      const position = await getCurrentPosition();
      if (cancelled) return;
      setLoadingLocation(false);
      if (position) {
        map.setView([position.lat, position.lon], PIN_ZOOM);
        marker.setLatLng([position.lat, position.lon]);
        handleMove(position.lat, position.lon);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] bg-surface shadow-2xl sm:rounded-lg">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">Alege magazinul pe hartă</h2>
          <button onClick={onCancel} aria-label="Închide" className="h-7 w-7 shrink-0 rounded text-muted hover:bg-surface-low">
            ✕
          </button>
        </div>

        <p className="shrink-0 px-5 pt-3 text-xs text-muted">
          Trage pinul (portocaliu) peste magazin sau atinge harta unde vrei să-l muți — dacă detectarea
          automată nu găsește numele corect, poți să-l scrii tu mai jos.
        </p>

        <div className="relative m-5 mb-3 h-72 shrink-0 overflow-hidden rounded-lg border border-line sm:h-96">
          <div ref={mapContainerRef} className="h-full w-full" />
          {loadingLocation && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-surface/70 text-sm text-muted">
              <Spinner /> Se caută locația ta...
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 px-5">
          <label className="text-[10px] font-bold uppercase text-muted">Nume magazin</label>
          <input
            className={inputCls}
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Ex: Dedeman"
          />
          <p className="flex min-h-[1rem] items-center gap-1 text-[11px] text-muted">
            {geocoding ? (
              <>
                <Spinner /> Se caută adresa...
              </>
            ) : (
              address && <span>📍 {address}</span>
            )}
          </p>
        </div>

        <div className="mt-4 flex shrink-0 gap-3 border-t border-line p-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-line py-2.5 text-sm font-semibold text-muted hover:bg-surface-low"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={() => onConfirm(storeName.trim())}
            disabled={!storeName.trim()}
            className="flex-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Folosește acest magazin
          </button>
        </div>
      </div>
    </div>
  );
}
