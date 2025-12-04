import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ProductManagement from '@/components/ProductManagement';
import OrderManagement from '@/components/OrderManagement';
import { 
  LogOut, Package, ShoppingCart, Users, Settings, Palette, Store, 
  Menu, X, ChevronRight, ChevronLeft, LayoutDashboard,
  TrendingUp, DollarSign, ShoppingBag, UserCheck
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { ManagementCustumers } from "../components/ManagementCustumers";




export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else {
      fetchDashboardData();
    }
  }, [isAuthenticated, navigate]);

 const fetchDashboardData = async () => {
  console.log('🚀 Starting fetchDashboardData...');
  try {
    interface OrderItem {
      productId: string;
      productName: string;
      price: number;
      quantity: number;
    }

    interface ProductSale {
      name: string;
      image: string | null;
      quantity: number;
    }

    // ✅ 1. عدد الطلبات
    const { count: ordersCount } = await supabase
      .from('Orders')
      .select('*', { count: 'exact', head: true });

    // ✅ 2. إجمالي المبيعات
    const { data: orders } = await supabase
      .from('Orders')
      .select('totalAmount, status')
      .eq('status', 'delivered');
    
    const revenue = orders?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0;

    // ✅ 3. عدد المنتجات
    const { count: productsCount } = await supabase
      .from('Products')
      .select('*', { count: 'exact', head: true });

    // ✅ 4. عدد الزبائن
    const { data: customers } = await supabase
      .from('Customers')
      .select('id');
    
    const uniqueCustomers = customers?.length || 0;

    setStats({
      totalOrders: ordersCount || 0,
      totalRevenue: revenue,
      totalProducts: productsCount || 0,
      totalCustomers: uniqueCustomers,
    });

    // ✅ 5. بيانات المبيعات (آخر 7 أيام)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const salesByDay = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(new Date(date).getTime() + 86400000).toISOString();
        
        const { data } = await supabase
          .from('Orders')
          .select('totalAmount')
          .gte('createdAt', date)
          .lt('createdAt', nextDay);
        
        const total = data?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0;
        return {
          date: new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
          sales: total,
        };
      })
    );

    setSalesData(salesByDay);

    // ✅ 6. أكثر المنتجات مبيعاً (ابدأ التعديل من هنا ⬇️)
// ✅ 6. أكثر المنتجات مبيعاً (من OrderItems)
const { data: allProducts } = await supabase
  .from('Products')
  .select('id, name, imageUrl');

const { data: orderItems } = await supabase
  .from('OrderItems') // ← بحرف I كبير
  .select('productId, quantity, productName');

console.log('📦 Order Items:', orderItems);

const productSales: Record<string, ProductSale> = {};

orderItems?.forEach((item: any) => {
  const id = item.productId;
  if (!productSales[id]) {
    const product = allProducts?.find((p: any) => p.id === id);
    productSales[id] = {
      name: product?.name || item.productName || 'منتج غير معروف',
      image: product?.imageUrl || null,
      quantity: 0,
    };
  }
  productSales[id].quantity += item.quantity;
});

console.log('📊 Sales:', productSales);

const topProductsList = Object.values(productSales)
  .sort((a, b) => b.quantity - a.quantity)
  .slice(0, 5);

console.log('🏆 Top:', topProductsList);

setTopProducts(topProductsList);




    // ✅ 6. نهاية قسم أكثر المنتجات (أنهِ التعديل هنا ⬆️)

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};


  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { id: 'dashboard', label: 'لوحة المعلومات', icon: LayoutDashboard },
    { id: 'products', label: 'إدارة المنتجات', icon: Package },
    { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingCart },
    { id: 'customers', label: 'قائمة الزبائن', icon: Users },
    { id: 'storefront', label: 'تغيير واجهة الزبائن', icon: Palette },
    { id: 'store-info', label: 'بيانات المتجر', icon: Store },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const statsCards = [
    { 
      title: 'الطلبات اليوم', 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'إجمالي المبيعات', 
      value: `${stats.totalRevenue.toLocaleString()} دج`, 
      icon: DollarSign, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'عدد المنتجات', 
      value: stats.totalProducts, 
      icon: ShoppingBag, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'عدد الزبائن', 
      value: stats.totalCustomers, 
      icon: UserCheck, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex" dir="rtl">
      
  <aside className={`
  fixed right-0 top-0 h-screen bg-gradient-to-b from-orange-600 to-amber-600 text-white
  transition-all duration-300 z-50 shadow-2xl
  ${mobileMenuOpen ? 'block' : 'hidden md:block'}
  ${sidebarCollapsed ? 'w-20 md:w-20' : 'w-72'}
`}>

        
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/20">
          <div className={`flex items-center gap-3 transition-all overflow-hidden ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <div className="h-12 w-12 rounded-full bg-white p-2 shadow-lg flex-shrink-0">
              <img 
                src="/assets/logo-ibro-kitchen_variant_1.png" 
                alt="Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight whitespace-nowrap">IBRO Kitchen</h1>
              <p className="text-xs text-orange-100 opacity-90">لوحة التحكم</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex text-white hover:bg-white/20 flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[calc(100vh-160px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-white text-orange-600 shadow-lg' 
                    : 'text-white hover:bg-white/10'
                  }
                  ${sidebarCollapsed ? 'justify-center' : 'justify-start'}
                `}
                title={item.label}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium text-sm whitespace-nowrap ${sidebarCollapsed ? 'hidden' : 'block'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full text-white hover:bg-red-500/20 transition-all gap-3 ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
            title="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={`font-medium whitespace-nowrap ${sidebarCollapsed ? 'hidden' : 'block'}`}>
              تسجيل الخروج
            </span>
          </Button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className={`flex-1 transition-all duration-300 mr-0 ${sidebarCollapsed ? 'md:mr-20' : 'md:mr-72'}`}>
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="px-6 h-16 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="text-xl font-bold text-gray-800">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>
        </header>

        <div className="p-6">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-800">مبيعات آخر 7 أيام</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                        labelStyle={{ color: '#333', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={3} dot={{ fill: '#ea580c', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">أكثر المنتجات مبيعاً</h3>
                  <div className="space-y-3">
                    {topProducts.length > 0 ? (
                      topProducts.map((product: any, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <img 
                            src={product.image || '/placeholder.png'} 
                            alt={product.name} 
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.quantity} مبيعات</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">لا توجد مبيعات بعد</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProductManagement />
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <OrderManagement />
            </div>
          )}

          {activeTab === 'customers' && (
            
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ManagementCustumers />
            </div>
          )}

          {activeTab === 'storefront' && (
            <div className="p-8 bg-white rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">تخصيص واجهة الزبائن</h3>
              <p className="text-gray-500">إعدادات الواجهة هنا...</p>
            </div>
          )}

          {activeTab === 'store-info' && (
            <div className="p-8 bg-white rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">بيانات المتجر</h3>
              <p className="text-gray-500">معلومات المتجر هنا...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 bg-white rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">الإعدادات</h3>
              <p className="text-gray-500">إعدادات النظام هنا...</p>
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
}
