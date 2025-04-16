
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, Filter, Search, Phone, PhoneIncoming, PhoneOutgoing, Clock, Calendar, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
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

// Define call types
type CallType = "inbound" | "outbound" | "all";
type CallEndReason = "completed" | "missed" | "busy" | "failed" | "all";

// Define the call record type
interface CallRecord {
  id: string;
  callType: "inbound" | "outbound";
  customerPhone: string;
  agentName: string;
  date: string;
  time: string;
  duration: string;
  endReason: "completed" | "missed" | "busy" | "failed";
}

// Mock data for call records
const mockCalls: CallRecord[] = [
  {
    id: "call-1",
    callType: "inbound",
    customerPhone: "+1 (555) 123-4567",
    agentName: "John Doe",
    date: "2025-04-15",
    time: "10:30 AM",
    duration: "5:23",
    endReason: "completed",
  },
  {
    id: "call-2",
    callType: "outbound",
    customerPhone: "+1 (555) 987-6543",
    agentName: "Jane Smith",
    date: "2025-04-15",
    time: "11:45 AM",
    duration: "3:12",
    endReason: "completed",
  },
  {
    id: "call-3",
    callType: "inbound",
    customerPhone: "+1 (555) 456-7890",
    agentName: "Mark Johnson",
    date: "2025-04-14",
    time: "2:15 PM",
    duration: "0:00",
    endReason: "missed",
  },
  {
    id: "call-4",
    callType: "outbound",
    customerPhone: "+1 (555) 222-3333",
    agentName: "Sarah Williams",
    date: "2025-04-14",
    time: "4:30 PM",
    duration: "7:45",
    endReason: "completed",
  },
  {
    id: "call-5",
    callType: "inbound",
    customerPhone: "+1 (555) 777-8888",
    agentName: "John Doe",
    date: "2025-04-13",
    time: "9:10 AM",
    duration: "0:00",
    endReason: "busy",
  },
  {
    id: "call-6",
    callType: "outbound",
    customerPhone: "+1 (555) 444-5555",
    agentName: "Jane Smith",
    date: "2025-04-13",
    time: "3:20 PM",
    duration: "0:00",
    endReason: "failed",
  },
];

// Call list component
export default function CallList() {
  const { callType = "all" } = useParams<{ callType?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedEndReason, setSelectedEndReason] = useState<CallEndReason>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Filter the calls based on callType URL parameter
  const filterByCallType = (calls: CallRecord[]): CallRecord[] => {
    if (callType === "all") return calls;
    return calls.filter((call) => call.callType === callType);
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
    filterByAgent(filterBySearchQuery(filterByCallType(mockCalls)))
  );

  // Get unique agents
  const uniqueAgents = Array.from(new Set(mockCalls.map((call) => call.agentName)));

  // Display the call icon based on call type
  const getCallIcon = (type: "inbound" | "outbound") => {
    return type === "inbound" ? (
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
              ) : (
                <TableBody>
                  {filteredCalls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No calls found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCalls.map((call) => (
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
                    ))
                  )}
                </TableBody>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
