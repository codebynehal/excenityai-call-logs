
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Download, Headphones, MessageSquareText, Phone, PhoneIncoming, PhoneOutgoing, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// Define the call record type
interface CallRecord {
  id: string;
  callType: "outboundPhoneCall" | "inboundPhoneCall";
  customerPhone: string;
  agentName: string;
  date: string;
  time: string;
  duration: string;
  endReason: string;
  recordingUrl?: string;
  summary?: string;
  transcript?: {
    time: string;
    speaker: string;
    message: string;
  }[];
}

// Mock data based on the sample call record
const mockCallRecord: CallRecord = {
  id: "3743b66d-6e42-4321-9919-3b48ba875818",
  callType: "outboundPhoneCall",
  customerPhone: "+61411453140",
  agentName: "Jessica",
  date: "2025-04-16",
  time: "03:09 AM",
  duration: "1:03",
  endReason: "customer-ended-call",
  recordingUrl: "https://storage.vapi.ai/3743b66d-6e42-4321-9919-3b48ba875818-1744773051620-49d24ed8-dfdc-4560-8f32-c6125ab83886-mono.wav",
  summary: `The call was between Jessica from Business Jam and Matt, who had previously used their business valuation tool. 
  
  Key Points:
  - Jessica called to follow up on Matt's use of their business valuation tool
  - Matt indicated he thought the valuation estimate was "a little bit low"
  - Jessica offered to ask additional questions to provide a more refined valuation
  - Matt agreed to answer questions, but his subsequent responses became incoherent and disjointed`,
  transcript: [
    {
      time: "0:00",
      speaker: "AI",
      message: "Hi, Matt. It's Jessica from Business Jam. You used our business valuation tool recently. Just wanted to check what you thought of the estimate that came through."
    },
    {
      time: "0:19",
      speaker: "Matt",
      message: "It seems a little bit low."
    },
    {
      time: "0:26",
      speaker: "AI",
      message: "Oh, I see. Well, I'm here to give you a more refined version. Sometimes the tool doesn't catch everything, and a few extra details can make a big difference. Would it be okay if I ask a few quick questions?"
    },
    {
      time: "0:52",
      speaker: "Matt",
      message: "Yeah. No problem. Maybe you can't be hearing that. No doubt, sir. Back end of the van. Yes. That's that's okay. Yeah. At least music. Yeah."
    }
  ]
};

export default function CallDetails() {
  const { callId } = useParams<{ callId: string }>();
  const [callRecord, setCallRecord] = useState<CallRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch call data (using mock data for now)
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setCallRecord(mockCallRecord);
      setIsLoading(false);
    }, 1000);
  }, [callId]);

  // Audio player controls
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Download recording function
  const downloadRecording = () => {
    if (callRecord?.recordingUrl) {
      const link = document.createElement('a');
      link.href = callRecord.recordingUrl;
      link.download = `call-recording-${callId}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Display the call icon based on call type
  const getCallIcon = (type?: string) => {
    if (!type) return null;
    return type === "inboundPhoneCall" ? (
      <PhoneIncoming className="h-5 w-5 text-green-500" />
    ) : (
      <PhoneOutgoing className="h-5 w-5 text-blue-500" />
    );
  };

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

  // Error state
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/calls">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {getCallIcon(callRecord.callType)}
            Call Details
          </h1>
        </div>
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={downloadRecording}
        >
          <Download className="h-4 w-4" />
          Download Recording
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audio player */}
        <Card className="lg:col-span-2 border-0 card-gradient shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-orange-500" />
              Call Recording
            </CardTitle>
            <CardDescription>
              Listen to the call recording and control playback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <audio 
              ref={audioRef} 
              src={callRecord.recordingUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              className="hidden"
            />
            
            <div className="w-full h-32 bg-background/20 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-orange-400 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-4">
                <div className="text-2xl font-semibold tracking-tighter text-center">
                  {callRecord.customerPhone}
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{formatTime(currentTime)}</span>
                  <div className="relative w-64 h-1 bg-gray-700 rounded-full">
                    <div 
                      className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{formatTime(duration)}</span>
                </div>
                
                <Button 
                  onClick={togglePlayPause} 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call info */}
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
                  {getCallIcon(callRecord.callType)}
                  <span className="font-medium">
                    {callRecord.callType === "outboundPhoneCall" ? "Outbound" : "Inbound"}
                  </span>
                </div>
              </div>
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Agent</span>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{callRecord.agentName}</span>
                </div>
              </div>
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{callRecord.date}</span>
                </div>
              </div>
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{callRecord.time}</span>
                </div>
              </div>
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-medium">{callRecord.duration}</span>
              </div>
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone Number</span>
                <span className="font-medium">{callRecord.customerPhone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <Card className="border-0 card-gradient shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-orange-500" />
                Call Transcript
              </CardTitle>
              <CardDescription>
                Complete transcript of the conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {callRecord.transcript ? (
                  callRecord.transcript.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`flex gap-4 ${
                        entry.speaker === "AI" 
                          ? "flex-row" 
                          : "flex-row-reverse"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          entry.speaker === "AI" 
                            ? "bg-orange-500" 
                            : "bg-gray-600"
                        }`}>
                          {entry.speaker === "AI" ? "A" : "C"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.time}
                        </div>
                      </div>
                      <div className={`max-w-[75%] rounded-lg p-3 ${
                        entry.speaker === "AI" 
                          ? "bg-secondary rounded-tl-none" 
                          : "bg-muted rounded-tr-none"
                      }`}>
                        <div className="text-sm font-medium mb-1">
                          {entry.speaker}
                        </div>
                        <div className="text-sm">
                          {entry.message}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No transcript available for this call.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="summary">
          <Card className="border-0 card-gradient shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-orange-500">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                Call Summary
              </CardTitle>
              <CardDescription>
                AI-generated summary of the conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {callRecord.summary ? (
                <div className="bg-secondary/40 backdrop-blur-sm p-4 rounded-lg">
                  <p className="leading-relaxed">
                    {callRecord.summary}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No summary available for this call.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
