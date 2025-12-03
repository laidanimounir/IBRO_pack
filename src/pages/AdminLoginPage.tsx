import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User, Loader2, ArrowRight, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const [view, setView] = useState<'login' | 'reset'>('login'); // 'login' or 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // --- Login Logic ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // نستخدم الإيميل + كلمة السر مع Supabase Auth [web:198]
      const success = await login(email, password);

      if (!success) {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setIsLoading(false);
        return;
      }

      toast.success('تم تسجيل الدخول بنجاح');

      setTimeout(() => {
        window.location.href = '/admin';
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      toast.error('خطأ في الاتصال');
      setIsLoading(false);
    }
  };

  // --- Reset Password Logic ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin/update-password',
      }); // [web:132]

      if (error) {
        toast.error('تأكد من إعدادات الإيميل في Supabase');
      } else {
        toast.success('تم إرسال رابط الاستعادة');
        setView('login');
      }
    } catch (err) {
      toast.error('حدث خطأ ما');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f5f2] p-4 font-sans">
      {/* البطاقة الرئيسية الكبيرة (مقسومة نصفين) */}
      <Card className="w-full max-w-4xl overflow-hidden border-0 shadow-2xl rounded-3xl flex flex-col md:flex-row h-[600px]">
        {/* النصف الأيمن: البانر الملون (IBRO Kitchen Identity) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-400 to-orange-600 relative items-center justify-center p-12 text-white overflow-hidden">
          {/* دوائر خلفية للزينة */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 text-center space-y-6">
            {/* أيقونة كبيرة أو شعار */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center shadow-inner border border-white/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-4xl">🥘</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl font-bold tracking-tight font-['Cairo']">
                IBRO Kitchen
              </h1>
              <p className="text-orange-100 text-lg font-light tracking-wide opacity-90">
                لوحة التحكم والإدارة
              </p>
            </div>

            <div className="pt-8 border-t border-white/20 mt-8 w-3/4 mx-auto">
              <p className="text-sm text-orange-100/80 italic">
                "الجودة في كل تفصيل، من المطبخ إليك."
              </p>
            </div>
          </div>
        </div>

        {/* النصف الأيسر: الفورم */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center relative">
          {/* Header */}
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {view === 'login' ? 'تسجيل الدخول' : 'استعادة كلمة المرور'}
            </h2>
            <p className="text-gray-500">
              {view === 'login'
                ? 'مرحباً بك مجدداً في لوحة التحكم'
                : 'أدخل بريدك لاستلام رابط التغيير'}
            </p>
          </div>

          {/* Forms Container */}
          <div className="relative">
            {view === 'login' ? (
              /* Login Form */
              <form
                onSubmit={handleLogin}
                className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500"
              >
                <div className="space-y-2">
                  <Label className="text-right block text-gray-700 font-medium">
                    البريد الإلكتروني
                  </Label>
                  <div className="relative group">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      type="email"
                      className="pr-10 h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-100 transition-all rounded-xl"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-right block text-gray-700 font-medium">
                    كلمة المرور
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      type="password"
                      className="pr-10 h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-100 transition-all rounded-xl"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* زر الدخول الأساسي */}
                <Button
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-lg font-medium transition-transform active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'الدخول للوحة التحكم'}
                </Button>

                {/* زر استعادة كلمة المرور */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setView('reset')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    <span>هل نسيت كلمة المرور؟</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Reset Password Form */
              <form
                onSubmit={handleResetPassword}
                className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <div className="bg-orange-50 p-4 rounded-xl mb-6 flex items-start gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <Mail className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    سيتم إرسال رابط آمن إلى بريدك الإلكتروني لتتمكن من تعيين كلمة مرور جديدة.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-right block text-gray-700 font-medium">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    type="email"
                    className="h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-100 rounded-xl"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'إرسال الرابط'}
                </Button>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:text-gray-800 transition-colors text-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة للوراء
                </button>
              </form>
            )}
          </div>
        </div>
      </Card>

      {/* Footer Small */}
      <div className="absolute bottom-4 text-gray-400 text-xs">
        © 2025 IBRO Kitchen System v1.0
      </div>
    </div>
  );
}
