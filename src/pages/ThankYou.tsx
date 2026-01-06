import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Package, MapPin, Phone, Truck, Home, Calendar, User } from 'lucide-react';

interface Order {
  id: string;
  customerId: string;
  phone: string;
  address: string;
  wilaya: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface OrderItem {
  productName: string;
  price: number;
  quantity: number;
}

interface Customer {
  name: string;
  phone: string;
}

export default function ThankYou() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    if (!orderId) {
      navigate('/');
      return;
    }

    try {
      // جلب بيانات الطلب
      const { data: orderData, error: orderError } = await supabase
        .from('Orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // جلب عناصر الطلب
      const { data: itemsData, error: itemsError } = await supabase
        .from('OrderItems')
        .select('*')
        .eq('orderId', orderId);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);

      // جلب بيانات العميل
      const { data: customerData, error: customerError } = await supabase
        .from('Customers')
        .select('name, phone')
        .eq('id', orderData.customerId)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

    } catch (error) {
      console.error('Error loading order:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">جارٍ تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">لم يتم العثور على الطلب</p>
          <Link 
            to="/" 
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition inline-block"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const productTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryPrice = order.totalAmount - productTotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50" dir="rtl">
      
      {/* Header بسيط */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-gray-900 inline-block">
            IBRO<span className="text-orange-500">.dz</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        
        {/* Success Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            تم استلام طلبك بنجاح! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            شكراً لثقتك في <span className="font-bold text-orange-600">IBRO Kitchen</span>
          </p>
        </div>

        {/* رقم الطلب */}
        <div className="bg-white rounded-3xl shadow-lg border-2 border-green-200 p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
            <p className="text-3xl font-black text-green-600 font-mono tracking-wider">
              #{order.id.substring(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {orderDate}
            </p>
          </div>
        </div>

        {/* تفاصيل الطلب */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-600" />
            تفاصيل الطلب
          </h2>

          {/* المنتجات */}
          <div className="space-y-4 mb-6">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                </div>
                <div className="text-left">
                  <p className="font-black text-orange-600">{(item.price * item.quantity).toLocaleString()} دج</p>
                  <p className="text-xs text-gray-500">{item.price.toLocaleString()} دج × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* الفاتورة */}
          <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">مجموع المنتجات</span>
              <span className="font-bold">{productTotal.toLocaleString()} دج</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                التوصيل ({order.wilaya})
              </span>
              <span className="font-bold">{deliveryPrice.toLocaleString()} دج</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900 text-lg">المجموع الكلي</span>
              <span className="text-2xl font-black text-green-600">
                {order.totalAmount.toLocaleString()} دج
              </span>
            </div>
          </div>
        </div>

        {/* معلومات التوصيل */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            معلومات التوصيل
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">الاسم</p>
                <p className="font-bold text-gray-900">{customer?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                <p className="font-bold text-gray-900">{order.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">العنوان</p>
                <p className="font-bold text-gray-900">{order.wilaya}</p>
                <p className="text-sm text-gray-600 mt-1">{order.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* رسالة الشكر */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-xl p-6 md:p-8 text-white text-center mb-6">
          <h3 className="text-2xl font-black mb-3">📞 سنتواصل معك قريباً</h3>
          <p className="text-lg mb-2">فريقنا سيتصل بك خلال <span className="font-black">24 ساعة</span></p>
          <p className="text-sm opacity-90">لتأكيد الطلب وتحديد موعد التوصيل</p>
        </div>

        {/* أزرار التنقل */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link 
            to="/" 
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-center transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
          
          <Link 
            to="/contact" 
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 py-4 rounded-xl font-bold text-center transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            اتصل بنا
          </Link>
        </div>

      </main>
    </div>
  );
}
