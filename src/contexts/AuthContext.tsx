import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  // ملاحظة: username هنا سيكون هو الإيميل الآن
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ إيميلات الأدمنات المسموح لهم بالدخول (من env)
const ADMIN_EMAILS =
  ((import.meta.env.VITE_ADMIN_EMAILS as string) || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean); // يحذف القيم الفارغة

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ التحقق من الجلسة مع Supabase عند تحميل الصفحة
  useEffect(() => {
    const checkSession = async () => {
      // --- الكود الجديد باستخدام Supabase Auth ---
      const { data, error } = await supabase.auth.getUser(); // يسأل Supabase عن المستخدم الحالي

      if (error || !data.user) {
        setIsAuthenticated(false);
        return;
      }

      const email = data.user.email?.toLowerCase() || '';

      // نسمح فقط لحسابات الأدمن المحددة في env
      if (!ADMIN_EMAILS.includes(email)) {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      // --- الكود القديم (معلّق) كان يعتمد على AdminUser + sessionStorage ---
      /*
      const loggedIn = sessionStorage.getItem('admin_logged_in');
      const username = sessionStorage.getItem('admin_username');

      if (loggedIn === 'true' && username) {
        const { data, error } = await supabase
          .from('AdminUser')
          .select('id')
          .eq('username', username)
          .maybeSingle();

        if (error || !data) {
          sessionStorage.removeItem('admin_logged_in');
          sessionStorage.removeItem('admin_username');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
      */
    };

    checkSession();
  }, []);

  // ✅ دالة تسجيل الدخول (باستخدام Supabase Auth)
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // هنا username هو الإيميل الآن
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (error || !data.user) {
        return false;
      }

      const email = data.user.email?.toLowerCase() || '';

      // نتأكد أن الإيميل يطابق أحد إيميلات الأدمن
      if (!ADMIN_EMAILS.includes(email)) {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        return false;
      }

      setIsAuthenticated(true);
      // يمكن ترك sessionStorage إن أحببت، لكن لم يعد ضرورياً مع Supabase:
      // sessionStorage.setItem('admin_logged_in', 'true');
      // sessionStorage.setItem('admin_username', username);
      return true;

      // --- الكود القديم (معلّق) كان يستعمل RPC verify_admin_login ---
      /*
      const { data, error } = await supabase.rpc('verify_admin_login', {
        input_username: username,
        input_password: password,
      });

      if (error || data !== true) {
        return false;
      }

      setIsAuthenticated(true);
      sessionStorage.setItem('admin_logged_in', 'true');
      sessionStorage.setItem('admin_username', username);
      return true;
      */
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // ✅ دالة تسجيل الخروج
  const logout = async () => {
    await supabase.auth.signOut(); // يزيل الجلسة من Supabase
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_username');
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
