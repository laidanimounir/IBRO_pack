import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminUpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // هذه الدالة تُستدعى عند إرسال الفورم
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Supabase يعرف المستخدم من الجلسة القادمة من رابط الإيميل
      const { error } = await supabase.auth.updateUser({ password }); // تغيير كلمة المرور [web:169]

      if (error) {
        toast.error('تعذّر تغيير كلمة المرور');
      } else {
        toast.success('تم تغيير كلمة المرور بنجاح');
        // بعد النجاح نعيده إلى صفحة تسجيل الدخول
        window.location.href = '/admin/login';
      }
    } catch {
      toast.error('حدث خطأ غير متوقّع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2] p-4">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-center">تعيين كلمة مرور جديدة</h2>

        <Input
          type="password"
          placeholder="كلمة مرور جديدة"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button className="w-full" disabled={isLoading}>
          {isLoading ? 'جاري الحفظ...' : 'حفظ الكلمة الجديدة'}
        </Button>
      </form>
    </div>
  );
}
