import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const mockTeamMembers = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    role: "Koordinator",
    avatar: "https://i.pravatar.cc/150?img=33",
    skills: ["Videographer", "Editor"],
  },
  {
    id: 2,
    name: "Siti Aisyah",
    role: "Anggota",
    avatar: "https://i.pravatar.cc/150?img=44",
    skills: ["Desainer", "Ilustrator"],
  },
  {
    id: 3,
    name: "Muhammad Rizki",
    role: "Anggota",
    avatar: "https://i.pravatar.cc/150?img=12",
    skills: ["Writer", "Social Media"],
  },
];

const TimSaya = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rekan Satu Tim</h1>
        <p className="text-muted-foreground">Lihat anggota tim media pesantren Anda</p>
      </div>

      {/* Read Only Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Users className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Mode tampilan saja. Hubungi Koordinator untuk perubahan tim.
        </AlertDescription>
      </Alert>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTeamMembers.map((member) => (
          <Card key={member.id} className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg text-foreground">{member.name}</h3>
                <Badge
                  variant={member.role === "Koordinator" ? "default" : "secondary"}
                  className={
                    member.role === "Koordinator"
                      ? "bg-emerald-600 hover:bg-emerald-700 mt-2"
                      : "mt-2"
                  }
                >
                  {member.role}
                </Badge>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {member.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-xs border-emerald-200 text-emerald-700"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistik Tim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{mockTeamMembers.length}</p>
              <p className="text-sm text-muted-foreground">Total Anggota</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">5</p>
              <p className="text-sm text-muted-foreground">Event Diikuti</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">150</p>
              <p className="text-sm text-muted-foreground">Total XP Tim</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimSaya;
