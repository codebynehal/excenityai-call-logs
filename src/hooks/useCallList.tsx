
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useCallContext } from "@/contexts/CallContext";
import { CallRecord } from "@/services/types/callTypes";
import { toast } from "sonner";

export function useCallList() {
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

  return {
    calls,
    filteredCalls,
    paginatedCalls,
    isLoading,
    isRefreshing,
    tab,
    sortBy,
    assistantFilter,
    searchTerm,
    currentPage,
    totalPages,
    pageSize,
    uniqueAssistants,
    handleRefresh,
    handleTabChange,
    handlePageChange,
    setSortBy,
    setAssistantFilter,
    setSearchTerm,
    getLastFetchedText,
    navigateToCallDetails: (callId: string) => navigate(`/calls/details/${callId}`)
  };
}
