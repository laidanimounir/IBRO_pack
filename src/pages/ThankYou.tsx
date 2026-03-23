import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Package, MapPin, Phone, Truck, Home, User, CreditCard, Clock, Calendar } from 'lucide-react';

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
      const { data: orderData, error: orderError } = await supabase
        .from('Orders')
        .select('id, customerId, phone, address, wilaya, totalAmount, status, createdAt')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('OrderItems')
        .select('productName, quantity, price')
        .eq('orderId', orderId);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-600 font-bold text-sm">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-3">لم يتم العثور على الطلب</p>
          <Link 
            to="/" 
            className="bg-orange-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-orange-700 transition inline-block"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const productTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryPrice = order.totalAmount - productTotal;

  
  const orderDate = (() => {
  const date = new Date(order.createdAt);
  date.setHours(date.getHours() + 1);
  return date.toLocaleString('ar-DZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
})();


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50" dir="rtl">
      
      
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Link to="/" className="text-xl font-bold text-gray-900 inline-block">
            IBRO<span className="text-orange-500">.dz</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 max-w-2xl">
        
        
        <div className="text-center mb-4">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-3 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
           تم استلام طلبك بنجاح
          </h1>
          <p className="text-sm text-gray-600">
            شكراً لثقتك في <span className="font-bold text-orange-600">IBRO Kitchen</span>
          </p>
        </div>

      
        <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">رقم الطلب</p>
            <p className="text-2xl font-black text-green-600 font-mono mb-2">
              #{order.id.substring(0, 8).toUpperCase()}
            </p>
            
          
            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              قيد المراجعة
            </div>
            
           
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
              <Calendar className="w-3 h-3" />
              <span>{orderDate}</span>
            </div>
          </div>
        </div>

   
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
          
         
          <h2 className="text-base font-black text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            تفاصيل الطلب
          </h2>

          <div className="space-y-2 mb-3">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-bold text-sm text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                </div>
                <p className="font-black text-orange-600 text-sm">{(item.price * item.quantity).toLocaleString()} دج</p>
              </div>
            ))}
          </div>

          
          <div className="border-t border-dashed border-gray-300 pt-3 space-y-1 text-sm mb-3">
            <div className="flex justify-between">
              <span className="font-bold">{productTotal.toLocaleString()} دج</span>
              <span className="text-gray-600">مجموع المنتجات</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">{deliveryPrice.toLocaleString()} دج</span>
              <span className="text-gray-600 flex items-center gap-1">
                <Truck className="w-3 h-3" />
                التوصيل ({order.wilaya})
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-xl font-black text-green-600">{order.totalAmount.toLocaleString()} دج</span>
              <span className="font-bold text-gray-900">المجموع الكلي</span>
            </div>
          </div>

        
          <div className="border-t border-gray-200 pt-3">
            <h3 className="text-sm font-bold text-gray-700 mb-2">معلومات التوصيل</h3>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <User className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                <p className="font-bold text-gray-900 truncate">{customer?.name}</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <Phone className="w-4 h-4 mx-auto mb-1 text-green-600" />
                <p className="font-bold text-gray-900">{order.phone}</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <MapPin className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <p className="font-bold text-gray-900 truncate">{order.wilaya}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center mb-3">{order.address}</p>
            
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                <CreditCard className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">طريقة الدفع</p>
                  <p className="font-bold text-gray-900">عند الاستلام</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">وقت التوصيل</p>
                  <p className="font-bold text-gray-900">1-3 أيام*</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-1">* الولايات الصحراوية: 5 أيام</p>
          </div>
        </div>

      
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-4 text-white text-center mb-4">
          <h3 className="text-lg font-black mb-1">📞 سنتواصل معك قريباً</h3>
          <p className="text-sm">فريقنا سيتصل بك خلال <span className="font-black">24 ساعة</span></p>
        </div>

       
        <div className="flex gap-3">
          <Link 
            to="/" 
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold text-center transition shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </Link>
          
          <Link 
            to="/contact" 
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 py-3 rounded-xl font-bold text-center transition shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <Phone className="w-4 h-4" />
            اتصل بنا
          </Link>
        </div>

      </main>
    </div>
  );
}
