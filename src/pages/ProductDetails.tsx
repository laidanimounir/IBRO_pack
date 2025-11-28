import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // تأكد من المسار الصحيح لملف supabase (قد يكون @/lib/supabase)
import { Menu, X, ChevronRight, ShoppingBag, Home, Phone, Truck, ShieldCheck, User, MapPin, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import ReactPixel from 'react-facebook-pixel';

// تعريف نوع المنتج (يمكنك استيراده من types إذا كان موجوداً)
interface Product {
  id: string;
  name: string;
  newPrice: number;
  oldPrice?: number;
  imageUrl: string;
  description?: string;
}

const DELIVERY_PRICE = 500;

// -- Order Form Component --
const EmbeddedOrderForm = ({ product }: { product: Product }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const finalTotal = product.newPrice + DELIVERY_PRICE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      // 1. إضافة الزبون
      let customerId;
      const { data: existingCustomer } = await supabase
        .from('Customers')
        .select('id')
        .eq('phone', phone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: custError } = await supabase
          .from('Customers')
          .insert({ phone, name: customerName, address, totalOrders: 1 })
          .select('id')
          .single();
        if (custError) throw custError;
        customerId = newCustomer.id;
      }

      // 2. إنشاء الطلب
      const { data: newOrder, error: orderError } = await supabase
        .from('Orders')
        .insert({
          customerId,
          phone,
          address,
          totalAmount: finalTotal,
          status: 'pending',
          createdAt: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // 3. تفاصيل المنتج
      await supabase.from('OrderItems').insert([{
        orderId: newOrder.id,
        productId: product.id,
        productName: product.name,
        price: product.newPrice,
        quantity: 1,
      }]);

      toast.success('تم الطلب بنجاح!');
      // تصفير الحقول
      setCustomerName('');
      setPhone('');
      setAddress('');

    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الطلب');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      <div className="bg-orange-50 p-4 border-b border-orange-100">
        <h3 className="font-bold text-orange-800 flex items-center gap-2">
          <Truck size={20} /> أطلب الآن والدفع عند الاستلام
        </h3>
      </div>
      <div className="p-5">
        <div className="mb-6 bg-gray-50 rounded-xl p-3 border border-gray-100">
           <div className="flex justify-between font-bold text-gray-800">
              <span>المجموع الكلي:</span>
              <span className="text-xl text-green-600">{finalTotal.toLocaleString()} دج</span>
           </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="الاسم الكامل" className="w-full p-3 border border-gray-200 rounded-lg" />
           <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="رقم الهاتف" type="tel" className="w-full p-3 border border-gray-200 rounded-lg" />
           <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="العنوان (الولاية والبلدية)" className="w-full p-3 border border-gray-200 rounded-lg h-24 resize-none" />
           <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition">تأكيد الطلب</button>
        </form>
      </div>
    </div>
  );
};

// -- Main Page Component --
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data } = await supabase.from('Products').select('*').eq('id', id).single();
      if (data) setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">جارٍ التحميل...</div>;
  if (!product) return <div className="text-center py-20">المنتج غير موجود</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Mobile Drawer */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsMenuOpen(false)} />}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white z-[70] transition-transform duration-300 shadow-2xl ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center">
           <span className="font-bold text-orange-600">IBRO.dz</span>
           <button onClick={() => setIsMenuOpen(false)}><X /></button>
        </div>
        <nav className="p-4 space-y-2">
           <Link to="/" className="block p-2 hover:bg-orange-50 rounded text-gray-700">الصفحة الرئيسية</Link>
           <Link to="/contact" className="block p-2 hover:bg-orange-50 rounded text-gray-700">اتصل بنا</Link>
        </nav>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm h-16 flex items-center justify-between px-4">
        <button onClick={() => setIsMenuOpen(true)}><Menu className="text-gray-700" /></button>
        <Link to="/" className="text-xl font-bold text-gray-900">IBRO<span className="text-orange-500">.dz</span></Link>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-bold text-gray-500">عودة <ChevronRight className="rotate-180" size={18} /></button>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 grid lg:grid-cols-12 gap-8">
        {/* Right: Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100">
             <img src={product.imageUrl} alt={product.name} className="w-full object-contain max-h-[400px]" />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
             <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
             <div className="text-3xl font-black text-orange-600 mb-4">{product.newPrice} دج</div>
             <div className="prose prose-sm text-gray-600">
                <h3 className="font-bold mb-2">الوصف:</h3>
                <p>وصف المنتج...</p>
             </div>
          </div>
        </div>

        {/* Left: Form */}
        <div className="lg:col-span-5">
           <div className="sticky top-24">
              <EmbeddedOrderForm product={product} />
           </div>
        </div>
      </main>
    </div>
  );
}
