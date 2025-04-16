
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CallRecord } from "@/services/vapiService";
import CallListItem from "@/components/calls/CallListItem";

interface CallListContentProps {
  calls: CallRecord[];
  isLoading: boolean;
  count: number;
  onCallClick: (callId: string) => void;
}

const CallListContent = ({ calls, isLoading, count, onCallClick }: CallListContentProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading calls...</p>
      </div>
    );
  }
  
  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No calls found</p>
        <Badge variant="outline" className="mt-2">
          {count} total calls
        </Badge>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {calls.length} calls
        </span>
        <Badge variant="outline">
          {count} total calls
        </Badge>
      </div>
      
      <Separator />
      
      <div className="grid gap-4">
        {calls.map((call) => (
          <Card key={call.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CallListItem 
              call={call}
              onClick={() => onCallClick(call.id)}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CallListContent;
