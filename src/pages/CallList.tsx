
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CallRecord, fetchCalls, getUserAllowedAssistantIds } from "@/services/vapiService";
import CallListItem from "@/components/calls/CallListItem";
import { Phone, PhoneCall, Clock, Filter, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CallList = () => {
  const { callType } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState(callType || "all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [allowedAssistantIds, setAllowedAssistantIds] = useState<string[]>([]);
  const [assistantFilter, setAssistantFilter] = useState<string>("all");

  // Load calls
  useEffect(() => {
    const loadCalls = async () => {
      setIsLoading(true);
      try {
        const callsData = await fetchCalls();
        setCalls(callsData);
        
        // Load allowed assistant IDs for the current user (if not admin)
        if (user && !isAdmin && user.email) {
          const assistantIds = await getUserAllowedAssistantIds(user.email);
          setAllowedAssistantIds(assistantIds);
        }
      } catch (error) {
        console.error("Failed to load calls:", error);
        toast.error("Failed to load calls. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCalls();
  }, [user, isAdmin]);

  // Filter calls based on tab, permissions, and assistantFilter
  useEffect(() => {
    let filtered = [...calls];
    
    // Filter by call type if not "all"
    if (tab !== "all") {
      filtered = filtered.filter(call => call.callType === tab);
    }
    
    // Filter by assistant if selected
    if (assistantFilter !== "all") {
      filtered = filtered.filter(call => call.assistantId === assistantFilter);
    }
    
    // If user is not admin, only show calls from allowed assistants
    if (user && !isAdmin && allowedAssistantIds && Array.isArray(allowedAssistantIds)) {
      if (allowedAssistantIds.length > 0) {
        filtered = filtered.filter(call => 
          allowedAssistantIds.includes(call.assistantId)
        );
      } else {
        // If user has no allowed assistants, show no calls
        filtered = [];
      }
    }
    
    // Sort calls
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredCalls(filtered);
  }, [calls, tab, assistantFilter, sortBy, isAdmin, user, allowedAssistantIds]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTab(value);
    // Update URL without full reload
    navigate(`/calls/${value === "all" ? "" : value}`, { replace: true });
  };

  // Get unique assistant IDs for the filter
  const uniqueAssistantIds = Array.from(new Set(calls.map(call => call.assistantId)));

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as "newest" | "oldest")}
            >
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={assistantFilter}
              onValueChange={setAssistantFilter}
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Assistant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assistants</SelectItem>
                {uniqueAssistantIds.map(id => (
                  <SelectItem key={id} value={id}>
                    {id.substring(0, 8)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue={tab} value={tab} onValueChange={handleTabChange}>
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
            <CallListContent 
              calls={filteredCalls} 
              isLoading={isLoading} 
              count={calls.length}
              onCallClick={(callId) => navigate(`/calls/details/${callId}`)}
            />
          </TabsContent>
          
          <TabsContent value="inboundPhoneCall" className="mt-0">
            <CallListContent 
              calls={filteredCalls} 
              isLoading={isLoading} 
              count={calls.filter(c => c.callType === "inboundPhoneCall").length}
              onCallClick={(callId) => navigate(`/calls/details/${callId}`)}
            />
          </TabsContent>
          
          <TabsContent value="outboundPhoneCall" className="mt-0">
            <CallListContent 
              calls={filteredCalls} 
              isLoading={isLoading} 
              count={calls.filter(c => c.callType === "outboundPhoneCall").length}
              onCallClick={(callId) => navigate(`/calls/details/${callId}`)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

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

export default CallList;
