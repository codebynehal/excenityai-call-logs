
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquareText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { fetchCallById } from "@/services/vapiService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Import our refactored components
import AudioPlayer from "@/components/calls/AudioPlayer";
import CallInfo from "@/components/calls/CallInfo";
import TranscriptDisplay from "@/components/calls/TranscriptDisplay";
import SummaryDisplay from "@/components/calls/SummaryDisplay";
import CallDetailHeader from "@/components/calls/CallDetailHeader";

export default function CallDetails() {
  const { callId } = useParams<{ callId: string }>();

  // Fetch call data using React Query
  const { data: callRecord, isLoading, error } = useQuery({
    queryKey: ['call', callId],
    queryFn: () => fetchCallById(callId || ''),
    enabled: !!callId,
  });

  useEffect(() => {
    // If there's an error or the call is not found, show a toast
    if (error) {
      toast.error("Failed to load call data");
    }
  }, [error]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error or call not found state
  if (!callRecord) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-bold">Call Not Found</h2>
          <p className="text-muted-foreground">
            The call record you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/calls">Back to Calls</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CallDetailHeader 
        callType={callRecord.callType} 
        recordingUrl={callRecord.recordingUrl}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audio player */}
        <AudioPlayer 
          recordingUrl={callRecord.recordingUrl} 
          customerPhone={callRecord.customerPhone} 
        />

        {/* Call info */}
        <CallInfo call={callRecord} />
      </div>

      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="transcript" className="gap-2">
            <MessageSquareText className="h-4 w-4" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            Summary
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transcript">
          <TranscriptDisplay transcript={callRecord.transcript} />
        </TabsContent>
        <TabsContent value="summary">
          <SummaryDisplay summary={callRecord.summary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
