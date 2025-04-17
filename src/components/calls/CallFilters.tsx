
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface CallFiltersProps {
  sortBy: "newest" | "oldest";
  setSortBy: (sort: "newest" | "oldest") => void;
  assistantFilter: string;
  setAssistantFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  uniqueAssistants: { id: string; name: string }[];
}

const CallFilters = ({
  sortBy,
  setSortBy,
  assistantFilter,
  setAssistantFilter,
  searchTerm,
  setSearchTerm,
  uniqueAssistants,
}: CallFiltersProps) => {
  const isMobile = useIsMobile();

  const MobileFilterDrawer = (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Filter Calls</DrawerTitle>
          <DrawerDescription>
            Apply filters to narrow down your call list
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Sort by</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={sortBy === "newest" ? "default" : "outline"}
                className="w-full"
                onClick={() => setSortBy("newest")}
              >
                Newest
              </Button>
              <Button
                variant={sortBy === "oldest" ? "default" : "outline"}
                className="w-full"
                onClick={() => setSortBy("oldest")}
              >
                Oldest
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Filter by Assistant</h4>
            <div className="max-h-60 overflow-auto space-y-1">
              <Button
                variant={assistantFilter === "all" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setAssistantFilter("all")}
              >
                All Assistants
              </Button>
              {uniqueAssistants.map((assistant) => (
                <Button
                  key={assistant.id}
                  variant={assistantFilter === assistant.id ? "default" : "outline"}
                  className="w-full justify-start text-sm"
                  onClick={() => setAssistantFilter(assistant.id)}
                >
                  {assistant.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Search</h4>
            <div className="flex">
              <Input
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button 
            onClick={() => {
              setSortBy("newest");
              setAssistantFilter("all");
              setSearchTerm("");
            }}
            variant="outline"
          >
            Reset Filters
          </Button>
          <DrawerClose asChild>
            <Button>Apply Filters</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  const DesktopFilters = (
    <>
      <div className="relative w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search calls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setSortBy("newest")} className={sortBy === "newest" ? "bg-accent text-accent-foreground" : ""}>
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("oldest")} className={sortBy === "oldest" ? "bg-accent text-accent-foreground" : ""}>
            Oldest First
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Assistant</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setAssistantFilter("all")} className={assistantFilter === "all" ? "bg-accent text-accent-foreground" : ""}>
            All Assistants
          </DropdownMenuItem>
          {uniqueAssistants.map((assistant) => (
            <DropdownMenuItem 
              key={assistant.id}
              onClick={() => setAssistantFilter(assistant.id)}
              className={assistantFilter === assistant.id ? "bg-accent text-accent-foreground" : ""}
            >
              {assistant.name}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            setSortBy("newest");
            setAssistantFilter("all");
            setSearchTerm("");
          }}>
            Reset Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  if (isMobile) {
    // For mobile, show just a search input and filter drawer
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        {MobileFilterDrawer}
      </div>
    );
  }

  // For desktop, show the dropdown menu
  return (
    <div className="flex items-center gap-2">
      {DesktopFilters}
    </div>
  );
};

export default CallFilters;
