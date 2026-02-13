import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from "@/lib/api-client";

interface City {
  id: string;
  name: string;
}

interface CityComboboxProps {
  value: string;
  onSelect: (cityId: string, cityName: string) => void;
  disabled?: boolean;
}

export function CityCombobox({ value, onSelect, disabled }: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      try {
        const data = await apiRequest<{ cities: City[] }>("/api/public/cities");
        setCities(data.cities || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
      setIsLoading(false);
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (value && cities.length > 0) {
      const city = cities.find((c) => c.id === value);
      setSelectedName(city?.name || "");
    }
  }, [value, cities]);

  const handleSelect = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      onSelect(city.id, city.name);
      setSelectedName(city.name);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full h-11 justify-between border-gray-200 bg-white hover:bg-gray-50 font-normal"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat...
            </span>
          ) : selectedName ? (
            selectedName
          ) : (
            <span className="text-muted-foreground">Pilih kota/kabupaten...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari kota/kabupaten..." />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.name}
                  onSelect={() => handleSelect(city.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === city.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
