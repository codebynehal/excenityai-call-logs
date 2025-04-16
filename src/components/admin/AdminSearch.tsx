
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function AdminSearch({ searchTerm, setSearchTerm }: AdminSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search users or assistant IDs..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
