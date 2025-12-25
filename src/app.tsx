import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 👇 1. أضف useLocation من هنا
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

console.log('ADMIN EMAILS =>', import.meta.env.VITE_ADMIN_EMAILS);

const queryClient = new QueryClient();


const PixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
   
    ReactPixel.init('1243975774445805', undefined, {
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
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/" element={<CustomerPage />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/admin/update-password" element={<AdminUpdatePasswordPage />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
