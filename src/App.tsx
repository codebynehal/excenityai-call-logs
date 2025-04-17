
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";
import CallList from "@/pages/CallList";
import CallDetails from "@/pages/CallDetails";
import AdminLogin from "@/pages/AdminLogin";
import AdminSignUp from "@/pages/AdminSignUp";
import AdminPanel from "@/pages/AdminPanel";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { CallProvider } from "@/contexts/CallContext";

import "./App.css";

function App() {
  const { user, isAdmin } = useAuth();

  return (
    <CallProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={user ? <Navigate to="/calls" replace /> : <Navigate to="/login" replace />} />
          
          {/* User routes (require login) */}
          {user ? (
            <>
              <Route path="/calls" element={<CallList />} />
              <Route path="/calls/:callType" element={<CallList />} />
              <Route path="/calls/details/:callId" element={<CallDetails />} />
            </>
          ) : (
            <>
              <Route path="/calls/*" element={<Navigate to="/login" replace />} />
            </>
          )}
          
          {/* Admin routes (require admin login) */}
          {isAdmin ? (
            <Route path="/admin" element={<AdminPanel />} />
          ) : (
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          )}
          
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/calls" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/calls" replace /> : <SignUp />} />
          
          {/* Admin auth routes */}
          <Route path="/admin/login" element={isAdmin ? <Navigate to="/admin" replace /> : <AdminLogin />} />
          <Route path="/admin/signup" element={isAdmin ? <Navigate to="/admin" replace /> : <AdminSignUp />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </CallProvider>
  );
}

export default App;
