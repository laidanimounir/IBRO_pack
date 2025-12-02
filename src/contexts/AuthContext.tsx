import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ التحقق من sessionStorage عند تحميل الصفحة
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_logged_in'); // ← sessionStorage
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // ✅ دالة تسجيل الدخول
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('verify_admin_login', {
        input_username: username,
        input_password: password
      });

      if (error || data !== true) {
        return false;
      }

      setIsAuthenticated(true);
      sessionStorage.setItem('admin_logged_in', 'true'); // ← sessionStorage
      sessionStorage.setItem('admin_username', username); // ← sessionStorage
      return true;
      
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // ✅ دالة تسجيل الخروج
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_logged_in'); // ← sessionStorage
    sessionStorage.removeItem('admin_username'); // ← sessionStorage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
