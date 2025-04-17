
import React from "react";
import { useCallList } from "@/hooks/useCallList";
import CallTabs from "@/components/calls/CallTabs";
import CallListHeader from "@/components/calls/CallListHeader";

const CallList: React.FC = () => {
  const {
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
    navigateToCallDetails
  } = useCallList();

  return (
    <div className="container py-4 max-w-5xl px-2 sm:px-4 md:px-6 mx-auto">
      <div className="flex flex-col gap-4 sm:gap-6">
        <CallListHeader
          lastFetchedText={getLastFetchedText()}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          sortBy={sortBy}
          setSortBy={setSortBy}
          assistantFilter={assistantFilter}
          setAssistantFilter={setAssistantFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          uniqueAssistants={uniqueAssistants}
        />
        
        <CallTabs 
          tab={tab}
          onTabChange={handleTabChange}
          calls={filteredCalls}
          filteredCalls={paginatedCalls}
          isLoading={isLoading}
          onCallClick={navigateToCallDetails}
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
