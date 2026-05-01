import { Camera, Save, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ProfilPribadi = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Profil Saya</h1>
        <p className="text-muted-foreground">Perbarui informasi pribadi dan keahlian Anda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarFallback>-</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              disabled
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-slate-400 hover:bg-slate-400 cursor-not-allowed"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="font-medium text-foreground">Belum ada data</p>
            <p className="text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value="-" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
              <Input id="whatsapp" value="-" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keahlian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium text-foreground">Belum ada data</p>
            <p className="text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
            <Badge variant="secondary" className="mt-3">Segera Hadir</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Arsip Legalitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-foreground">Belum ada data</p>
            <p className="text-sm text-muted-foreground mt-1">Data akan tampil setelah tersedia</p>
            <Button variant="outline" className="mt-4" disabled>
              Segera Hadir
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          disabled
          className="bg-slate-400 hover:bg-slate-400 px-8 cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          Segera Hadir
        </Button>
      </div>
    </div>
  );
};

export default ProfilPribadi;
