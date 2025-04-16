
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CallRecord, fetchCalls } from "@/services/vapiService";
import { useAuth } from "@/contexts/AuthContext";
import CallFilters from "@/components/calls/CallFilters";
import CallTabs from "@/components/calls/CallTabs";

const CallList = () => {
  const { callType } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState(callType || "all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [assistantFilter, setAssistantFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Load calls
  useEffect(() => {
    const loadCalls = async () => {
      setIsLoading(true);
      try {
        // If admin, fetch all calls, otherwise fetch only user's calls
        const callsData = await fetchCalls(isAdmin ? null : user?.email);
        setCalls(callsData);
      } catch (error) {
        console.error("Failed to load calls:", error);
        toast.error("Failed to load calls. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCalls();
  }, [user, isAdmin]);

  // Filter calls based on tab, assistantFilter, and search term
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
    
    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(call => 
        call.customerPhone.toLowerCase().includes(lowercaseSearch) ||
        call.assistantPhone.toLowerCase().includes(lowercaseSearch) ||
        call.assistantName.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Sort calls
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredCalls(filtered);
  }, [calls, tab, assistantFilter, sortBy, searchTerm]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTab(value);
    // Update URL without full reload
    navigate(`/calls/${value === "all" ? "" : value}`, { replace: true });
  };

  // Get unique assistant IDs and names for the filter
  const uniqueAssistants = calls.reduce((acc: {id: string, name: string}[], call) => {
    if (!acc.some(a => a.id === call.assistantId)) {
      acc.push({
        id: call.assistantId,
        name: call.assistantName || `Assistant ${call.assistantId.substring(0, 8)}...`
      });
    }
    return acc;
  }, []);

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
          <CallFilters 
            sortBy={sortBy}
            setSortBy={setSortBy}
            assistantFilter={assistantFilter}
            setAssistantFilter={setAssistantFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            uniqueAssistants={uniqueAssistants}
          />
        </div>
        
        <CallTabs 
          tab={tab}
          onTabChange={handleTabChange}
          calls={calls}
          filteredCalls={filteredCalls}
          isLoading={isLoading}
          onCallClick={(callId) => navigate(`/calls/details/${callId}`)}
        />
      </div>
    </div>
  );
};

export default CallList;
