
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  toggleSidebar?: () => void;
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const isMobile = useIsMobile();
  const { signOut, adminSignOut, isAdmin, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      if (isAdmin) {
        await adminSignOut();
      } else {
        await signOut();
      }
      // Toast will be shown if the user stays on the same page
      // but since we're redirecting, it might not be visible
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an issue logging you out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          {toggleSidebar && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/calls" className="flex items-center gap-2">
            <div className="orange-gradient rounded-full p-1.5">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-white">
              Excenity AI
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          {user && (
            <Button
              variant="ghost"
              size={isMobile ? "icon" : "default"}
              className="text-white"
              onClick={handleLogout}
            >
              {isMobile ? <LogOut className="h-5 w-5" /> : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
