import { Calendar as CalendarIcon, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

function EmptyEventState({ actionLabel }: { actionLabel?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-14 text-center">
        <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="font-medium text-foreground">Belum ada data</p>
        <p className="mt-1 text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
        {actionLabel && (
          <Button className="mt-4" disabled>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

const CrewEventPage = () => {
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="upcoming" className="flex-1 flex flex-col">
        <div className="px-4 pt-4 bg-background sticky top-0 z-10">
          <TabsList className="w-full grid grid-cols-3 bg-muted">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
            <TabsTrigger value="registered" className="text-xs sm:text-sm">Terdaftar</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">Riwayat</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4">
              <EmptyEventState actionLabel="Fitur akan segera tersedia" />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="registered" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4">
              <EmptyEventState actionLabel="Lihat Tiket" />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4">
              <Card className="border-dashed">
                <CardContent className="py-14 text-center">
                  <QrCode className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium text-foreground">Belum ada data</p>
                  <p className="mt-1 text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewEventPage;
