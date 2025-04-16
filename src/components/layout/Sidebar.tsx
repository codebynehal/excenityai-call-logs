
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Phone, PhoneCall, User, X, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full w-[280px] flex-col border-r border-border bg-sidebar transition-transform duration-300 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link to="/calls" className="flex items-center gap-2">
          <div className="orange-gradient rounded-full p-1.5">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Excenity AI</span>
        </Link>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 md:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
            Dashboard
          </h3>
          <Button
            asChild
            variant={location.pathname === "/calls" ? "secondary" : "ghost"}
            className="justify-start gap-2"
          >
            <Link to="/calls">
              <PhoneCall className="h-5 w-5" />
              All Calls
            </Link>
          </Button>
          <Button
            asChild
            variant={location.pathname === "/calls/inbound" ? "secondary" : "ghost"}
            className="justify-start gap-2"
          >
            <Link to="/calls/inbound">
              <PhoneIncoming className="h-5 w-5" />
              Inbound Calls
            </Link>
          </Button>
          <Button
            asChild
            variant={location.pathname === "/calls/outbound" ? "secondary" : "ghost"}
            className="justify-start gap-2"
          >
            <Link to="/calls/outbound">
              <PhoneOutgoing className="h-5 w-5" />
              Outbound Calls
            </Link>
          </Button>

          <h3 className="mb-2 mt-6 px-4 text-sm font-semibold text-muted-foreground">
            Settings
          </h3>
          <Button
            asChild
            variant={location.pathname === "/profile" ? "secondary" : "ghost"}
            className="justify-start gap-2"
          >
            <Link to="/profile">
              <User className="h-5 w-5" />
              Profile
            </Link>
          </Button>
        </nav>
      </ScrollArea>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-medium text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {user?.user_metadata?.first_name || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
