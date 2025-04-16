
import React from "react";
import { Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CallRecord } from "@/services/types/callTypes";
import CallListContent from "./CallListContent";

interface CallTabsProps {
  tab: string;
  onTabChange: (value: string) => void;
  calls: CallRecord[];
  filteredCalls: CallRecord[];
  isLoading: boolean;
  onCallClick: (callId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
}

const CallTabs = ({ 
  tab, 
  onTabChange, 
  calls, 
  filteredCalls, 
  isLoading, 
  onCallClick,
  currentPage,
  totalPages,
  onPageChange,
  pageSize
}: CallTabsProps) => {
  const inboundCallCount = calls.filter(c => c.callType === "inboundPhoneCall").length;
  const outboundCallCount = calls.filter(c => c.callType === "outboundPhoneCall").length;

  return (
    <Tabs defaultValue={tab} value={tab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          All Calls
        </TabsTrigger>
        <TabsTrigger value="inboundPhoneCall" className="flex items-center gap-2">
          <PhoneIncoming className="h-4 w-4" />
          Inbound
        </TabsTrigger>
        <TabsTrigger value="outboundPhoneCall" className="flex items-center gap-2">
          <PhoneOutgoing className="h-4 w-4" />
          Outbound
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <CallListContent 
          calls={filteredCalls} 
          isLoading={isLoading} 
          count={calls.length}
          onCallClick={onCallClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          pageSize={pageSize}
        />
      </TabsContent>
      
      <TabsContent value="inboundPhoneCall" className="mt-0">
        <CallListContent 
          calls={filteredCalls} 
          isLoading={isLoading} 
          count={inboundCallCount}
          onCallClick={onCallClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          pageSize={pageSize}
        />
      </TabsContent>
      
      <TabsContent value="outboundPhoneCall" className="mt-0">
        <CallListContent 
          calls={filteredCalls} 
          isLoading={isLoading} 
          count={outboundCallCount}
          onCallClick={onCallClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          pageSize={pageSize}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CallTabs;
