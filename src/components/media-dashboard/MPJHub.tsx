import { BookOpen, Download, Folder, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTableShell, EmptyState, PageHeader } from "@/features/v4/components/v4-components";

const mediaHubReadinessItems = [
  {
    name: "Panduan Koordinator",
    description: "Kesiapan panduan resmi untuk koordinasi tim media pesantren.",
    status: "Segera Hadir",
  },
  {
    name: "Materi Media",
    description: "Kesiapan materi resmi untuk publikasi dan kebutuhan media.",
    status: "Segera Hadir",
  },
  {
    name: "Template Konten",
    description: "Kesiapan template konten untuk produksi media pesantren.",
    status: "Segera Hadir",
  },
  {
    name: "Arsip Event",
    description: "Kesiapan arsip dokumentasi dan materi event.",
    status: "Segera Hadir",
  },
];

const MPJHub = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="MPJ Hub"
        description="Akses resource dan panduan resmi untuk tim media pesantren."
        actions={<Button disabled>Segera Hadir</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Panduan Koordinator", icon: BookOpen },
          { label: "Materi Media", icon: Download },
          { label: "Template Konten", icon: Folder },
          { label: "Arsip Event", icon: Megaphone },
        ].map((item) => (
          <Card key={item.label} className="bg-white border border-slate-200">
            <CardContent className="p-6 text-center">
              <item.icon className="h-10 w-10 mx-auto mb-3 text-slate-400" />
              <p className="font-semibold text-slate-700">{item.label}</p>
              <Badge variant="outline" className="mt-3 border-amber-200 bg-amber-50 text-amber-700">
                Segera Hadir
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTableShell
        title="Kesiapan Resource"
        description="Resource akan tampil setelah tersedia."
        columns={["Area", "Deskripsi", "Status", "Aksi"]}
        rows={mediaHubReadinessItems}
        renderRow={(row) => {
          const item = row as (typeof mediaHubReadinessItems)[number];

          return (
            <TableRow key={item.name}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" disabled>Segera Hadir</Button>
              </TableCell>
            </TableRow>
          );
        }}
      />

      <EmptyState
        title="Belum ada data"
        description="Resource akan tampil setelah tersedia."
      />
    </div>
  );
};

export default MPJHub;
