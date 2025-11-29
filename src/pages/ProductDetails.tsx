import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, X, ChevronRight, ShoppingBag, Home, Phone, Truck, ShieldCheck, User, MapPin, Calculator, Star } from 'lucide-react';
import { toast } from 'sonner';
import ReactPixel from 'react-facebook-pixel';

interface Product {
  id: string;
  name: string;
  newPrice: number;
  oldPrice?: number;
  imageUrl: string;
  description?: string;
}


const DELIVERY_PRICE = 500;
const PRODUCT_DESCRIPTION = "الخيار الأمثل لمطبخك العصري. أداء قوي، تصميم متين، ونتائج مذهلة في كل مرة. احصل عليه الآن واستفد من العرض المحدود.";


const EmbeddedOrderForm = ({ 
  product, onFieldsChange }: {  product: Product; onFieldsChange?: (filled: boolean) => void; 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  // تحقق من ملء الحقول
useEffect(() => {
  const isFilled = customerName.trim() !== '' && phone.trim() !== '' && address.trim() !== '';
  onFieldsChange?.(isFilled);
}, [customerName, phone, address, onFieldsChange]);


  const finalTotal = (product.newPrice * quantity) + DELIVERY_PRICE;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
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
          .insert({ phone, name: customerName, address, totalOrders: 1,deliveredOrders: 0 ,warnings: 0})
          .select('id')
          .single();
          
        if (custError) throw custError;
        customerId = newCustomer.id;
      }

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

      await supabase.from('OrderItems').insert([{
        orderId: newOrder.id,
        productId: product.id,
        productName: product.name,
        price: product.newPrice,
       
      }]);

      toast.success('تم الطلب بنجاح!');
      setCustomerName('');
      setPhone('');
      setAddress('');

    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الطلب');
    }
  };

  return (
    
<div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden" id="order-form">
      

<div className="bg-orange-50 p-4 border-b border-orange-100">
  <div className="flex gap-3 items-start mb-3">
    {/* صورة المنتج */}
    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border-2 border-orange-200 flex-shrink-0">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-full object-cover"
      />
    </div>
    
    {/* معلومات المنتج */}
    <div className="flex-1">
      <h3 className="font-bold text-gray-900 text-base mb-1 leading-tight">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Truck size={14} className="text-orange-600" />
        <span>توصيل ثابت: <span className="font-bold text-orange-600">500 دج</span></span>
      </div>
      <div className="mt-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full inline-block">
        ✅ الدفع عند الاستلام
      </div>
    </div>
  </div>

  {/* مؤشر الكمية */}
  <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-orange-200">
    <span className="font-bold text-gray-700 text-sm">الكمية:</span>
    <div className="flex items-center gap-2">
      <button 
        type="button"
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-lg flex items-center justify-center transition active:scale-95"
      >
        −
      </button>
      <span className="text-lg font-black text-gray-900 w-10 text-center">{quantity}</span>
      <button 
        type="button"
        onClick={() => setQuantity(quantity + 1)}
        className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg flex items-center justify-center transition active:scale-95"
      >
        +
      </button>
    </div>
  </div>
</div>

      
      <div className="p-5">
        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-bold">{product.newPrice.toLocaleString()} دج</span>
            <span className="text-gray-500">سعر المنتج</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">{DELIVERY_PRICE} دج</span>
            <span className="text-gray-500 flex items-center gap-1">
              التوصيل <Truck size={12}/>
            </span>
          </div>
          <div className="h-px bg-gray-300 w-full border-t border-dashed my-1"></div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-2xl font-black text-green-600">
              {finalTotal.toLocaleString()} <small>دج</small>
            </span>
            <span className="font-bold text-gray-900 flex items-center gap-1">
              المجموع <Calculator size={16} className="text-gray-400"/>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
            <Truck className="mx-auto text-green-600" size={20} />
            <p className="text-[10px] font-bold mt-1 text-green-700">توصيل سريع</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <ShieldCheck className="mx-auto text-blue-600" size={20} />
            <p className="text-[10px] font-bold mt-1 text-blue-700">ضمان الجودة</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
            <Phone className="mx-auto text-orange-600" size={20} />
            <p className="text-[10px] font-bold mt-1 text-orange-700">دعم 24/7</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="order-form-submit">

  {/* عنوان الفورم */}
  <div className="text-center pb-2 border-b border-gray-200">
    <h4 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
      ✍️ أدخل معلوماتك هنا
    </h4>
    <p className="text-xs text-gray-500 mt-1">املأ الحقول لإكمال طلبك</p>
  </div>

  <input 
    value={customerName} 
    onChange={e => setCustomerName(e.target.value)} 
    placeholder="الاسم الكامل" 
    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" 
  />

          
          <input 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            placeholder="رقم الهاتف" 
            type="tel" 
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" 
          />
          <textarea 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
            placeholder="العنوان (الولاية والبلدية)" 
            className="w-full p-3 border border-gray-200 rounded-lg h-24 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" 
          />
          <button 
  type="submit" 
  className="hidden md:block w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
>
  تأكيد الطلب
</button>

        </form>
      </div>
    </div>
  );
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false); 

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data } = await supabase.from('Products').select('*').eq('id', id).single();
      if (data) setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">المنتج غير موجود</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }

  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60]" 
          onClick={() => setIsMenuOpen(false)} 
        />
      )}
      
      <div className={`fixed top-0 right-0 h-full w-64 bg-white z-[70] transition-transform duration-300 shadow-2xl ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-bold text-orange-600">IBRO.dz</span>
          <button onClick={() => setIsMenuOpen(false)}>
            <X />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/" className="block p-2 hover:bg-orange-50 rounded text-gray-700">
            الصفحة الرئيسية
          </Link>
          <Link to="/contact" className="block p-2 hover:bg-orange-50 rounded text-gray-700">
            اتصل بنا
          </Link>
        </nav>
      </div>

      <header className="sticky top-0 z-50 bg-white shadow-sm h-16 flex items-center justify-between px-4">
        <button onClick={() => setIsMenuOpen(true)}>
          <Menu className="text-gray-700" />
        </button>
        <Link to="/" className="text-xl font-bold text-gray-900">
          IBRO<span className="text-orange-500">.dz</span>
        </Link>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700"
        >
          عودة <ChevronRight className="rotate-180" size={18} />
        </button>
      </header>

      <main className="container mx-auto px-4 py-6 flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 max-w-4xl">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 relative">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full object-contain max-h-[400px]" 
            />
            {product.oldPrice && discount > 0 && (
              <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse z-10">
                تخفيض {discount}% 🔥
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-end gap-2 mb-3">
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                الأكثر طلباً
              </span>
              <div className="flex text-yellow-400">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              {product.oldPrice && (
                <span className="text-gray-400 line-through text-lg">
                  {product.oldPrice.toLocaleString()} دج
                </span>
              )}
              <span className="text-3xl font-black text-orange-600">
                {product.newPrice.toLocaleString()} دج
              </span>
            </div>

            <div className="prose prose-sm text-gray-600">
              <h3 className="font-bold mb-2 text-gray-900">الوصف:</h3>
              <p className="leading-relaxed">
                {product.description || PRODUCT_DESCRIPTION}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-20 md:top-24">
            <EmbeddedOrderForm product={product}onFieldsChange={setIsFormFilled}/>
          </div>
        </div>
      </main>

   {/* زر الموبايل الثابت */}
      {product && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-2xl z-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start">
              {product.oldPrice && (
                <span className="text-[10px] text-gray-400 line-through">
                  {product.oldPrice.toLocaleString()} دج
                </span>
              )}
              <span className="text-lg font-black text-green-600">
                {product.newPrice.toLocaleString()} دج
              </span>
            </div>

            <button 
              onClick={() => {
                if (isFormFilled) {
                  const formSubmit = document.getElementById('order-form-submit') as HTMLFormElement;
                  if (formSubmit) {
                    formSubmit.requestSubmit();
                  }
                } else {
                  const firstInput = document.querySelector('input[placeholder="الاسم الكامل"]') as HTMLElement;
                  if (firstInput) {
                    firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInput.classList.add('ring-4', 'ring-orange-300');
                    setTimeout(() => firstInput.classList.remove('ring-4', 'ring-orange-300'), 2000);
                    setTimeout(() => firstInput.focus(), 500);
                  }
                }
              }}
              className={`flex-1 py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isFormFilled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isFormFilled ? (
                <>✅ إرسال الطلب الآن</>
              ) : (
                <>📝 املأ المعلومات</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
