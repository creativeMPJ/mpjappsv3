import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TimSaya = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rekan Satu Tim</h1>
        <p className="text-muted-foreground">Lihat anggota tim media pesantren Anda</p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Users className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Data akan tampil setelah tersedia.
        </AlertDescription>
      </Alert>

      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="font-medium text-foreground">Belum ada data</p>
          <p className="mt-1 text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistik Tim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">0</p>
              <p className="text-sm text-muted-foreground">Total Anggota</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">0</p>
              <p className="text-sm text-muted-foreground">Event Diikuti</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-muted-foreground">Total XP Tim</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimSaya;
