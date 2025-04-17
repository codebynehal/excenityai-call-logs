
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Phone, X, PhoneIncoming, PhoneOutgoing, Video, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link to="/calls" className="flex items-center gap-2">
          <div className="orange-gradient rounded-full p-1.5">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Excenity AI</span>
        </Link>
        {!isMobile && (
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
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
        
        <div className="px-4 py-2">
          <h3 className="mb-2 px-2 text-sm font-semibold">Call Types</h3>
          <nav className="space-y-1">
            <Link 
              to="/calls" 
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                location.pathname === "/calls" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Phone className="h-4 w-4" />
              <span>All Calls</span>
            </Link>
            
            <Link 
              to="/calls/inboundPhoneCall" 
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                location.pathname.includes("/calls/inboundPhoneCall") 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <PhoneIncoming className="h-4 w-4 text-green-500" />
              <span>Incoming Calls</span>
            </Link>
            
            <Link 
              to="/calls/outboundPhoneCall" 
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                location.pathname.includes("/calls/outboundPhoneCall") 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <PhoneOutgoing className="h-4 w-4 text-blue-500" />
              <span>Outgoing Calls</span>
            </Link>
            
            <Link 
              to="/calls/webCall" 
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                location.pathname.includes("/calls/webCall") 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Video className="h-4 w-4 text-purple-500" />
              <span>Web Calls</span>
            </Link>
          </nav>
        </div>
      </ScrollArea>
    </>
  );

  // On mobile, use a Sheet component
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-[280px] bg-sidebar">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // On desktop, use the regular sidebar
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full w-[280px] flex-col border-r border-border bg-sidebar transition-transform duration-300 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {sidebarContent}
    </div>
  );
}
