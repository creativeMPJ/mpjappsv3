import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  // Default to East Java center
  const defaultLat = -7.5;
  const defaultLng = 112.75;

  const [latValue, setLatValue] = useState<string>(
    latitude !== null ? latitude.toString() : defaultLat.toString()
  );
  const [lngValue, setLngValue] = useState<string>(
    longitude !== null ? longitude.toString() : defaultLng.toString()
  );

  useEffect(() => {
    if (latitude !== null) {
      setLatValue(latitude.toString());
    }
    if (longitude !== null) {
      setLngValue(longitude.toString());
    }
  }, [latitude, longitude]);

  const handleLatChange = (value: string) => {
    setLatValue(value);
    const lat = parseFloat(value);
    const lng = parseFloat(lngValue);
    if (!isNaN(lat) && !isNaN(lng)) {
      onLocationChange(lat, lng);
    }
  };

  const handleLngChange = (value: string) => {
    setLngValue(value);
    const lat = parseFloat(latValue);
    const lng = parseFloat(value);
    if (!isNaN(lat) && !isNaN(lng)) {
      onLocationChange(lat, lng);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
        <MapPin className="h-4 w-4" />
        <span>Masukkan koordinat lokasi pesantren secara manual</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="-7.5"
            value={latValue}
            onChange={(e) => handleLatChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="112.75"
            value={lngValue}
            onChange={(e) => handleLngChange(e.target.value)}
          />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Tip: Anda bisa mendapatkan koordinat dari Google Maps dengan klik kanan pada lokasi dan pilih koordinat.
      </p>
    </div>
  );
}
