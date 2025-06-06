
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  adminSignOut: () => Promise<void>; 
};

// Create context with explicit undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Function to check if a user is an admin based on their email
  const checkIsAdmin = (email: string | null) => {
    if (!email) return false;
    return email.endsWith('@excenityai.com');
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        // Check if current user is an admin
        setIsAdmin(session?.user ? checkIsAdmin(session.user.email) : false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check", session);
      setSession(session);
      setUser(session?.user ?? null);
      // Check if current user is an admin
      setIsAdmin(session?.user ? checkIsAdmin(session.user.email) : false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: name.split(' ')[0] || '',
          last_name: name.split(' ').slice(1).join(' ') || '',
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Force immediate local state update
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if error occurs, clear local state and redirect
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      navigate('/login');
    }
  };

  // Admin logout function
  const adminSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Force immediate local state update
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      // Redirect to admin login page
      navigate('/admin/login');
    } catch (error) {
      console.error("Error signing out admin:", error);
      // Even if error occurs, clear local state and redirect
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      navigate('/admin/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      isAdmin, 
      signIn, 
      signUp, 
      signOut,
      adminSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
