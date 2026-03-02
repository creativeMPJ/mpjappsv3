import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ExternalLink,
    MapPin,
    Globe,
    Instagram,
    Facebook,
    Youtube,
    Video,
    Building2,
    Users,
    Calendar,
    GraduationCap,
    School,
    Mail,
    Phone
} from "lucide-react";

export interface PendaftarDetail {
    id: string;
    pesantren_name: string;
    nama_pengelola: string | null;
    no_wa_pendaftar: string | null;
    jenis_pengajuan: "klaim" | "pesantren_baru";
    created_at: string;

    // Profile Data
    niam: string | null;
    is_alumni: boolean;
    alamat_lengkap: string | null;
    kecamatan_profile: string | null;
    desa: string | null;
    kode_pos: string | null;
    maps_link: string | null;

    // Media
    ketua_media: string | null;
    tahun_berdiri: string | null;
    jumlah_kru: number | null;
    logo_media_url: string | null;
    foto_gedung_url: string | null;

    // Socials
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    youtube: string | null;
    tiktok: string | null;
    social_links: any;

    // Education
    jenjang_pendidikan: any;

    // Relations
    nama_pengasuh: string | null;
}

interface DetailPendaftarDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: PendaftarDetail | null;
}

export function DetailPendaftarDialog({ open, onOpenChange, data }: DetailPendaftarDialogProps) {
    if (!data) return null;

    const jenjangList = Array.isArray(data.jenjang_pendidikan) ? data.jenjang_pendidikan : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                {data.pesantren_name}
                                {data.is_alumni && <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Alumni</Badge>}
                                <Badge variant="outline">{data.jenis_pengajuan}</Badge>
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2">
                                <span>NIAM: <span className="font-mono font-medium text-foreground">{data.niam || "-"}</span></span>
                                <span>•</span>
                                <span>Pengasuh: {data.nama_pengasuh || "-"}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">

                    {/* Left Column: Address & Contact */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Alamat & Lokasi
                            </h3>
                            <div className="bg-muted/30 p-3 rounded-md text-sm space-y-2 border">
                                <p>
                                    <span className="text-muted-foreground block text-xs">Alamat Lengkap</span>
                                    {data.alamat_lengkap || "-"}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <p>
                                        <span className="text-muted-foreground block text-xs">Desa/Kelurahan</span>
                                        {data.desa || "-"}
                                    </p>
                                    <p>
                                        <span className="text-muted-foreground block text-xs">Kecamatan</span>
                                        {data.kecamatan_profile || "-"}
                                    </p>
                                    <p>
                                        <span className="text-muted-foreground block text-xs">Kode Pos</span>
                                        {data.kode_pos || "-"}
                                    </p>
                                </div>
                                {data.maps_link && (
                                    <Button variant="outline" size="sm" className="w-full gap-2 h-8" asChild>
                                        <a href={data.maps_link} target="_blank" rel="noreferrer">
                                            <MapPin className="h-3 w-3" /> Buka Google Maps
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <School className="h-4 w-4" /> Pendidikan & Kontak
                            </h3>
                            <div className="space-y-2">
                                <div className="flex gap-2 flex-wrap">
                                    {jenjangList.length > 0 ? (
                                        jenjangList.map((j: string, i: number) => (
                                            <Badge key={i} variant="secondary">{j}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">Tidak ada data jenjang</span>
                                    )}
                                </div>
                                <div className="bg-muted/30 p-3 rounded-md text-sm space-y-2 border">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>Pengelola: {data.nama_pengelola || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>WA: {data.no_wa_pendaftar || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Media & Socials */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Data Media
                            </h3>
                            <div className="bg-muted/30 p-3 rounded-md text-sm space-y-3 border">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Ketua Media</span>
                                    <span className="font-medium">{data.ketua_media || "-"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Tahun Berdiri</span>
                                    <span className="font-medium">{data.tahun_berdiri || "-"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Jumlah Kru</span>
                                    <span className="font-medium">{data.jumlah_kru || 0} Orang</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Media Sosial
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {data.website && (
                                    <Button variant="outline" size="sm" className="justify-start gap-2 h-8" asChild>
                                        <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noreferrer">
                                            <Globe className="h-3 w-3" /> Website
                                        </a>
                                    </Button>
                                )}
                                {data.instagram && (
                                    <Button variant="outline" size="sm" className="justify-start gap-2 h-8" asChild>
                                        <a href={`https://instagram.com/${data.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                                            <Instagram className="h-3 w-3" /> Instagram
                                        </a>
                                    </Button>
                                )}
                                {data.facebook && (
                                    <Button variant="outline" size="sm" className="justify-start gap-2 h-8" asChild>
                                        <a href={data.facebook} target="_blank" rel="noreferrer">
                                            <Facebook className="h-3 w-3" /> Facebook
                                        </a>
                                    </Button>
                                )}
                                {data.youtube && (
                                    <Button variant="outline" size="sm" className="justify-start gap-2 h-8" asChild>
                                        <a href={data.youtube} target="_blank" rel="noreferrer">
                                            <Youtube className="h-3 w-3" /> Youtube
                                        </a>
                                    </Button>
                                )}
                                {data.tiktok && (
                                    <Button variant="outline" size="sm" className="justify-start gap-2 h-8" asChild>
                                        <a href={data.tiktok} target="_blank" rel="noreferrer">
                                            <Video className="h-3 w-3" /> TikTok
                                        </a>
                                    </Button>
                                )}
                            </div>
                            {(!data.website && !data.instagram && !data.facebook && !data.youtube && !data.tiktok) && (
                                <p className="text-sm text-muted-foreground italic">Tidak ada data sosial media</p>
                            )}
                        </div>

                        {/* Images */}
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Dokumen / Foto</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {data.logo_media_url && (
                                    <div className="border rounded p-1 shrink-0">
                                        <p className="text-xs text-center mb-1 text-muted-foreground">Logo Media</p>
                                        <img src={data.logo_media_url} alt="Logo" className="h-20 w-20 object-cover rounded bg-muted" />
                                    </div>
                                )}
                                {data.foto_gedung_url && (
                                    <div className="border rounded p-1 shrink-0">
                                        <p className="text-xs text-center mb-1 text-muted-foreground">Foto Gedung</p>
                                        <img src={data.foto_gedung_url} alt="Gedung" className="h-20 w-32 object-cover rounded bg-muted" />
                                    </div>
                                )}
                                {!data.logo_media_url && !data.foto_gedung_url && (
                                    <p className="text-sm text-muted-foreground italic">Tidak ada foto</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </DialogContent>
        </Dialog>
    );
}
