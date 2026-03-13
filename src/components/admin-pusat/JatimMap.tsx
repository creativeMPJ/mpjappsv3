import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface City {
  name: string;
  lat: number;
  lng: number;
  totalAnggota: number;
  totalPesantren: number;
  isNew?: boolean;
}

// Dummy data — ganti dengan data real dari API
const CITIES: City[] = [
  { name: "Surabaya", lat: -7.25, lng: 112.75, totalAnggota: 1240, totalPesantren: 32 },
  { name: "Malang", lat: -7.97, lng: 112.63, totalAnggota: 850, totalPesantren: 24 },
  { name: "Sidoarjo", lat: -7.45, lng: 112.72, totalAnggota: 396, totalPesantren: 16 },
  { name: "Jombang", lat: -7.55, lng: 112.23, totalAnggota: 312, totalPesantren: 14 },
  { name: "Mojokerto", lat: -7.47, lng: 112.43, totalAnggota: 280, totalPesantren: 12 },
  { name: "Kediri", lat: -7.82, lng: 112.02, totalAnggota: 445, totalPesantren: 18 },
  { name: "Blitar", lat: -8.10, lng: 112.17, totalAnggota: 210, totalPesantren: 9 },
  { name: "Tulungagung", lat: -8.07, lng: 111.90, totalAnggota: 195, totalPesantren: 8 },
  { name: "Madiun", lat: -7.63, lng: 111.52, totalAnggota: 178, totalPesantren: 7 },
  { name: "Nganjuk", lat: -7.60, lng: 111.90, totalAnggota: 156, totalPesantren: 6 },
  { name: "Pasuruan", lat: -7.64, lng: 112.90, totalAnggota: 310, totalPesantren: 13 },
  { name: "Probolinggo", lat: -7.75, lng: 113.22, totalAnggota: 265, totalPesantren: 11 },
  { name: "Lumajang", lat: -8.13, lng: 113.22, totalAnggota: 198, totalPesantren: 8 },
  { name: "Jember", lat: -8.17, lng: 113.70, totalAnggota: 520, totalPesantren: 20 },
  { name: "Banyuwangi", lat: -8.22, lng: 114.37, totalAnggota: 380, totalPesantren: 15 },
  { name: "Bondowoso", lat: -7.91, lng: 113.82, totalAnggota: 145, totalPesantren: 6 },
  { name: "Situbondo", lat: -7.70, lng: 114.00, totalAnggota: 120, totalPesantren: 5 },
  { name: "Pamekasan", lat: -7.16, lng: 113.47, totalAnggota: 88, totalPesantren: 4, isNew: true },
  { name: "Sampang", lat: -7.18, lng: 113.25, totalAnggota: 65, totalPesantren: 3, isNew: true },
  { name: "Bangkalan", lat: -7.05, lng: 112.73, totalAnggota: 72, totalPesantren: 3, isNew: true },
  { name: "Sumenep", lat: -6.98, lng: 113.87, totalAnggota: 55, totalPesantren: 2, isNew: true },
];

function getDotColor(count: number, isNew?: boolean): string {
  if (isNew) return "#4ade80";
  if (count >= 800) return "#00ff88";
  if (count >= 400) return "#22c55e";
  if (count >= 200) return "#16a34a";
  if (count >= 100) return "#15803d";
  return "#166534";
}

function getDotRadius(count: number): number {
  if (count >= 800) return 22;
  if (count >= 400) return 17;
  if (count >= 200) return 13;
  if (count >= 100) return 9;
  return 6;
}

interface Props {
  totalAnggota?: number;
  totalPesantren?: number;
  totalWilayah?: number;
}

export default function JatimMap({ totalAnggota = 0, totalPesantren = 0, totalWilayah = 0 }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Init map
    const map = L.map(containerRef.current, {
      center: [-7.65, 112.9],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
    });

    mapRef.current = map;

    // Dark tile layer (CartoDB Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 12,
      minZoom: 7,
    }).addTo(map);

    // Attribution compact
    L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);

    // Zoom control custom position
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add city markers
    CITIES.forEach((city) => {
      const color = getDotColor(city.totalAnggota, city.isNew);
      const radius = getDotRadius(city.totalAnggota);

      const marker = L.circleMarker([city.lat, city.lng], {
        radius,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.75,
      }).addTo(map);

      marker.bindTooltip(
        `<div class="jatim-tooltip">
          <strong>${city.name}</strong>
          <div>Total Anggota: <b>${city.totalAnggota.toLocaleString("id-ID")}</b></div>
          <div>Total Pesantren: <b>${city.totalPesantren}</b></div>
        </div>`,
        { className: "jatim-tooltip-wrapper", sticky: true }
      );
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-base flex items-center gap-2">
            <span className="text-emerald-600">⊙</span> Peta Strategis Jawa Timur
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalAnggota.toLocaleString("id-ID")} anggota &bull; {totalPesantren} pesantren &bull; {totalWilayah} wilayah aktif
          </p>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="relative flex-1 rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
        <div ref={containerRef} className="absolute inset-0" />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#0d1b2a]/90 border border-[#234060] rounded-lg p-2.5 backdrop-blur-sm pointer-events-none">
          <p className="text-[10px] text-slate-400 font-semibold mb-1.5">Kepadatan Anggota</p>
          {[
            { label: "Inactive (<100)", color: "#166534" },
            { label: "Low (100-199)", color: "#15803d" },
            { label: "Medium (200-399)", color: "#16a34a" },
            { label: "High (400-799)", color: "#22c55e" },
            { label: "Powerhouse (800+)", color: "#00ff88" },
            { label: "Perintisan (New)", color: "#4ade80" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 mb-1 last:mb-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip CSS injected globally once */}
      <style>{`
        .jatim-tooltip-wrapper { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .jatim-tooltip { background: #0d1b2a; border: 1px solid #234060; border-radius: 8px; padding: 8px 10px; color: #e2e8f0; font-size: 12px; line-height: 1.5; min-width: 160px; }
        .jatim-tooltip strong { display: block; font-size: 13px; font-weight: 700; margin-bottom: 2px; color: #fff; }
        .leaflet-tooltip-top::before, .leaflet-tooltip-bottom::before { border-top-color: #234060; border-bottom-color: #234060; }
      `}</style>
    </div>
  );
}
