
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Calendar, Clock, User, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { CallRecord } from "@/services/vapiService";

interface CallInfoProps {
  call: CallRecord;
}

const CallInfo = ({ call }: CallInfoProps) => {
  // Display the call icon based on call type
  const getCallIcon = (type?: string) => {
    if (!type) return null;
    return type === "inboundPhoneCall" ? (
      <PhoneIncoming className="h-5 w-5 text-green-500" />
    ) : (
      <PhoneOutgoing className="h-5 w-5 text-blue-500" />
    );
  };

  return (
    <Card className="border-0 card-gradient shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-orange-500" />
          Call Information
        </CardTitle>
        <CardDescription>
          Details about this call
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Call Type</span>
            <div className="flex items-center gap-1.5">
              {getCallIcon(call.callType)}
              <span className="font-medium">
                {call.callType === "outboundPhoneCall" ? "Outbound" : "Inbound"}
              </span>
            </div>
          </div>
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Agent</span>
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{call.agentName}</span>
            </div>
          </div>
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Date</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{call.date}</span>
            </div>
          </div>
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Time</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{call.time}</span>
            </div>
          </div>
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duration</span>
            <span className="font-medium">{call.duration}</span>
          </div>
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Phone Number</span>
            <span className="font-medium">{call.customerPhone}</span>
          </div>
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Assistant</span>
            <span className="font-medium">{call.assistantName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallInfo;
