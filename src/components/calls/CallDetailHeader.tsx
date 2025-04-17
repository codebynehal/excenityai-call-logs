
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { toast } from "sonner";

interface CallDetailHeaderProps {
  callType?: string;
  recordingUrl?: string;
}

const CallDetailHeader = ({ callType, recordingUrl }: CallDetailHeaderProps) => {
  // Display the call icon based on call type
  const getCallIcon = (type?: string) => {
    if (!type) return null;
    return type === "inboundPhoneCall" ? (
      <PhoneIncoming className="h-5 w-5 text-green-500" />
    ) : (
      <PhoneOutgoing className="h-5 w-5 text-blue-500" />
    );
  };

  // Download recording function
  const downloadRecording = () => {
    if (recordingUrl) {
      window.open(recordingUrl, '_blank');
    } else {
      toast.error("No recording available for this call");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="hover-scale">
          <Link to="/calls">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 hover-scale">
          {getCallIcon(callType)}
          Call Details
        </h1>
      </div>
      <Button
        variant="outline"
        className="gap-2 w-full sm:w-auto hover-glow"
        onClick={downloadRecording}
        disabled={!recordingUrl}
      >
        <Download className="h-4 w-4" />
        Download Recording
      </Button>
    </div>
  );
};

export default CallDetailHeader;
