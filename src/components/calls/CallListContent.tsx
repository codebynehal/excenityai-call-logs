
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CallRecord } from "@/services/types/callTypes";
import CallListItem from "@/components/calls/CallListItem";
import CallListSkeleton from "@/components/calls/CallListSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

interface CallListContentProps {
  calls: CallRecord[];
  isLoading: boolean;
  count: number;
  onCallClick: (callId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
}

const CallListContent = ({ 
  calls, 
  isLoading, 
  count, 
  onCallClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10
}: CallListContentProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Loading calls...</span>
          <Badge variant="outline" className="animate-pulse">
            Loading...
          </Badge>
        </div>
        <Separator />
        <CallListSkeleton />
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
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    let pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust start and end to always show 3 pages between first and last
      if (start === 2) end = Math.min(totalPages - 1, start + 2);
      if (end === totalPages - 1) start = Math.max(2, end - 2);
      
      // Add ellipsis after first page if needed
      if (start > 2) pages.push(-1); // -1 represents ellipsis
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) pages.push(-2); // -2 represents ellipsis (unique key)
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <div className="space-y-4 w-full flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, count)} of {count} calls
        </span>
        <Badge variant="outline">
          {count} total calls
        </Badge>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 min-h-[300px] h-[calc(100vh-360px)] rounded-md">
        <div className="grid gap-4 w-full pr-4">
          {calls.map((call) => (
            <Card key={call.id} className="cursor-pointer hover:bg-muted/50 transition-colors w-full">
              <CallListItem 
                call={call}
                onClick={() => onCallClick(call.id)}
              />
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {totalPages > 1 && (
        <Pagination className="mt-2 pb-4">
          <PaginationContent className="flex-wrap justify-center">
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(currentPage - 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {getPageNumbers().map((page, i) => (
              <PaginationItem key={`page-${page}-${i}`}>
                {page < 0 ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => onPageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(currentPage + 1)} 
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default CallListContent;
