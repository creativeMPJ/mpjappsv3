import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Users } from "lucide-react";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom cluster icon
const createClusterIcon = (count: number, color: string = "#047857") => {
  const size = count > 100 ? 50 : count > 50 ? 45 : count > 20 ? 40 : 35;
  return L.divIcon({
    html: `<div style="
      background: ${color};
      color: white;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${size > 40 ? 14 : 12}px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 3px solid white;
    ">${count}</div>`,
    className: "cluster-marker",
    iconSize: L.point(size, size),
  });
};

// Custom pin icon
const createPinIcon = (color: string = "#f59e0b") => {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
    "></div>`,
    className: "custom-pin",
    iconSize: L.point(24, 24),
    iconAnchor: L.point(12, 24),
  });
};

interface PesantrenLocation {
  id: string;
  name: string;
  kyai: string;
  santriCount: number;
  lat: number;
  lng: number;
  region: string;
}

interface ClusterData {
  id: string;
  name: string;
  count: number;
  lat: number;
  lng: number;
  pesantrens: PesantrenLocation[];
}

// Mock data for East Java
const mockClusters: ClusterData[] = [
  {
    id: "surabaya",
    name: "Surabaya Raya",
    count: 85,
    lat: -7.2575,
    lng: 112.7521,
    pesantrens: [
      { id: "1", name: "PP Al-Hikmah Surabaya", kyai: "KH. Ahmad Fauzi", santriCount: 450, lat: -7.2575, lng: 112.7521, region: "Surabaya" },
      { id: "2", name: "PP Nurul Islam", kyai: "KH. Muhammad Ali", santriCount: 320, lat: -7.2634, lng: 112.7453, region: "Surabaya" },
    ]
  },
  {
    id: "malang",
    name: "Malang Raya",
    count: 120,
    lat: -7.9666,
    lng: 112.6326,
    pesantrens: [
      { id: "3", name: "PP Al-Ittihad", kyai: "KH. Hasan Basri", santriCount: 580, lat: -7.9666, lng: 112.6326, region: "Malang" },
      { id: "4", name: "PP Nurul Huda", kyai: "KH. Abdullah Faqih", santriCount: 420, lat: -7.9712, lng: 112.6284, region: "Malang" },
    ]
  },
  {
    id: "jember",
    name: "Tapal Kuda",
    count: 65,
    lat: -8.1845,
    lng: 113.6681,
    pesantrens: [
      { id: "5", name: "PP Nurul Jadid", kyai: "KH. Zainul Hasan", santriCount: 1200, lat: -8.1845, lng: 113.6681, region: "Probolinggo" },
      { id: "6", name: "PP Salafiyah Syafi'iyah", kyai: "KH. Abdul Hamid", santriCount: 800, lat: -8.2012, lng: 113.7234, region: "Situbondo" },
    ]
  },
  {
    id: "jombang",
    name: "Jombang Raya",
    count: 95,
    lat: -7.5459,
    lng: 112.2327,
    pesantrens: [
      { id: "7", name: "PP Darul Ulum", kyai: "KH. Cholil Bisri", santriCount: 950, lat: -7.5459, lng: 112.2327, region: "Jombang" },
      { id: "8", name: "PP Tebuireng", kyai: "KH. Salahuddin Wahid", santriCount: 1800, lat: -7.5512, lng: 112.2189, region: "Jombang" },
    ]
  },
  {
    id: "kediri",
    name: "Kediri Raya",
    count: 78,
    lat: -7.8480,
    lng: 112.0178,
    pesantrens: [
      { id: "9", name: "PP Lirboyo", kyai: "KH. Anwar Manshur", santriCount: 1500, lat: -7.8480, lng: 112.0178, region: "Kediri" },
    ]
  },
];

interface Props {
  onViewDetail?: (pesantren: PesantrenLocation) => void;
}

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const ClusterMap = ({ onViewDetail }: Props) => {
  const [zoomLevel, setZoomLevel] = useState(8);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-7.5, 112.5]);
  const [selectedCluster, setSelectedCluster] = useState<ClusterData | null>(null);

  const handleClusterClick = (cluster: ClusterData) => {
    setSelectedCluster(cluster);
    setMapCenter([cluster.lat, cluster.lng]);
    setZoomLevel(11);
  };

  const handleZoomOut = () => {
    setSelectedCluster(null);
    setMapCenter([-7.5, 112.5]);
    setZoomLevel(8);
  };

  return (
    <Card className="bg-white border-0 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Peta Persebaran Pesantren Jawa Timur
          </CardTitle>
          {selectedCluster && (
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              Lihat Semua
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] relative">
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            className="h-full w-full z-0"
            scrollWheelZoom={false}
          >
            <MapController center={mapCenter} zoom={zoomLevel} />
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {zoomLevel < 10 ? (
              // Show clusters at low zoom
              mockClusters.map((cluster) => (
                <Marker
                  key={cluster.id}
                  position={[cluster.lat, cluster.lng]}
                  icon={createClusterIcon(cluster.count)}
                  eventHandlers={{
                    click: () => handleClusterClick(cluster),
                  }}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-bold text-emerald-700">{cluster.name}</p>
                      <p className="text-sm text-slate-600">{cluster.count} Pesantren</p>
                      <Button 
                        size="sm" 
                        className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleClusterClick(cluster)}
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))
            ) : (
              // Show individual pins at high zoom
              selectedCluster?.pesantrens.map((pesantren) => (
                <Marker
                  key={pesantren.id}
                  position={[pesantren.lat, pesantren.lng]}
                  icon={createPinIcon()}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <p className="font-bold text-slate-800">{pesantren.name}</p>
                      <p className="text-sm text-slate-600">{pesantren.kyai}</p>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                        <Users className="h-3 w-3" />
                        {pesantren.santriCount} Santri
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full bg-amber-500 hover:bg-amber-600"
                        onClick={() => onViewDetail?.(pesantren)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat Detail
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))
            )}
          </MapContainer>
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
            <p className="text-xs font-medium text-slate-700 mb-2">Legenda</p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="w-4 h-4 rounded-full bg-emerald-700" />
              <span>Cluster Pesantren</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Lokasi Pesantren</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClusterMap;
