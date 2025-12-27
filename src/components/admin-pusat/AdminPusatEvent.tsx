import { Calendar, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminPusatEvent = () => {
  const { toast } = useToast();

  const handleLockedFeature = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `Fitur "${feature}" akan tersedia di update selanjutnya.`,
      variant: "default",
    });
  };

  // Dummy events for display
  const events = [
    { id: "1", nama: "Kopdar MPJ Surabaya", tanggal: "15 Jan 2025", wilayah: "Surabaya", status: "Aktif" },
    { id: "2", nama: "Pelatihan Videografi", tanggal: "20 Jan 2025", wilayah: "Malang Raya", status: "Draft" },
    { id: "3", nama: "Seminar Dakwah Digital", tanggal: "28 Jan 2025", wilayah: "Nasional", status: "Aktif" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Event</h1>
          <p className="text-slate-500 mt-1">Kelola event dan kegiatan MPJ</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleLockedFeature("Create Event")}
            className="bg-slate-300 text-slate-600 cursor-not-allowed"
            disabled
          >
            <Lock className="h-4 w-4 mr-2" />
            Buat Event
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleLockedFeature("Takeover Event")}
            className="border-slate-300 text-slate-500 cursor-not-allowed"
            disabled
          >
            <Lock className="h-4 w-4 mr-2" />
            Takeover
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-center gap-3">
          <Lock className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            Fitur Create Event dan Takeover sedang dalam pengembangan. Saat ini Anda hanya dapat melihat daftar event.
          </p>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#166534]" />
            Daftar Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{event.nama}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {event.tanggal} • {event.wilayah}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === "Aktif"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">
            * Data dummy untuk preview
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPusatEvent;
