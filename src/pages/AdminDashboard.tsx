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
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </Button>
            
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logo-ibro-kitchen_variant_1.png" 
                alt="IBRO kitchen dz" 
                className="h-12 w-12 object-contain"
              />
              <div className="text-right">
                <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
                  لوحة تحكم الأدمين
                </h1>
                <p className="text-sm text-gray-600">IBRO kitchen dz</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6" dir="rtl">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14">
            <TabsTrigger value="products" className="text-lg">
              <Package className="ml-2 h-5 w-5" />
              إدارة المنتجات
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-lg">
              <ShoppingCart className="ml-2 h-5 w-5" />
              إدارة الطلبات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}