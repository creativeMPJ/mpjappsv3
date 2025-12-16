import { useState } from "react";
import { 
  Trophy, 
  Star, 
  Zap, 
  Medal, 
  Edit2, 
  Trash2, 
  Plus, 
  Upload, 
  RefreshCw,
  Crown,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface XPRule {
  id: string;
  actionKey: string;
  label: string;
  xpValue: number;
  limit: "no_limit" | "daily" | "once";
  isActive: boolean;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  triggerType: "xp" | "event_count" | "manual";
  conditionValue: number;
  usersCount: number;
}

interface Level {
  id: string;
  name: string;
  minXP: number;
  color: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  regional: string;
  totalXP: number;
  level: string;
  avatar?: string;
}

// Mock Data
const initialXPRules: XPRule[] = [
  { id: "1", actionKey: "login_daily", label: "Absensi Harian", xpValue: 10, limit: "daily", isActive: true },
  { id: "2", actionKey: "attend_event", label: "Menghadiri Event", xpValue: 50, limit: "no_limit", isActive: true },
  { id: "3", actionKey: "complete_profile", label: "Lengkapi Profil", xpValue: 100, limit: "once", isActive: true },
  { id: "4", actionKey: "invite_member", label: "Mengundang Anggota", xpValue: 25, limit: "no_limit", isActive: true },
  { id: "5", actionKey: "submit_report", label: "Kirim Laporan Kegiatan", xpValue: 30, limit: "no_limit", isActive: false },
];

const initialBadges: Badge[] = [
  { id: "1", name: "Veteran Jatim", icon: "🏆", triggerType: "xp", conditionValue: 5000, usersCount: 45 },
  { id: "2", name: "Event Master", icon: "🎯", triggerType: "event_count", conditionValue: 10, usersCount: 120 },
  { id: "3", name: "Khodim Teladan", icon: "⭐", triggerType: "manual", conditionValue: 0, usersCount: 15 },
  { id: "4", name: "Pioneer", icon: "🚀", triggerType: "xp", conditionValue: 1000, usersCount: 280 },
];

const initialLevels: Level[] = [
  { id: "1", name: "Muhibbin", minXP: 0, color: "#94a3b8" },
  { id: "2", name: "Penggerak", minXP: 500, color: "#22c55e" },
  { id: "3", name: "Aktivis", minXP: 1500, color: "#3b82f6" },
  { id: "4", name: "Khodim", minXP: 3000, color: "#8b5cf6" },
  { id: "5", name: "Tokoh", minXP: 5000, color: "#f59e0b" },
];

const leaderboardData: LeaderboardUser[] = [
  { rank: 1, name: "Ahmad Fauzi", regional: "Malang Raya", totalXP: 8500, level: "Tokoh" },
  { rank: 2, name: "Siti Aminah", regional: "Surabaya Raya", totalXP: 7200, level: "Tokoh" },
  { rank: 3, name: "Muhammad Hasan", regional: "Jombang Raya", totalXP: 6800, level: "Tokoh" },
  { rank: 4, name: "Fatimah Zahra", regional: "Kediri Raya", totalXP: 5500, level: "Tokoh" },
  { rank: 5, name: "Abdullah Rahman", regional: "Tapal Kuda", totalXP: 4800, level: "Khodim" },
  { rank: 6, name: "Khadijah Aisyah", regional: "Madura Raya", totalXP: 4200, level: "Khodim" },
  { rank: 7, name: "Umar Faruq", regional: "Malang Raya", totalXP: 3900, level: "Khodim" },
  { rank: 8, name: "Zainab Hawa", regional: "Surabaya Raya", totalXP: 3500, level: "Khodim" },
  { rank: 9, name: "Ali Imran", regional: "Blitar Raya", totalXP: 3100, level: "Khodim" },
  { rank: 10, name: "Maryam Salma", regional: "Madiun Raya", totalXP: 2800, level: "Aktivis" },
];

const Gamifikasi = () => {
  const [xpRules, setXPRules] = useState<XPRule[]>(initialXPRules);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [levels, setLevels] = useState<Level[]>(initialLevels);
  
  // Dialog states
  const [isXPDialogOpen, setIsXPDialogOpen] = useState(false);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Form states
  const [editingXP, setEditingXP] = useState<XPRule | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  
  const [xpForm, setXPForm] = useState<{ actionKey: string; label: string; xpValue: number; limit: "no_limit" | "daily" | "once" }>({ actionKey: "", label: "", xpValue: 10, limit: "no_limit" });
  const [badgeForm, setBadgeForm] = useState<{ name: string; icon: string; triggerType: "xp" | "event_count" | "manual"; conditionValue: number }>({ name: "", icon: "🏆", triggerType: "xp", conditionValue: 0 });
  const [levelForm, setLevelForm] = useState({ name: "", minXP: 0, color: "#22c55e" });
  
  const [leaderboardFilter, setLeaderboardFilter] = useState<"all" | "monthly">("all");

  // XP Rules handlers
  const handleSaveXPRule = () => {
    if (!xpForm.actionKey || !xpForm.label) {
      toast.error("Lengkapi semua field!");
      return;
    }
    
    if (editingXP) {
      setXPRules(prev => prev.map(r => r.id === editingXP.id ? { ...r, ...xpForm } : r));
      toast.success("Rule XP berhasil diperbarui!");
    } else {
      const newRule: XPRule = {
        id: Date.now().toString(),
        ...xpForm,
        isActive: true,
      };
      setXPRules(prev => [...prev, newRule]);
      toast.success("Rule XP berhasil ditambahkan!");
    }
    
    setIsXPDialogOpen(false);
    setEditingXP(null);
    setXPForm({ actionKey: "", label: "", xpValue: 10, limit: "no_limit" });
  };

  const handleToggleXPRule = (id: string) => {
    setXPRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  // Badge handlers
  const handleSaveBadge = () => {
    if (!badgeForm.name) {
      toast.error("Nama badge harus diisi!");
      return;
    }
    
    if (editingBadge) {
      setBadges(prev => prev.map(b => b.id === editingBadge.id ? { ...b, ...badgeForm, usersCount: editingBadge.usersCount } : b));
      toast.success("Badge berhasil diperbarui!");
    } else {
      const newBadge: Badge = {
        id: Date.now().toString(),
        ...badgeForm,
        usersCount: 0,
      };
      setBadges(prev => [...prev, newBadge]);
      toast.success("Badge berhasil ditambahkan!");
    }
    
    setIsBadgeDialogOpen(false);
    setEditingBadge(null);
    setBadgeForm({ name: "", icon: "🏆", triggerType: "xp", conditionValue: 0 });
  };

  // Level handlers
  const handleSaveLevel = () => {
    if (!levelForm.name) {
      toast.error("Nama level harus diisi!");
      return;
    }
    
    if (editingLevel) {
      setLevels(prev => prev.map(l => l.id === editingLevel.id ? { ...l, ...levelForm } : l));
      toast.success("Level berhasil diperbarui!");
    } else {
      const newLevel: Level = {
        id: Date.now().toString(),
        ...levelForm,
      };
      setLevels(prev => [...prev, newLevel].sort((a, b) => a.minXP - b.minXP));
      toast.success("Level berhasil ditambahkan!");
    }
    
    setIsLevelDialogOpen(false);
    setEditingLevel(null);
    setLevelForm({ name: "", minXP: 0, color: "#22c55e" });
  };

  const handleResetSeason = () => {
    toast.success("Season berhasil di-reset!", {
      description: "XP bulanan telah diarsipkan dan direset ke 0.",
    });
    setIsResetDialogOpen(false);
  };

  const getLevelByXP = (xp: number) => {
    const sortedLevels = [...levels].sort((a, b) => b.minXP - a.minXP);
    return sortedLevels.find(l => xp >= l.minXP) || levels[0];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gamifikasi</h1>
        <p className="text-slate-500">Kelola sistem XP, Badge, dan Level untuk engagement member</p>
      </div>

      <Tabs defaultValue="xp" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="xp" className="data-[state=active]:bg-white">
            <Zap className="h-4 w-4 mr-2" />
            Master XP
          </TabsTrigger>
          <TabsTrigger value="badges" className="data-[state=active]:bg-white">
            <Medal className="h-4 w-4 mr-2" />
            Management Badge
          </TabsTrigger>
          <TabsTrigger value="levels" className="data-[state=active]:bg-white">
            <Star className="h-4 w-4 mr-2" />
            Leveling Schema
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Master XP */}
        <TabsContent value="xp">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Aturan Perolehan XP
              </CardTitle>
              <Button
                onClick={() => {
                  setEditingXP(null);
                  setXPForm({ actionKey: "", label: "", xpValue: 10, limit: "no_limit" });
                  setIsXPDialogOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Custom Rule
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action Key</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>XP Value</TableHead>
                    <TableHead>Limit/Cooldown</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {xpRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-mono text-sm text-slate-600">{rule.actionKey}</TableCell>
                      <TableCell className="font-medium">{rule.label}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-sm font-medium">
                          <Zap className="h-3 w-3" />
                          {rule.xpValue}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {rule.limit === "no_limit" ? "Tidak Terbatas" : rule.limit === "daily" ? "1x/Hari" : "1x/Akun"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => handleToggleXPRule(rule.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingXP(rule);
                            setXPForm({ actionKey: rule.actionKey, label: rule.label, xpValue: rule.xpValue, limit: rule.limit });
                            setIsXPDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Management Badge */}
        <TabsContent value="badges">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h3 className="font-bold text-slate-800">{badge.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {badge.triggerType === "xp" && `Min. ${badge.conditionValue} XP`}
                    {badge.triggerType === "event_count" && `${badge.conditionValue} Event`}
                    {badge.triggerType === "manual" && "Manual Award"}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mt-2">
                    <Users className="h-3 w-3" />
                    {badge.usersCount} pemilik
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => {
                      setEditingBadge(badge);
                      setBadgeForm({ name: badge.name, icon: badge.icon, triggerType: badge.triggerType, conditionValue: badge.conditionValue });
                      setIsBadgeDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Card */}
            <Card
              className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-400 cursor-pointer transition-colors"
              onClick={() => {
                setEditingBadge(null);
                setBadgeForm({ name: "", icon: "🏆", triggerType: "xp", conditionValue: 0 });
                setIsBadgeDialogOpen(true);
              }}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[180px]">
                <Plus className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-slate-500 font-medium">Tambah Badge</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Leveling Schema */}
        <TabsContent value="levels">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level List */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-slate-800">Daftar Level</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingLevel(null);
                    setLevelForm({ name: "", minXP: 0, color: "#22c55e" });
                    setIsLevelDialogOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {levels.sort((a, b) => b.minXP - a.minXP).map((level, index) => (
                  <div
                    key={level.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: level.color }}
                    >
                      {levels.length - index}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{level.name}</p>
                      <p className="text-sm text-slate-500">Min. {level.minXP.toLocaleString()} XP</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingLevel(level);
                        setLevelForm({ name: level.name, minXP: level.minXP, color: level.color });
                        setIsLevelDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Preview Profil User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl p-6 text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                    style={{ 
                      border: `4px solid ${getLevelByXP(4500).color}`,
                      boxShadow: `0 0 20px ${getLevelByXP(4500).color}40`
                    }}
                  >
                    👤
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">Ahmad Fauzi</h3>
                  <div
                    className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium mt-2"
                    style={{ backgroundColor: getLevelByXP(4500).color }}
                  >
                    {getLevelByXP(4500).name}
                  </div>
                  <p className="text-slate-500 mt-2">4,500 XP</p>
                  
                  <div className="mt-4 bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-500">Progress ke level berikutnya</span>
                      <span className="font-medium text-emerald-600">500 XP lagi</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: "90%",
                          backgroundColor: getLevelByXP(4500).color
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: Leaderboard */}
        <TabsContent value="leaderboard">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top 100 Users
              </CardTitle>
              <div className="flex items-center gap-3">
                <Select value={leaderboardFilter} onValueChange={(v: "all" | "monthly") => setLeaderboardFilter(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Global All Time</SelectItem>
                    <SelectItem value="monthly">Monthly Season</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setIsResetDialogOpen(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset Season
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Regional</TableHead>
                    <TableHead>Total XP</TableHead>
                    <TableHead>Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((user) => (
                    <TableRow key={user.rank}>
                      <TableCell>
                        {user.rank <= 3 ? (
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white",
                            user.rank === 1 && "bg-amber-500",
                            user.rank === 2 && "bg-slate-400",
                            user.rank === 3 && "bg-amber-700"
                          )}>
                            {user.rank === 1 ? <Crown className="h-4 w-4" /> : user.rank}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium">{user.rank}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">
                            👤
                          </div>
                          <span className="font-medium text-slate-800">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{user.regional}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-sm font-medium">
                          <Zap className="h-3 w-3" />
                          {user.totalXP.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="px-2 py-1 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: getLevelByXP(user.totalXP).color }}
                        >
                          {user.level}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* XP Rule Dialog */}
      <Dialog open={isXPDialogOpen} onOpenChange={setIsXPDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingXP ? "Edit Rule XP" : "Tambah Rule XP"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Action Key</Label>
              <Input
                value={xpForm.actionKey}
                onChange={(e) => setXPForm({ ...xpForm, actionKey: e.target.value })}
                placeholder="e.g., login_daily"
              />
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={xpForm.label}
                onChange={(e) => setXPForm({ ...xpForm, label: e.target.value })}
                placeholder="e.g., Absensi Harian"
              />
            </div>
            <div className="space-y-2">
              <Label>XP Value</Label>
              <Input
                type="number"
                value={xpForm.xpValue}
                onChange={(e) => setXPForm({ ...xpForm, xpValue: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Limit/Cooldown</Label>
              <Select
                value={xpForm.limit}
                onValueChange={(v: "no_limit" | "daily" | "once") => setXPForm({ ...xpForm, limit: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="no_limit">Tidak Terbatas</SelectItem>
                  <SelectItem value="daily">1x/Hari</SelectItem>
                  <SelectItem value="once">1x/Akun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsXPDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveXPRule} className="bg-emerald-600 hover:bg-emerald-700">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Dialog */}
      <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBadge ? "Edit Badge" : "Tambah Badge Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Badge Icon (Emoji)</Label>
              <Input
                value={badgeForm.icon}
                onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                placeholder="🏆"
                className="text-center text-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Badge Name</Label>
              <Input
                value={badgeForm.name}
                onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                placeholder="e.g., Veteran Jatim"
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select
                value={badgeForm.triggerType}
                onValueChange={(v: "xp" | "event_count" | "manual") => setBadgeForm({ ...badgeForm, triggerType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="xp">Automatic by XP</SelectItem>
                  <SelectItem value="event_count">Automatic by Event Count</SelectItem>
                  <SelectItem value="manual">Manual Award</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {badgeForm.triggerType !== "manual" && (
              <div className="space-y-2">
                <Label>Condition Value ({badgeForm.triggerType === "xp" ? "Min XP" : "Event Count"})</Label>
                <Input
                  type="number"
                  value={badgeForm.conditionValue}
                  onChange={(e) => setBadgeForm({ ...badgeForm, conditionValue: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBadgeDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveBadge} className="bg-emerald-600 hover:bg-emerald-700">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Level Dialog */}
      <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLevel ? "Edit Level" : "Tambah Level Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Level Name</Label>
              <Input
                value={levelForm.name}
                onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                placeholder="e.g., Khodim"
              />
            </div>
            <div className="space-y-2">
              <Label>Min XP</Label>
              <Input
                type="number"
                value={levelForm.minXP}
                onChange={(e) => setLevelForm({ ...levelForm, minXP: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={levelForm.color}
                  onChange={(e) => setLevelForm({ ...levelForm, color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={levelForm.color}
                  onChange={(e) => setLevelForm({ ...levelForm, color: e.target.value })}
                  placeholder="#22c55e"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLevelDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveLevel} className="bg-emerald-600 hover:bg-emerald-700">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Season Confirmation */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Season?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan mengarsipkan XP bulanan ke History dan mereset XP Monthly ke 0 untuk semua user.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetSeason}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Reset Season
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Gamifikasi;
