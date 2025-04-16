
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function AdminSearch({ searchTerm, setSearchTerm }: AdminSearchProps) {
  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search users or assistant IDs..."
        className="pl-8 pr-10"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-8 w-8"
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
