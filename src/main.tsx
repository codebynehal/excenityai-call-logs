
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DirectionProvider } from "@radix-ui/react-direction";

// Initialize React Query client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <DirectionProvider dir="ltr">
            <AuthProvider>
              <App />
            </AuthProvider>
          </DirectionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Update viewport meta tag for mobile optimization
const updateViewport = () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content', 
      'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no'
    );
  } else {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
  }

  // Add theme-color meta for mobile browsers
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (!themeColor) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#161616'; // Match your background color
    document.head.appendChild(meta);
  }
};

// Run once on load
updateViewport();
