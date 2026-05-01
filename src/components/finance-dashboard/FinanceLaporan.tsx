import { BarChart3, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FinanceLaporan = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Laporan Keuangan</h2>
                <p className="text-white/80 text-sm">Ringkasan performa keuangan MPJ</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0"
              disabled
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Fitur akan segera tersedia</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Laporan keuangan akan tampil setelah data tersedia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="font-medium text-foreground">Belum ada data</p>
          <p className="mt-1 text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceLaporan;
