
import React from "react";
import { CallRecord } from "@/services/vapiService";
import { Badge } from "@/components/ui/badge";
import { 
  PhoneCall, 
  PhoneOutgoing,
  Calendar, 
  Clock, 
  User, 
  MessageSquare
} from "lucide-react";

interface CallListItemProps {
  call: CallRecord;
  onClick?: () => void;
}

const CallListItem = ({ call, onClick }: CallListItemProps) => {
  const isInbound = call.callType === "inboundPhoneCall";
  
  return (
    <div 
      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" 
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className="bg-muted rounded-full p-2">
          {isInbound ? (
            <PhoneCall className="h-5 w-5 text-primary" />
          ) : (
            <PhoneOutgoing className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <h3 className="font-medium">
            {isInbound ? call.customerPhone : call.assistantPhone}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={isInbound ? "default" : "secondary"} className="capitalize">
              {isInbound ? "Inbound" : "Outbound"}
            </Badge>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {call.assistantId ? call.assistantId.substring(0, 8) + "..." : "Unknown"}
              </span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{call.date}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{call.time}</span>
        </div>
        {call.transcript && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span>
              {typeof call.transcript === 'string' 
                ? call.transcript.substring(0, 30) + "..." 
                : call.transcript[0]?.message.substring(0, 30) + "..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallListItem;
