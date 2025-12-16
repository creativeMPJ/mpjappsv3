import { useState } from "react";
import { MapPin, Eye, Users, ZoomIn, ZoomOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PesantrenLocation {
  id: string;
  name: string;
  kyai: string;
  santriCount: number;
  region: string;
}

interface ClusterData {
  id: string;
  name: string;
  count: number;
  x: number;
  y: number;
  pesantrens: PesantrenLocation[];
}

// Mock data for East Java clusters
const mockClusters: ClusterData[] = [
  {
    id: "surabaya",
    name: "Surabaya Raya",
    count: 85,
    x: 420,
    y: 140,
    pesantrens: [
      { id: "1", name: "PP Al-Hikmah Surabaya", kyai: "KH. Ahmad Fauzi", santriCount: 450, region: "Surabaya" },
      { id: "2", name: "PP Nurul Islam", kyai: "KH. Muhammad Ali", santriCount: 320, region: "Surabaya" },
    ]
  },
  {
    id: "malang",
    name: "Malang Raya",
    count: 120,
    x: 340,
    y: 180,
    pesantrens: [
      { id: "3", name: "PP Al-Ittihad", kyai: "KH. Hasan Basri", santriCount: 580, region: "Malang" },
      { id: "4", name: "PP Nurul Huda", kyai: "KH. Abdullah Faqih", santriCount: 420, region: "Malang" },
    ]
  },
  {
    id: "jember",
    name: "Tapal Kuda",
    count: 65,
    x: 480,
    y: 200,
    pesantrens: [
      { id: "5", name: "PP Nurul Jadid", kyai: "KH. Zainul Hasan", santriCount: 1200, region: "Probolinggo" },
      { id: "6", name: "PP Salafiyah Syafi'iyah", kyai: "KH. Abdul Hamid", santriCount: 800, region: "Situbondo" },
    ]
  },
  {
    id: "jombang",
    name: "Jombang Raya",
    count: 95,
    x: 320,
    y: 145,
    pesantrens: [
      { id: "7", name: "PP Darul Ulum", kyai: "KH. Cholil Bisri", santriCount: 950, region: "Jombang" },
      { id: "8", name: "PP Tebuireng", kyai: "KH. Salahuddin Wahid", santriCount: 1800, region: "Jombang" },
    ]
  },
  {
    id: "kediri",
    name: "Kediri Raya",
    count: 78,
    x: 260,
    y: 170,
    pesantrens: [
      { id: "9", name: "PP Lirboyo", kyai: "KH. Anwar Manshur", santriCount: 1500, region: "Kediri" },
    ]
  },
  {
    id: "madura",
    name: "Madura Raya",
    count: 55,
    x: 480,
    y: 105,
    pesantrens: [
      { id: "10", name: "PP Mambaul Ulum", kyai: "KH. Moh. Tidjani", santriCount: 600, region: "Pamekasan" },
    ]
  },
];

const ClusterMap = () => {
  const [selectedCluster, setSelectedCluster] = useState<ClusterData | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPesantren, setSelectedPesantren] = useState<PesantrenLocation | null>(null);

  const handleClusterClick = (cluster: ClusterData) => {
    setSelectedCluster(cluster);
  };

  const handleViewPesantren = (pesantren: PesantrenLocation) => {
    setSelectedPesantren(pesantren);
    setIsDetailOpen(true);
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
            <Button variant="outline" size="sm" onClick={() => setSelectedCluster(null)}>
              Lihat Semua
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          {/* SVG Map */}
          <svg viewBox="0 0 600 300" className="w-full h-auto">
            {/* Background */}
            <rect width="600" height="300" fill="#e8f5e9" rx="8" />
            
            {/* Simplified East Java Map Shape */}
            <path
              d="M50 180 
                 C60 160, 80 140, 120 130 
                 C160 120, 200 115, 240 110 
                 C280 105, 320 100, 360 105 
                 C400 110, 440 120, 480 130 
                 C520 140, 550 160, 560 180 
                 C570 200, 560 220, 540 230 
                 C520 240, 480 245, 440 248 
                 C400 251, 360 252, 320 250 
                 C280 248, 240 244, 200 238 
                 C160 232, 120 224, 80 215 
                 C60 210, 45 195, 50 180Z"
              fill="#c8e6c9"
              stroke="#81c784"
              strokeWidth="2"
            />
            
            {/* Madura Island */}
            <path
              d="M420 90 C450 85, 500 82, 540 88 C560 95, 565 110, 550 118 C530 125, 480 128, 440 122 C420 118, 415 100, 420 90Z"
              fill="#c8e6c9"
              stroke="#81c784"
              strokeWidth="2"
            />
            
            {/* Gradient definitions */}
            <defs>
              <radialGradient id="hotspot1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
              </radialGradient>
              <radialGradient id="hotspot2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
              </radialGradient>
              <linearGradient id="legendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            
            {/* Cluster markers */}
            {mockClusters.map((cluster) => {
              const isHovered = hoveredCluster === cluster.id;
              const isSelected = selectedCluster?.id === cluster.id;
              const size = cluster.count > 100 ? 45 : cluster.count > 50 ? 40 : 35;
              
              return (
                <g key={cluster.id}>
                  {/* Glow effect */}
                  <circle
                    cx={cluster.x}
                    cy={cluster.y}
                    r={size + 10}
                    fill={cluster.count > 100 ? "url(#hotspot1)" : "url(#hotspot2)"}
                  />
                  
                  {/* Main cluster circle */}
                  <circle
                    cx={cluster.x}
                    cy={cluster.y}
                    r={size / 2}
                    fill={isSelected ? "#047857" : isHovered ? "#059669" : "#f59e0b"}
                    stroke="white"
                    strokeWidth="3"
                    className="cursor-pointer transition-all duration-200"
                    style={{ 
                      filter: isHovered || isSelected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                      transform: isHovered ? `scale(1.1)` : "scale(1)",
                      transformOrigin: `${cluster.x}px ${cluster.y}px`
                    }}
                    onMouseEnter={() => setHoveredCluster(cluster.id)}
                    onMouseLeave={() => setHoveredCluster(null)}
                    onClick={() => handleClusterClick(cluster)}
                  />
                  
                  {/* Count text */}
                  <text
                    x={cluster.x}
                    y={cluster.y + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white pointer-events-none"
                  >
                    {cluster.count}
                  </text>
                </g>
              );
            })}
            
            {/* City Labels */}
            <text x="340" y="200" textAnchor="middle" className="text-xs font-semibold" fill="#166534">Malang</text>
            <text x="420" y="155" textAnchor="middle" className="text-xs font-medium" fill="#166534">Surabaya</text>
            <text x="260" y="185" textAnchor="middle" className="text-xs font-medium" fill="#166534">Kediri</text>
            <text x="480" y="215" textAnchor="middle" className="text-xs font-medium" fill="#166534">Jember</text>
            <text x="320" y="160" textAnchor="middle" className="text-xs font-medium" fill="#166534">Jombang</text>
            <text x="480" y="90" textAnchor="middle" className="text-xs font-medium" fill="#166534">Madura</text>
            
            {/* Legend */}
            <rect x="380" y="260" width="180" height="30" rx="6" fill="white" fillOpacity="0.9" />
            <text x="395" y="280" className="text-xs" fill="#64748b">Low Activity</text>
            <rect x="470" y="270" width="60" height="10" rx="2" fill="url(#legendGradient)" />
            <text x="540" y="280" className="text-xs" fill="#64748b">High</text>
          </svg>

          {/* Cluster Detail Panel */}
          {selectedCluster && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">{selectedCluster.name}</h3>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm">
                  {selectedCluster.count} Pesantren
                </span>
              </div>
              <div className="space-y-2">
                {selectedCluster.pesantrens.map((pesantren) => (
                  <div
                    key={pesantren.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{pesantren.name}</p>
                      <p className="text-sm text-slate-500">{pesantren.kyai}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPesantren(pesantren)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Pesantren Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Detail Pesantren
            </DialogTitle>
          </DialogHeader>
          {selectedPesantren && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Nama Pesantren</p>
                <p className="font-semibold text-lg text-slate-800">{selectedPesantren.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pengasuh/Kyai</p>
                <p className="font-medium text-slate-800">{selectedPesantren.kyai}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Regional</p>
                  <p className="font-medium text-slate-800">{selectedPesantren.region}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Jumlah Santri</p>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <p className="font-medium text-slate-800">{selectedPesantren.santriCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClusterMap;
