import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ReactPixel from 'react-facebook-pixel';

import CustomerPage from "./pages/CustomerPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";

import { testSupabaseConnection } from "./testSupabase";

const queryClient = new QueryClient();

const App = () => {
  // ✅ Hook داخل المكون
  useEffect(() => {
    testSupabaseConnection();
}, []);


function App() {
  

  useEffect(() => {
    
    ReactPixel.init('111111111111111'); 
    ReactPixel.pageView(); 
  }, []);
}
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CustomerPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;