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

const queryClient = new QueryClient();

// 👇 2. نحتاج لمكون داخلي (PixelTracker) لأن useLocation لا تعمل خارج BrowserRouter
const PixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // تهيئة البيكسل مرة واحدة فقط
    ReactPixel.init('827374046868024', undefined, {
      autoConfig: true,
      debug: true
    });
  }, []);

  useEffect(() => {
    // هذا الكود سيعمل كلما تغير الرابط (location)
    ReactPixel.pageView();
  }, [location]); // 👈 السر هنا: نربطه بتغير الموقع

  return null; // هذا المكون لا يرسم شيئاً، وظيفته فقط المراقبة
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
            {/* 👇 3. نضع الجاسوس هنا داخل الـ Router */}
            <PixelTracker /> 
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
};

export default App;
