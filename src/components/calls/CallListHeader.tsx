
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import CallFilters from "@/components/calls/CallFilters";

interface CallListHeaderProps {
  lastFetchedText: string;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  sortBy: "newest" | "oldest";
  setSortBy: (sort: "newest" | "oldest") => void;
  assistantFilter: string;
  setAssistantFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  uniqueAssistants: { id: string; name: string }[];
}

const CallListHeader: React.FC<CallListHeaderProps> = ({
  lastFetchedText,
  isLoading,
  isRefreshing,
  onRefresh,
  sortBy,
  setSortBy,
  assistantFilter,
  setAssistantFilter,
  searchTerm,
  setSearchTerm,
  uniqueAssistants
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
        <p className="text-sm text-muted-foreground">{lastFetchedText}</p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
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
  );
};

export default CallListHeader;
