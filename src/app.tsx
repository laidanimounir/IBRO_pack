import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ReactPixel from 'react-facebook-pixel';

import CustomerPage from "./pages/CustomerPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import { testSupabaseConnection } from "./testSupabase";
import ProductDetails from "./pages/ProductDetails";
import ScrollToTop from "./ScrollToTop";
import AdminUpdatePasswordPage from '@/pages/admin/AdminUpdatePasswordPage';
import ThankYou from '@/pages/ThankYou';

console.log('ADMIN EMAILS =>', import.meta.env.VITE_ADMIN_EMAILS);

const queryClient = new QueryClient();

const PixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
    ReactPixel.init('827374046868024', undefined, {
      autoConfig: true,
      debug: true
    });
  }, []);

  useEffect(() => {
    ReactPixel.pageView();
  }, [location]); 

  return null; 
};

const App = () => {
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <BrowserRouter>
            <PixelTracker />
            <ScrollToTop /> 
            <Routes>
              
              <Route path="/" element={<CustomerPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/thank-you/:orderId" element={<ThankYou />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/update-password" element={<AdminUpdatePasswordPage />} />
              
             
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
