
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCallContext } from "@/contexts/CallContext";
import CallFilters from "@/components/calls/CallFilters";
import CallTabs from "@/components/calls/CallTabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { CallRecord } from "@/services/types/callTypes";

const CallList = () => {
  const { callType } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { calls, isLoading, refreshCalls, lastFetched } = useCallContext();
  
  // Get page from URL or default to 1
  const pageFromUrl = searchParams.get("page");
  const initialPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
  
  const [filteredCalls, setFilteredCalls] = useState<CallRecord[]>([]);
  const [tab, setTab] = useState(callType || "all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [assistantFilter, setAssistantFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize] = useState(10);
  const [paginatedCalls, setPaginatedCalls] = useState<CallRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Update tab from URL parameter when component mounts or URL changes
  useEffect(() => {
    if (callType) {
      setTab(callType);
    }
  }, [callType]);

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
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    
    // Reset to first page when filters change
    if (searchTerm || assistantFilter !== "all" || sortBy) {
      setCurrentPage(1);
      // Update URL without page parameter when filters change
      if (searchParams.has('page')) {
        searchParams.delete('page');
        setSearchParams(searchParams);
      }
    }
  }, [calls, tab, assistantFilter, sortBy, searchTerm, pageSize]);

  // Handle pagination
  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const paginatedItems = filteredCalls.slice(start, start + pageSize);
    setPaginatedCalls(paginatedItems);
    
    // Update URL with current page
    if (currentPage > 1) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', currentPage.toString());
        return newParams;
      });
    } else {
      // Remove page parameter if on first page
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (newParams.has('page')) {
          newParams.delete('page');
        }
        return newParams;
      });
    }
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, pageSize, filteredCalls, setSearchParams]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTab(value);
    // Update URL without full reload
    navigate(`/calls/${value === "all" ? "" : value}`, { replace: true });
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCalls();
      toast.success("Call list refreshed successfully");
    } catch (error) {
      console.error("Error refreshing calls:", error);
    } finally {
      setIsRefreshing(false);
    }
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

  // Format last fetched time
  const getLastFetchedText = () => {
    if (!lastFetched) return "Never refreshed";
    
    const now = new Date();
    const diffMs = now.getTime() - lastFetched.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Updated just now";
    if (diffMins === 1) return "Updated 1 minute ago";
    return `Updated ${diffMins} minutes ago`;
  };

  return (
    <div className="container py-4 max-w-5xl px-2 sm:px-4 md:px-6 mx-auto">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
            <p className="text-sm text-muted-foreground">{getLastFetchedText()}</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
        </div>
        
        <CallTabs 
          tab={tab}
          onTabChange={handleTabChange}
          calls={filteredCalls}
          filteredCalls={paginatedCalls}
          isLoading={isLoading}
          onCallClick={(callId) => navigate(`/calls/details/${callId}`)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
};

export default CallList;
