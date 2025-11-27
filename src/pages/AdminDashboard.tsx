import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProductManagement from '@/components/ProductManagement';
import OrderManagement from '@/components/OrderManagement';
import { LogOut, Package, ShoppingCart } from 'lucide-react';

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      
      {/* Header العصري الجديد */}
      
      <header className="sticky top-0 z-50 shadow-md bg-gradient-to-r from-orange-600 to-amber-600 text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* زر تسجيل الخروج (يسار) */}
     <Button 
            variant="ghost" 
            onClick={handleLogout}
            // لون أبيض شفاف عند التحويم
            className="text-white hover:bg-white/20 hover:text-white transition-colors gap-2 rounded-full px-3"
          >
            <LogOut className="h-5 w-5" />
            {/* إخفاء النص في الشاشات الصغيرة جداً لمنع التداخل */}
            <span className="font-medium hidden md:inline">خروج</span>
         </Button>

          {/* الشعار والعنوان (يمين) */}
           <div className="flex items-center gap-3">
            {/* إخفاء النص في الموبايل */}
            <div className="text-right hidden md:block">
              <h1 className="text-lg font-bold text-white leading-tight">
                لوحة التحكم
              </h1>
              <p className="text-[10px] text-orange-100 font-medium tracking-wider opacity-90">IBRO KITCHEN</p>
            </div>
            
            {/* حاوية الشعار */}
            <div className="h-10 w-10 rounded-full bg-white p-1 shadow-sm flex items-center justify-center">
              <img 
                src="/assets/logo-ibro-kitchen_variant_1.png" 
                alt="Logo" 
                className="h-full w-full object-contain"
              />
            </div>
          </div>

        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-8" dir="rtl">
          
          {/* قائمة التبويبات العائمة */}
          <TabsList className="flex items-center justify-center p-1 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm mx-auto w-fit mb-8">
            <TabsTrigger 
              value="products" 
              className="px-8 py-2.5 rounded-full text-base font-medium transition-all data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-orange-700"
            >
              <div className="flex items-center gap-2">
                إدارة المنتجات
                <Package className="h-5 w-5" />
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="orders" 
              className="px-8 py-2.5 rounded-full text-base font-medium transition-all data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:text-orange-700"
            >
              <div className="flex items-center gap-2">
                إدارة الطلبات
                <ShoppingCart className="h-5 w-5" />
              </div>
            </TabsTrigger>
          </TabsList>

          {/* المحتوى */}
          <TabsContent value="products" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OrderManagement />
          </TabsContent>
          
        </Tabs>
      </div>
      
    </div>
  );
}
