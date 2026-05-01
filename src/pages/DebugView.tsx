import { useEffect, useState, type ComponentType } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, ArrowRight, Crown, Landmark, WalletCards, Users, UserRound } from "lucide-react";
import {
  DEV_ROLE_PREVIEW_OPTIONS,
  IS_DEV_AUTH_BYPASS_ENABLED,
  getDevPreviewLabel,
  getDevPreviewRole,
  getDevPreviewRoute,
  setDevPreviewRole,
  type DevPreviewRole,
} from "@/config/devAuth";

const ROLE_ICONS: Record<DevPreviewRole, ComponentType<{ className?: string }>> = {
  admin_pusat: Crown,
  admin_regional: Landmark,
  admin_finance: WalletCards,
  user: Users,
  crew: UserRound,
};

export default function DebugView() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<DevPreviewRole>(getDevPreviewRole());

  useEffect(() => {
    if (!IS_DEV_AUTH_BYPASS_ENABLED) {
      return;
    }

    const syncRole = () => setActiveRole(getDevPreviewRole());
    window.addEventListener("mpj-dev-role-preview-change", syncRole as EventListener);
    syncRole();

    return () => {
      window.removeEventListener("mpj-dev-role-preview-change", syncRole as EventListener);
    };
  }, []);

  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  const handleSelectRole = (role: DevPreviewRole) => {
    setDevPreviewRole(role);
    navigate(getDevPreviewRoute(role), { replace: true });
  };

  const currentOption = DEV_ROLE_PREVIEW_OPTIONS.find((option) => option.role === activeRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">MPJ Debug View</h1>
          </div>
          <p className="mx-auto max-w-2xl px-4 text-sm text-slate-600 sm:text-base">
            Role preview hanya aktif di development. Pilih role untuk melihat menu dan dashboard FE yang sesuai tanpa mengubah auth produksi.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">Development Only</Badge>
            <Badge className="border-slate-200 bg-slate-100 text-slate-700">
              Role aktif: {getDevPreviewLabel(activeRole)}
            </Badge>
          </div>
        </div>

        <Card className="border-dashed border-emerald-200 bg-white/80">
          <CardHeader>
            <CardTitle>Pilih Role Preview</CardTitle>
            <CardDescription>Setelah dipilih, aplikasi langsung masuk ke dashboard role terkait.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {DEV_ROLE_PREVIEW_OPTIONS.map((option) => {
                const Icon = ROLE_ICONS[option.role];
                const isActive = option.role === activeRole;

                return (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() => handleSelectRole(option.role)}
                    className={[
                      "text-left rounded-xl border p-4 transition-all",
                      isActive ? "border-emerald-400 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{option.label}</h3>
                          {isActive && <Badge className="bg-emerald-600 text-white">Aktif</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                        <p className="mt-2 text-xs text-slate-500">Route: {option.route}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Ringkasan Role</CardTitle>
            <CardDescription>Ringkasan role aktif saat ini untuk verifikasi cepat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Role: {currentOption?.label ?? "Dev Preview"}</Badge>
              <Badge variant="outline">Mode: Development</Badge>
              <Badge variant="outline">Auth: Bypass DEV</Badge>
            </div>
            <Separator />
            <p className="text-sm text-slate-600">
              Role ini akan diarahkan ke <span className="font-medium text-slate-900">{currentOption?.route ?? "/pusat/beranda"}</span>.
            </p>
            <Button onClick={() => navigate(currentOption?.route ?? "/pusat/beranda", { replace: true })} className="gap-2">
              Buka dashboard aktif
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
