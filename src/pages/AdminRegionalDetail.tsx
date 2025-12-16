import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Building2, Calendar, TrendingUp, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const regionalData: Record<string, {
  name: string;
  code: string;
  members: number;
  pesantren: number;
  events: number;
  growth: string;
  coordinator: string;
  phone: string;
  email: string;
  cities: string[];
}> = {
  "malang-raya": {
    name: "Malang Raya",
    code: "01",
    members: 1250,
    pesantren: 85,
    events: 12,
    growth: "+15%",
    coordinator: "KH. Ahmad Fauzi",
    phone: "081234567890",
    email: "malang@mpj.id",
    cities: ["Kota Malang", "Kabupaten Malang", "Kota Batu"]
  },
  "surabaya-gresik": {
    name: "Surabaya Gresik",
    code: "02",
    members: 2100,
    pesantren: 120,
    events: 18,
    growth: "+22%",
    coordinator: "KH. Muhammad Ridwan",
    phone: "081234567891",
    email: "surabaya@mpj.id",
    cities: ["Kota Surabaya", "Kabupaten Gresik"]
  },
  "sidoarjo": {
    name: "Sidoarjo",
    code: "03",
    members: 890,
    pesantren: 65,
    events: 8,
    growth: "+12%",
    coordinator: "KH. Abdul Karim",
    phone: "081234567892",
    email: "sidoarjo@mpj.id",
    cities: ["Kabupaten Sidoarjo"]
  },
  "pasuruan": {
    name: "Pasuruan",
    code: "04",
    members: 1450,
    pesantren: 95,
    events: 14,
    growth: "+18%",
    coordinator: "KH. Hasan Basri",
    phone: "081234567893",
    email: "pasuruan@mpj.id",
    cities: ["Kota Pasuruan", "Kabupaten Pasuruan"]
  },
  "mojokerto": {
    name: "Mojokerto",
    code: "05",
    members: 720,
    pesantren: 48,
    events: 6,
    growth: "+10%",
    coordinator: "KH. Syaiful Anwar",
    phone: "081234567894",
    email: "mojokerto@mpj.id",
    cities: ["Kota Mojokerto", "Kabupaten Mojokerto"]
  },
  "jombang": {
    name: "Jombang",
    code: "06",
    members: 1680,
    pesantren: 110,
    events: 16,
    growth: "+20%",
    coordinator: "KH. Mahfud Siddiq",
    phone: "081234567895",
    email: "jombang@mpj.id",
    cities: ["Kabupaten Jombang"]
  },
  "kediri": {
    name: "Kediri",
    code: "07",
    members: 1320,
    pesantren: 88,
    events: 11,
    growth: "+14%",
    coordinator: "KH. Nur Hadi",
    phone: "081234567896",
    email: "kediri@mpj.id",
    cities: ["Kota Kediri", "Kabupaten Kediri"]
  },
  "blitar": {
    name: "Blitar Raya",
    code: "08",
    members: 680,
    pesantren: 42,
    events: 5,
    growth: "+8%",
    coordinator: "KH. Imam Ghozali",
    phone: "081234567897",
    email: "blitar@mpj.id",
    cities: ["Kota Blitar", "Kabupaten Blitar"]
  },
  "tulungagung": {
    name: "Tulungagung",
    code: "09",
    members: 540,
    pesantren: 35,
    events: 4,
    growth: "+7%",
    coordinator: "KH. Zainal Abidin",
    phone: "081234567898",
    email: "tulungagung@mpj.id",
    cities: ["Kabupaten Tulungagung"]
  },
  "trenggalek": {
    name: "Trenggalek",
    code: "10",
    members: 320,
    pesantren: 22,
    events: 3,
    growth: "+5%",
    coordinator: "KH. Sholeh Bahruddin",
    phone: "081234567899",
    email: "trenggalek@mpj.id",
    cities: ["Kabupaten Trenggalek"]
  }
};

const recentPesantren = [
  { id: 1, name: "PP. Nurul Huda", kyai: "KH. Ahmad", members: 45, status: "active" },
  { id: 2, name: "PP. Darul Ulum", kyai: "KH. Mahmud", members: 38, status: "active" },
  { id: 3, name: "PP. Al-Hikam", kyai: "KH. Farid", members: 52, status: "active" },
  { id: 4, name: "PP. Roudlotul Quran", kyai: "KH. Sholeh", members: 28, status: "pending" },
  { id: 5, name: "PP. Miftahul Ulum", kyai: "KH. Ridwan", members: 33, status: "active" },
];

const AdminRegionalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const region = id ? regionalData[id] : null;
  
  if (!region) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Regional tidak ditemukan</p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-emerald-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-emerald-600 mb-4"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge className="bg-amber-500 text-white mb-2">
                Regional {region.code}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold">{region.name}</h1>
              <p className="text-emerald-100 mt-1">
                Koordinator: {region.coordinator}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                {region.phone}
              </Button>
              <Button variant="secondary" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Member</p>
                  <p className="text-2xl font-bold">{region.members.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pesantren</p>
                  <p className="text-2xl font-bold">{region.pesantren}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Event</p>
                  <p className="text-2xl font-bold">{region.events}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pertumbuhan</p>
                  <p className="text-2xl font-bold text-green-600">{region.growth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Coverage Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Cakupan Wilayah
              </CardTitle>
              <CardDescription>Kota/Kabupaten dalam regional ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {region.cities.map((city, index) => (
                  <Badge key={index} variant="secondary">
                    {city}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Pesantren Table */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Pesantren Terbaru</CardTitle>
              <CardDescription>5 pesantren terakhir terdaftar</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Pengasuh</TableHead>
                    <TableHead className="text-center">Member</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPesantren.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.kyai}</TableCell>
                      <TableCell className="text-center">{p.members}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={p.status === "active" ? "default" : "secondary"}>
                          {p.status === "active" ? "Aktif" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRegionalDetail;
