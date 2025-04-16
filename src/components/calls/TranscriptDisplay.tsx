
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareText } from "lucide-react";
import { CallRecord } from "@/services/vapiService";

interface TranscriptDisplayProps {
  transcript: CallRecord['transcript'];
}

const TranscriptDisplay = ({ transcript }: TranscriptDisplayProps) => {
  return (
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
          {transcript && transcript.length > 0 ? (
            transcript.map((entry, index) => (
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
                    {entry.speaker === "AI" ? "AI Assistant" : "Customer"}
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
  );
};

export default TranscriptDisplay;
