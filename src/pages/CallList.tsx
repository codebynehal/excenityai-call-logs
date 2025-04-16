
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, Filter, Search, Phone, PhoneIncoming, PhoneOutgoing, Clock, Calendar } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CallRecord, fetchCalls } from "@/services/vapiService";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define call types
type CallType = "inbound" | "outbound" | "all";
type CallEndReason = "completed" | "missed" | "busy" | "failed" | "all";

// Call list component
export default function CallList() {
  const { callType = "all" } = useParams<{ callType?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedEndReason, setSelectedEndReason] = useState<CallEndReason>("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Fetch calls using React Query
  const { data: calls = [], isLoading, error } = useQuery({
    queryKey: ['calls'],
    queryFn: fetchCalls,
  });

  // Filter the calls based on callType URL parameter
  const filterByCallType = (calls: CallRecord[]): CallRecord[] => {
    if (callType === "all") return calls;
    const mappedType = callType === "inbound" ? "inboundPhoneCall" : "outboundPhoneCall";
    return calls.filter((call) => call.callType === mappedType);
  };

  // Filter calls by search query
  const filterBySearchQuery = (calls: CallRecord[]): CallRecord[] => {
    if (!searchQuery) return calls;
    const query = searchQuery.toLowerCase();
    return calls.filter(
      (call) =>
        call.customerPhone.toLowerCase().includes(query) ||
        call.agentName.toLowerCase().includes(query)
    );
  };

  // Filter calls by agent name
  const filterByAgent = (calls: CallRecord[]): CallRecord[] => {
    if (!selectedAgent) return calls;
    return calls.filter((call) => call.agentName === selectedAgent);
  };

  // Filter calls by end reason
  const filterByEndReason = (calls: CallRecord[]): CallRecord[] => {
    if (selectedEndReason === "all") return calls;
    return calls.filter((call) => call.endReason === selectedEndReason);
  };

  // Apply all filters
  const filteredCalls = filterByEndReason(
    filterByAgent(filterBySearchQuery(filterByCallType(calls)))
  );

  // Get unique agents
  const uniqueAgents = Array.from(new Set(calls.map((call) => call.agentName)));

  // Handle pagination
  const totalCalls = filteredCalls.length;
  const totalPages = Math.max(1, Math.ceil(totalCalls / perPage));
  
  // Ensure current page is valid after filters or per page changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  // Get the paginated slice of calls
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalCalls);
  const paginatedCalls = filteredCalls.slice(startIndex, endIndex);

  // Display the call icon based on call type
  const getCallIcon = (type: string) => {
    return type === "inboundPhoneCall" ? (
      <PhoneIncoming className="h-4 w-4 text-green-500" />
    ) : (
      <PhoneOutgoing className="h-4 w-4 text-blue-500" />
    );
  };

  // Display the badge based on end reason
  const getEndReasonBadge = (reason: string) => {
    switch (reason) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "missed":
        return <Badge className="bg-yellow-600">Missed</Badge>;
      case "busy":
        return <Badge className="bg-orange-600">Busy</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{reason}</Badge>;
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of the middle section
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(currentPage + 1, totalPages - 1);
      
      // Adjust if we're near the start or end
      if (currentPage <= 3) {
        endPage = Math.min(maxPagesToShow - 1, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 2));
      }
      
      // Add ellipsis before middle section if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add middle section
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis after middle section if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {callType === "inbound"
              ? "Inbound Calls"
              : callType === "outbound"
              ? "Outbound Calls"
              : "All Calls"}
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage all your call recordings
          </p>
        </div>
      </div>

      <Card className="border-0 card-gradient shadow">
        <CardHeader className="gap-y-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Call Records</CardTitle>
            <CardDescription>
              {filteredCalls.length} total calls
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search phone or agent..."
                className="pl-8 bg-background/50 w-full sm:w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-background/50">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Agent
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => setSelectedAgent(null)}
                    className={!selectedAgent ? "bg-accent text-white" : ""}
                  >
                    All Agents
                  </DropdownMenuItem>
                  {uniqueAgents.map((agent) => (
                    <DropdownMenuItem
                      key={agent}
                      onClick={() => setSelectedAgent(agent)}
                      className={selectedAgent === agent ? "bg-accent text-white" : ""}
                    >
                      {agent}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    End Reason
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => setSelectedEndReason("all")}
                    className={selectedEndReason === "all" ? "bg-accent text-white" : ""}
                  >
                    All Reasons
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSelectedEndReason("completed")}
                    className={selectedEndReason === "completed" ? "bg-accent text-white" : ""}
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSelectedEndReason("missed")}
                    className={selectedEndReason === "missed" ? "bg-accent text-white" : ""}
                  >
                    Missed
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSelectedEndReason("busy")}
                    className={selectedEndReason === "busy" ? "bg-accent text-white" : ""}
                  >
                    Busy
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSelectedEndReason("failed")}
                    className={selectedEndReason === "failed" ? "bg-accent text-white" : ""}
                  >
                    Failed
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Type</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="hidden md:table-cell">Agent</TableHead>
                  <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                  <TableHead className="hidden md:table-cell">Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-9 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : error ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-destructive">Error loading calls</div>
                        <p className="text-sm text-muted-foreground">Please try again later</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : filteredCalls.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No calls found matching your filters.
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {paginatedCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>{getCallIcon(call.callType)}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          {call.customerPhone}
                          <span className="md:hidden text-xs text-muted-foreground">
                            {call.agentName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {call.agentName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{call.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{call.time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {call.duration}
                      </TableCell>
                      <TableCell>{getEndReasonBadge(call.endReason)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" asChild>
                          <Link to={`/calls/details/${call.id}`}>
                            <Search className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
          </div>
          
          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={perPage.toString()}
                onValueChange={(value) => {
                  setPerPage(Number(value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {startIndex + 1}-{endIndex} of {totalCalls}
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((pageNumber, index) => (
                  <PaginationItem key={index}>
                    {pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end' ? (
                      <div className="px-4 py-2">...</div>
                    ) : (
                      <PaginationLink
                        onClick={() => typeof pageNumber === 'number' && setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
