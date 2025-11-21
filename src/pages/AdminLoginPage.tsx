import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // تحقق من بيانات المستخدم في Supabase
    const { data, error } = await supabase
      .from('AdminUser')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      toast.error('اسم المستخدم أو كلمة المرور غير صحيحة');
      return;
    }

    // تحديث حالة AuthContext
    const success = login(username, password); // login ليست async
    if (success) {
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin'); // التوجيه للوحة التحكم
    } else {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-amber-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="bg-orange-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl text-center">لوحة تحكم ADMIN</CardTitle>
          <p className="text-center text-orange-100 mt-2">IBRO kitchen dz</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-right block text-lg">
                اسم المستخدم
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="pr-10 text-right text-lg py-6"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block text-lg">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10 text-right text-lg py-6"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6"
            >
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}