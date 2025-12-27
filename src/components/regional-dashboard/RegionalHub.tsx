import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Link, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const RegionalHub = () => {
  const hubLinks = [
    {
      title: "Portal Pesantren",
      description: "Akses portal informasi pesantren wilayah",
      url: "#",
      icon: ExternalLink,
    },
    {
      title: "Grup Koordinasi",
      description: "Bergabung dengan grup WhatsApp koordinator",
      url: "#",
      icon: Users,
    },
    {
      title: "Resource Center",
      description: "Unduh materi dan template resmi",
      url: "#",
      icon: Link,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">REGIONAL-HUB</h1>
        <p className="text-muted-foreground mt-1">
          Pusat koordinasi dan informasi wilayah
        </p>
      </div>

      {/* Hub Links Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hubLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {link.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Akses
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-emerald-100">
              <Share2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800">Regional Hub</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Hub ini menyediakan akses cepat ke semua resource dan link penting untuk koordinasi wilayah. 
                Hubungi admin pusat untuk menambahkan link baru.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalHub;
