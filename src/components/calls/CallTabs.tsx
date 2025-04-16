
import React from "react";
import { Phone, PhoneCall, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CallRecord } from "@/services/vapiService";

interface CallTabsProps {
  tab: string;
  onTabChange: (value: string) => void;
  calls: CallRecord[];
  filteredCalls: CallRecord[];
  isLoading: boolean;
  onCallClick: (callId: string) => void;
}

const CallTabs = ({ 
  tab, 
  onTabChange, 
  calls, 
  filteredCalls, 
  isLoading, 
  onCallClick 
}: CallTabsProps) => {
  const inboundCallCount = calls.filter(c => c.callType === "inboundPhoneCall").length;
  const outboundCallCount = calls.filter(c => c.callType === "outboundPhoneCall").length;

  // Import needed to prevent circular dependency
  const CallListContent = React.lazy(() => import("./CallListContent"));

  return (
    <Tabs defaultValue={tab} value={tab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          All Calls
        </TabsTrigger>
        <TabsTrigger value="inboundPhoneCall" className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4" />
          Inbound
        </TabsTrigger>
        <TabsTrigger value="outboundPhoneCall" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Outbound
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <React.Suspense fallback={<div>Loading...</div>}>
          <CallListContent 
            calls={filteredCalls} 
            isLoading={isLoading} 
            count={calls.length}
            onCallClick={onCallClick}
          />
        </React.Suspense>
      </TabsContent>
      
      <TabsContent value="inboundPhoneCall" className="mt-0">
        <React.Suspense fallback={<div>Loading...</div>}>
          <CallListContent 
            calls={filteredCalls} 
            isLoading={isLoading} 
            count={inboundCallCount}
            onCallClick={onCallClick}
          />
        </React.Suspense>
      </TabsContent>
      
      <TabsContent value="outboundPhoneCall" className="mt-0">
        <React.Suspense fallback={<div>Loading...</div>}>
          <CallListContent 
            calls={filteredCalls} 
            isLoading={isLoading} 
            count={outboundCallCount}
            onCallClick={onCallClick}
          />
        </React.Suspense>
      </TabsContent>
    </Tabs>
  );
};

export default CallTabs;
