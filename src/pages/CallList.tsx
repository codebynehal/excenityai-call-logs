
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCallContext } from "@/contexts/CallContext";
import CallFilters from "@/components/calls/CallFilters";
import CallTabs from "@/components/calls/CallTabs";

const CallList = () => {
  const { callType } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { calls, isLoading } = useCallContext();
  
  // Get page from URL or default to 1
  const pageFromUrl = searchParams.get("page");
  const initialPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
  
  const [filteredCalls, setFilteredCalls] = useState<typeof calls>([]);
  const [tab, setTab] = useState(callType || "all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [assistantFilter, setAssistantFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize] = useState(10);
  const [paginatedCalls, setPaginatedCalls] = useState<typeof calls>([]);

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
    
    // Reset to first page when filters change
    setCurrentPage(1);
    
    // Update URL without page parameter when filters change
    setSearchParams({});
  }, [calls, tab, assistantFilter, sortBy, searchTerm, setSearchParams]);

  // Handle pagination
  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const paginatedItems = filteredCalls.slice(start, start + pageSize);
    setPaginatedCalls(paginatedItems);
    
    // Update URL with current page
    if (currentPage > 1) {
      setSearchParams({ page: currentPage.toString() });
    } else {
      // Remove page parameter if on first page
      if (searchParams.has('page')) {
        searchParams.delete('page');
        setSearchParams(searchParams);
      }
    }
  }, [currentPage, pageSize, filteredCalls, searchParams, setSearchParams]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / pageSize));

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
