import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    </div>
  );
};

export default TimSaya;
