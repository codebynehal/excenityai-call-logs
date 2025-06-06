
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Phone, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NavbarProps {
  toggleSidebar?: () => void;
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const isMobile = useIsMobile();
  const { signOut, adminSignOut, isAdmin, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're on a detail page to show back button
  const isDetailPage = location.pathname.includes('/details/');

  const handleLogout = async () => {
    try {
      if (isAdmin) {
        await adminSignOut();
      } else {
        await signOut();
      }
      toast("Logged out successfully", {
        description: "You have been logged out of your account"
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: "There was an issue logging you out"
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={`${isMobile ? 'app-header safe-area-top' : 'sticky top-0 z-40 flex h-14 md:h-16 shrink-0 items-center border-b border-border bg-background/95 backdrop-blur'} px-2 md:px-4`}>
      <div className="container flex items-center justify-between h-full px-0 mx-0 md:px-4 max-w-full">
        <div className="flex items-center gap-1 md:gap-2">
          {isMobile && isDetailPage ? (
            <Button variant="ghost" size="icon" onClick={handleBack} className="mr-1 hover-scale">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : toggleSidebar && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden hover-scale">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/calls" className="flex items-center gap-1 md:gap-2 hover-scale transition-transform duration-200">
            <div className="orange-gradient rounded-full p-1.5 hover-bright">
              <Phone className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            {!isMobile || !isDetailPage ? (
              <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-white">
                Excenity AI
              </span>
            ) : (
              <span className="text-lg font-medium">
                Call Details
              </span>
            )}
          </Link>
        </div>
        
        {user && !isMobile && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="default"
              className="text-white hover-scale"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
