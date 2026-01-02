import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Shield,
  Building2,
  DollarSign,
  UserCheck,
  Activity,
  Menu,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoMpj from "@/assets/logo-mpj.png";
import UserManagement from "@/components/super-admin/UserManagement";
import MajelisOverview from "@/components/majelis-dashboard/MajelisOverview";

type ViewType = 'dashboard' | 'users' | 'audit' | 'settings' | 'hierarchy';

const menuItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hierarchy' as ViewType, label: 'Hierarki Data', icon: Layers },
  { id: 'users' as ViewType, label: 'User Management', icon: Users },
  { id: 'audit' as ViewType, label: 'Audit Log', icon: FileText },
  { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
];

const quickActions = [
  { label: 'User Management', icon: Users, action: 'users' },
  { label: 'System Audit', icon: FileText, action: 'audit' },
  { label: 'Bypass Verification', icon: UserCheck, action: 'bypass' },
];

const recentActivity = [
  { id: 1, user: 'admin_regional@jatim.com', action: 'Login', timestamp: '2 menit lalu', status: 'success' },
  { id: 2, user: 'pesantren.darul@gmail.com', action: 'Registrasi', timestamp: '15 menit lalu', status: 'pending' },
  { id: 3, user: 'media.nurul@gmail.com', action: 'Login', timestamp: '1 jam lalu', status: 'success' },
  { id: 4, user: 'admin_finance@mpj.com', action: 'Login', timestamp: '2 jam lalu', status: 'success' },
  { id: 5, user: 'crew.ahmad@gmail.com', action: 'Registrasi', timestamp: '3 jam lalu', status: 'rejected' },
];

const SuperAdminDashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '...', icon: Users, color: 'text-blue-500' },
    { title: 'Total Pesantren', value: '...', icon: Building2, color: 'text-emerald-500' },
    { title: 'Total Revenue', value: 'Rp 0', icon: DollarSign, color: 'text-amber-500' },
  ]);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch total pesantren (users with nama_pesantren)
      const { count: totalPesantren } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .not("nama_pesantren", "is", null);

      // Fetch paid users for revenue estimate (dummy calc)
      const { count: paidUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status_payment", "paid");

      const revenue = (paidUsers || 0) * 350000; // Rp 350k per user

      setStats([
        { title: 'Total Users', value: String(totalUsers || 0), icon: Users, color: 'text-blue-500' },
        { title: 'Total Pesantren', value: String(totalPesantren || 0), icon: Building2, color: 'text-emerald-500' },
        { title: 'Total Revenue', value: `Rp ${(revenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-amber-500' },
      ]);
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Berhasil keluar",
      description: "Anda telah logout dari sistem.",
    });
    navigate("/login");
  };

  const handleQuickAction = (action: string) => {
    if (action === 'users' || action === 'audit') {
      setActiveView(action as ViewType);
    } else {
      toast({
        title: "Bypass Verification",
        description: "Fitur ini akan segera tersedia.",
      });
    }
  };

  const handleHierarchyNavigate = (view: string) => {
    // Navigate within hierarchy - can be extended later
    console.log('Hierarchy navigate:', view);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement />;
      case 'hierarchy':
        return <MajelisOverview onNavigate={handleHierarchyNavigate} />;
      case 'audit':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Fitur audit log akan segera tersedia.</p>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pengaturan sistem akan segera tersedia.</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.user}</TableCell>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>{activity.timestamp}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              activity.status === 'success' ? 'default' : 
                              activity.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {activity.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-emerald-950 text-white">
      {/* Logo & Title */}
      <div className="p-6 border-b border-emerald-800">
        <div className="flex items-center gap-3">
          <img src={logoMpj} alt="MPJ Logo" className="h-10 w-10 rounded-lg" />
          <div>
            <h1 className="font-bold text-lg">Super Admin</h1>
            <p className="text-xs text-emerald-300">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-emerald-800 text-white'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-emerald-800">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="h-10 w-10 rounded-full bg-emerald-800 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-sm">Super Admin</p>
            <p className="text-xs text-emerald-300">GOD MODE</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Super Admin Control Panel</h1>
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                <Shield className="h-3 w-3 mr-1" />
                GOD MODE
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
