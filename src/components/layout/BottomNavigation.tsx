
import { Link, useLocation } from "react-router-dom";
import { Phone, PhoneIncoming, PhoneOutgoing, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function BottomNavigation() {
  const location = useLocation();
  const { signOut, adminSignOut, isAdmin, user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    try {
      if (isAdmin) {
        await adminSignOut();
      } else {
        await signOut();
      }
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="app-bottom-nav">
      <Link 
        to="/calls" 
        className={cn(
          "app-nav-item",
          isActive("/calls") && !location.pathname.includes('/incoming') && !location.pathname.includes('/outgoing') 
            ? "text-primary" 
            : "text-muted-foreground"
        )}
      >
        <Phone className="h-5 w-5 mb-1" />
        <span>All Calls</span>
      </Link>
      
      <Link 
        to="/calls/inboundPhoneCall" 
        className={cn(
          "app-nav-item",
          isActive("/calls/inboundPhoneCall") ? "text-primary" : "text-muted-foreground"
        )}
      >
        <PhoneIncoming className="h-5 w-5 mb-1" />
        <span>Incoming</span>
      </Link>
      
      <Link 
        to="/calls/outboundPhoneCall" 
        className={cn(
          "app-nav-item",
          isActive("/calls/outboundPhoneCall") ? "text-primary" : "text-muted-foreground"
        )}
      >
        <PhoneOutgoing className="h-5 w-5 mb-1" />
        <span>Outgoing</span>
      </Link>
      
      <button 
        onClick={handleLogout}
        className="app-nav-item text-muted-foreground"
      >
        <LogOut className="h-5 w-5 mb-1" />
        <span>Logout</span>
      </button>
    </div>
  );
}
