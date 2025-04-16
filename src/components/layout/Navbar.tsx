
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  toggleSidebar?: () => void;
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const isMobile = useIsMobile();
  const { signOut, adminSignOut, isAdmin } = useAuth();

  const handleLogout = async () => {
    if (isAdmin) {
      await adminSignOut();
    } else {
      await signOut();
    }
  };

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        </div>
      </div>
    </div>
  );
}
