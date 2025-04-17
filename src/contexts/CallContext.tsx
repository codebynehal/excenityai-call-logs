
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CallRecord, fetchCalls } from "@/services/vapiService";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface CallContextType {
  calls: CallRecord[];
  isLoading: boolean;
  refreshCalls: () => Promise<void>;
  lastFetched: Date | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const { user, isAdmin } = useAuth();

  const refreshCalls = async () => {
    setIsLoading(true);
    try {
      // If admin, fetch all calls, otherwise fetch only user's calls
      const callsData = await fetchCalls(isAdmin ? null : user?.email);
      setCalls(callsData);
      setLastFetched(new Date());
    } catch (error) {
      console.error("Failed to load calls:", error);
      toast.error("Failed to load calls. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load calls on component mount or when user/isAdmin changes
  useEffect(() => {
    if (user) {
      refreshCalls();
    }
  }, [user, isAdmin]);

  return (
    <CallContext.Provider value={{ calls, isLoading, refreshCalls, lastFetched }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCallContext() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCallContext must be used within a CallProvider");
  }
  return context;
}
