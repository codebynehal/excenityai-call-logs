
import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Check if current route is an auth page (login, signup, admin login/signup)
  const isAuthPage = [
    '/login',
    '/signup',
    '/admin/login',
    '/admin/signup'
  ].includes(location.pathname);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add body class for mobile app appearance
  useEffect(() => {
    if (isMobile && !isAuthPage) {
      document.body.classList.add('mobile-app-view');
    } else {
      document.body.classList.remove('mobile-app-view');
    }
    
    return () => {
      document.body.classList.remove('mobile-app-view');
    };
  }, [isMobile, isAuthPage]);

  // Parse the pathname to determine if we're on a calls page
  const isCallsPage = location.pathname.includes('/calls');

  return (
    <div className="flex h-screen flex-col w-full overflow-hidden">
      {!isAuthPage && <Navbar toggleSidebar={toggleSidebar} />}
      <div className="flex flex-1 relative w-full overflow-hidden">
        {!isAuthPage && 
          <Sidebar 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen} 
          />
        }
        <main 
          className={`flex-1 overflow-y-auto momentum-scroll transition-all duration-300 ${isMobile ? 'app-content' : ''} ${isAuthPage ? '' : 'p-2 md:p-6'} ${isMobile && !isAuthPage ? 'pb-20' : ''} ${isCallsPage ? 'calls-page' : ''}`}
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <Outlet />
        </main>
      </div>
      {!isAuthPage && isMobile && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
