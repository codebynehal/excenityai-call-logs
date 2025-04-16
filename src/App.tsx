import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminLogin from "./pages/AdminLogin";
import AdminSignUp from "./pages/AdminSignUp";
import AdminPanel from "./pages/AdminPanel";
import { MainLayout } from "./components/layout/MainLayout";
import CallList from "./pages/CallList";
import CallDetails from "./pages/CallDetails";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

// Admin only route
const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  
  if (!isAdmin) {
    toast.error("Access denied. Admin privileges required.");
    return <Navigate to="/calls" replace />;
  }
  
  return <Outlet />;
};

// Public only route (redirects to /calls if logged in)
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    // If the user is an admin, redirect to admin panel
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    // Otherwise redirect to calls
    return <Navigate to="/calls" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
    <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
    <Route path="/admin-login" element={<PublicOnlyRoute><AdminLogin /></PublicOnlyRoute>} />
    <Route path="/admin-signup" element={<PublicOnlyRoute><AdminSignUp /></PublicOnlyRoute>} />
    
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/calls" element={<CallList />} />
        <Route path="/calls/:callType" element={<CallList />} />
        <Route path="/calls/details/:callId" element={<CallDetails />} />
        <Route path="/profile" element={<div className="p-4">Profile page coming soon</div>} />
      </Route>
      
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// Need to import toast for the error message in AdminRoute
import { toast } from "sonner";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
