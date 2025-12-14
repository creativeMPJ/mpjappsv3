import { Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type EventStatus = "UPCOMING" | "COMPLETED";

export interface EventData {
  id: string;
  judul: string;
  waktu: string;
  lokasi: string;
  status: EventStatus;
  poster?: string;
  pesertaCount?: number;
}

interface EventCardProps {
  event: EventData;
  onManage: (event: EventData) => void;
}

const EventCard = ({ event, onManage }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
      {/* Image Area with 4:5 ratio */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.judul}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30">
            <div className="text-center p-4">
              <Calendar className="h-12 w-12 mx-auto text-emerald-600/50 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Event Poster</p>
            </div>
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <Badge
          className={`absolute top-3 right-3 ${
            event.status === "COMPLETED"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {event.status === "COMPLETED" ? "Completed" : "Upcoming"}
        </Badge>
      </div>

      {/* Content Area */}
      <CardContent className="p-4 space-y-3">
        {/* Title - truncated to 2 lines */}
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem] leading-tight">
          {event.judul}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{formatDate(event.waktu)}</span>
        </div>

        {/* Participant count */}
        {event.pesertaCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{event.pesertaCount} Peserta</span>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full mt-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          onClick={(e) => {
            e.stopPropagation();
            onManage(event);
          }}
        >
          Kelola Event
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventCard;
