import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComingSoonOverlayProps {
  title: string;
  description?: string;
}

const ComingSoonOverlay = ({ title, description }: ComingSoonOverlayProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-sm w-full text-center">
        <CardContent className="p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Construction className="h-8 w-8 text-amber-600" />
          </div>
          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
            Coming Soon
          </Badge>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {description || "Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonOverlay;
