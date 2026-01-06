/**
 * Coming Soon Structure Components
 * 
 * Shows the actual layout structure of upcoming features
 * with a grayscale overlay and "Coming Soon" indicator.
 * Role-specific panels for Pusat, Regional, and Media.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Trophy, 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  MapPin,
  Star,
  Target,
  Zap,
  Medal,
  BarChart3,
  Clock,
  Send
} from "lucide-react";

interface ComingSoonWrapperProps {
  children: React.ReactNode;
}

const ComingSoonWrapper = ({ children }: ComingSoonWrapperProps) => (
  <div className="relative">
    {/* Overlay */}
    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-start justify-center pt-20">
      <div className="text-center space-y-3">
        <Badge className="bg-amber-500 text-white px-4 py-2 text-sm font-semibold animate-pulse">
          Coming Soon
        </Badge>
        <p className="text-sm text-slate-600 max-w-xs mx-auto">
          Fitur ini sedang dalam pengembangan dan akan segera tersedia
        </p>
      </div>
    </div>
    {/* Grayscale Content */}
    <div className="grayscale opacity-60 pointer-events-none select-none">
      {children}
    </div>
  </div>
);

// ============= EVENT STRUCTURES =============

/**
 * Event Panel for Admin Pusat - Control Panel & Event Creation
 */
export const EventPusatStructure = () => (
  <ComingSoonWrapper>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manajemen Event</h2>
          <p className="text-muted-foreground">Buat dan kelola event tingkat nasional</p>
        </div>
        <Button className="bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Buat Event Baru
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="upcoming">Mendatang</TabsTrigger>
          <TabsTrigger value="past">Selesai</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4 mt-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari event..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Lomba Konten Kreatif {i}</h4>
                        <p className="text-sm text-muted-foreground">15-20 Jan 2026 • 4 Regional</p>
                      </div>
                    </div>
                    <Badge>Aktif</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </ComingSoonWrapper>
);

/**
 * Event Panel for Admin Regional - Regional Monitoring
 */
export const EventRegionalStructure = () => (
  <ComingSoonWrapper>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Event Regional</h2>
        <p className="text-muted-foreground">Pantau event di wilayah Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Event Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <p className="text-2xl font-bold">45</p>
            <p className="text-sm text-muted-foreground">Peserta Regional</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-muted-foreground">Juara Regional</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Event di Wilayah Anda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Lomba Video Pendek {i}</p>
                  <p className="text-sm text-muted-foreground">12 Peserta terdaftar</p>
                </div>
                <Badge variant="outline">Monitoring</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </ComingSoonWrapper>
);

/**
 * Event Panel for Media Dashboard - User Participation
 */
export const EventMediaStructure = () => (
  <ComingSoonWrapper>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Event & Kompetisi</h2>
        <p className="text-muted-foreground">Ikuti event dan dapatkan XP</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Lomba Video Dakwah</p>
                <p className="text-xs text-muted-foreground">Batas: 20 Jan 2026</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-700">+500 XP</Badge>
              <Button size="sm">Daftar</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold">Challenge Mingguan</p>
                <p className="text-xs text-muted-foreground">Upload 3 konten</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-100 text-amber-700">+100 XP</Badge>
              <Button size="sm" variant="outline">Lihat</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event yang Diikuti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada event yang diikuti</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </ComingSoonWrapper>
);

// ============= MILITANSI STRUCTURES =============

/**
 * Militansi Panel for Admin Pusat - Leaderboard Control
 */
export const MilitansiPusatStructure = () => (
  <ComingSoonWrapper>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Militansi & Leaderboard</h2>
          <p className="text-muted-foreground">Kelola sistem XP dan peringkat nasional</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white">
          <Trophy className="w-4 h-4 mr-2" />
          Atur XP Rules
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Medal className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-muted-foreground">Total Kru Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">567K</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">89</p>
            <p className="text-sm text-muted-foreground">Level Platinum</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">12%</p>
            <p className="text-sm text-muted-foreground">Growth Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Nasional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                    {i}
                  </span>
                  <span className="font-medium">Kru Media #{i}</span>
                </div>
                <Badge className="bg-amber-100 text-amber-700">{7000 - i * 500} XP</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </ComingSoonWrapper>
);

/**
 * Militansi Panel for Admin Regional - Regional Leaderboard
 */
export const MilitansiRegionalStructure = () => (
  <ComingSoonWrapper>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Militansi Regional</h2>
        <p className="text-muted-foreground">Leaderboard wilayah Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Trophy className="w-10 h-10 mx-auto text-amber-500 mb-2" />
            <p className="text-xl font-bold text-amber-800">#3</p>
            <p className="text-sm text-amber-600">Peringkat Nasional</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Kru Regional</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">45.2K</p>
            <p className="text-sm text-muted-foreground">Total XP Regional</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Kru di Regional Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    {i}
                  </span>
                  <span className="font-medium">Kru Regional #{i}</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">{3000 - i * 300} XP</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </ComingSoonWrapper>
);

// ============= HUB STRUCTURES =============

/**
 * MPJ Hub for Admin Pusat - Central Hub Control
 */
export const HubPusatStructure = () => (
  <ComingSoonWrapper>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">MPJ HUB Pusat</h2>
          <p className="text-muted-foreground">Pusat distribusi konten dan kolaborasi nasional</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" />
          Broadcast Nasional
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Konten</TabsTrigger>
          <TabsTrigger value="collab">Kolaborasi</TabsTrigger>
          <TabsTrigger value="archive">Arsip</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Share2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold">Konten Template #{i}</h4>
                  <p className="text-sm text-muted-foreground">Diunduh 234 kali</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </ComingSoonWrapper>
);

/**
 * Regional Hub for Admin Regional
 */
export const HubRegionalStructure = () => (
  <ComingSoonWrapper>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Regional HUB</h2>
        <p className="text-muted-foreground">Kolaborasi dan berbagi konten regional</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Konten Bersama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <p>12 konten tersedia</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Kolaborator Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <p>8 pesantren aktif</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </ComingSoonWrapper>
);

/**
 * MPJ Hub for Media Dashboard - User Participation
 */
export const HubMediaStructure = () => (
  <ComingSoonWrapper>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">MPJ HUB</h2>
        <p className="text-muted-foreground">Akses konten dan kolaborasi dengan pesantren lain</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Share2 className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Konten Tersedia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-2xl font-bold">23</p>
            <p className="text-sm text-muted-foreground">Kolaborator</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">Request Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konten Populer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2].map(i => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">Template Poster #{i}</p>
                <p className="text-sm text-muted-foreground">Dari PP Al-Hikmah</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </ComingSoonWrapper>
);
