
import React from "react";
import { Calendar, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSearch } from "@/components/admin/AdminSearch";

interface CallFiltersProps {
  sortBy: "newest" | "oldest";
  setSortBy: (value: "newest" | "oldest") => void;
  assistantFilter: string;
  setAssistantFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  uniqueAssistants: { id: string; name: string }[];
}

const CallFilters = ({
  sortBy,
  setSortBy,
  assistantFilter,
  setAssistantFilter,
  searchTerm,
  setSearchTerm,
  uniqueAssistants
}: CallFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <AdminSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
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
            {uniqueAssistants.map(assistant => (
              <SelectItem key={assistant.id} value={assistant.id}>
                {assistant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CallFilters;
