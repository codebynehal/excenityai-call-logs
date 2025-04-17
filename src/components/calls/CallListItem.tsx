
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { PhoneIncoming, PhoneOutgoing, User, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { CallRecord } from "@/services/types/callTypes";
import { CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface CallListItemProps {
  call: CallRecord;
  onClick: () => void;
}

const CallListItem = ({ call, onClick }: CallListItemProps) => {
  const isMobile = useIsMobile();

  // Get icon based on call type
  const getCallIcon = () => {
    switch (call.callType) {
      case "inboundPhoneCall":
        return <PhoneIncoming className="h-4 w-4 text-green-500 transition-all duration-300 group-hover:scale-125" />;
      case "outboundPhoneCall":
        return <PhoneOutgoing className="h-4 w-4 text-blue-500 transition-all duration-300 group-hover:scale-125" />;
      case "webCall":
        return <Video className="h-4 w-4 text-purple-500 transition-all duration-300 group-hover:scale-125" />;
      default:
        return <PhoneIncoming className="h-4 w-4 text-gray-500 transition-all duration-300 group-hover:scale-125" />;
    }
  };

  // Format date for display
  const getFormattedTimeAgo = () => {
    try {
      const callDate = new Date(`${call.date} ${call.time}`);
      return formatDistanceToNow(callDate, { addSuffix: true });
    } catch (error) {
      return `${call.date} ${call.time}`;
    }
  };
  
  // Format phone number
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (isMobile) {
    // Mobile-optimized layout with iOS-like list item style
    return (
      <CardContent className="p-0 group" onClick={onClick}>
        <div className="ios-list-item active:bg-secondary/20 transition-all duration-200 hover:bg-accent/10">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full mr-3 transition-all duration-300 group-hover:scale-110",
            call.callType === "inboundPhoneCall" ? "bg-green-500/10" : 
            call.callType === "outboundPhoneCall" ? "bg-blue-500/10" : 
            "bg-purple-500/10"
          )}>
            {getCallIcon()}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between">
              <p className="truncate font-medium text-base transition-colors duration-200 group-hover:text-primary">
                {formatPhoneNumber(call.customerPhone)}
              </p>
              <span className="text-xs text-muted-foreground ml-2">
                {getFormattedTimeAgo()}
              </span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5 group-hover:text-muted-foreground/80 transition-colors duration-200">
              <User className="h-3 w-3 mr-1" />
              <span className="truncate">{call.assistantName}</span>
              <span className="mx-1.5">•</span>
              <span>{call.duration}</span>
            </div>
          </div>
        </div>
      </CardContent>
    );
  }

  // Desktop layout
  return (
    <CardContent 
      className="p-4 transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110",
            call.callType === "inboundPhoneCall" ? "bg-green-500/10" : 
            call.callType === "outboundPhoneCall" ? "bg-blue-500/10" : 
            "bg-purple-500/10"
          )}>
            {getCallIcon()}
          </div>
        </div>
        
        <div className="col-span-3">
          <p className="font-medium transition-colors duration-200 group-hover:text-primary">{formatPhoneNumber(call.customerPhone)}</p>
          <p className="text-sm text-muted-foreground">Customer</p>
        </div>
        
        <div className="col-span-3">
          <p className="font-medium transition-colors duration-200 group-hover:text-primary">{call.assistantName}</p>
          <p className="text-sm text-muted-foreground">Assistant</p>
        </div>
        
        <div className="col-span-2">
          <p className="font-medium">{call.duration}</p>
          <p className="text-sm text-muted-foreground">Duration</p>
        </div>
        
        <div className="col-span-3 text-right">
          <p className="font-medium">{call.date}</p>
          <p className="text-sm text-muted-foreground">{call.time}</p>
        </div>
      </div>
    </CardContent>
  );
};

export default CallListItem;
