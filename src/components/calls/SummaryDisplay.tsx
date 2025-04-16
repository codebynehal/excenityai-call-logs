
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryDisplayProps {
  summary: string | undefined;
}

const SummaryDisplay = ({ summary }: SummaryDisplayProps) => {
  return (
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
        {summary ? (
          <div className="bg-secondary/40 backdrop-blur-sm p-4 rounded-lg">
            <p className="leading-relaxed whitespace-pre-line">
              {summary}
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
  );
};

export default SummaryDisplay;
