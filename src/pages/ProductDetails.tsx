import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, X, ChevronRight, ShoppingBag, Home, Phone, Truck, ShieldCheck, User, MapPin, Calculator, Star, ChevronDown } from 'lucide-react';
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

interface Wilaya {
  id: number;
  name: string;
  price: number;
  active: boolean;
}

const PRODUCT_DESCRIPTION = "الخيار الأمثل لمطبخك العصري. أداء قوي، تصميم متين، ونتائج مذهلة في كل مرة. احصل عليه الآن واستفد من العرض المحدود.";

const EmbeddedOrderForm = ({ 
  product, 
  onFieldsChange,
  navigate 
}: {  
  product: Product; 
  onFieldsChange?: (filled: boolean) => void;
  navigate: ReturnType<typeof useNavigate>; 
}) => {

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [wilaya, setWilaya] = useState(''); 
  const [quantity, setQuantity] = useState(1);
  
  
  const [wilayasList, setWilayasList] = useState<Wilaya[]>([]);
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [deliveryPrice, setDeliveryPrice] = useState(500);


  useEffect(() => {
    const loadWilayas = async () => {
      const { data, error } = await supabase
        .from('Wilayas')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading wilayas:', error);
      } else {
        setWilayasList(data || []);
      }
      setLoadingWilayas(false);
    };
    loadWilayas();
  }, []);

  
  useEffect(() => {
    if (wilaya) {
      const selectedWilaya = wilayasList.find(w => w.name === wilaya);
      if (selectedWilaya) {
        setDeliveryPrice(selectedWilaya.price);
      }
    }
  }, [wilaya, wilayasList]);


  useEffect(() => {
    const isFilled = customerName.trim() !== '' && phone.trim() !== '' && address.trim() !== '' && wilaya.trim() !== '';
    onFieldsChange?.(isFilled);
  }, [customerName, phone, address, wilaya, onFieldsChange]);

  const finalTotal = (product.newPrice * quantity) + deliveryPrice;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!customerName?.trim() || !phone?.trim() || !address?.trim() || !wilaya?.trim()) {
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
        .insert({ phone, name: customerName, address, totalOrders: 1, deliveredOrders: 0, warnings: 0 })
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
        wilaya,
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
      quantity: quantity,
    }]);

    // ✅ Pixel: Purchase بعد النجاح
    ReactPixel.track('Purchase', {
      value: finalTotal,
      currency: 'DZD',
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      num_items: quantity,
    });

    toast.success('تم الطلب بنجاح!');
    
    // ✅ الانتقال لصفحة الشكر
    setTimeout(() => {
      navigate(`/thank-you/${newOrder.id}`);
    }, 1500);

  } catch (err) {
    console.error(err);
    toast.error('حدث خطأ أثناء الطلب');
  }
};




  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100" id="order-form">

    
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 border-b border-orange-200">
        <div className="flex gap-3 items-center mb-3">
          <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border-2 border-orange-300 flex-shrink-0 shadow-sm">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-orange-600">{product.newPrice.toLocaleString()} دج</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">توصيل {deliveryPrice} دج</span>
            </div>
          </div>
        </div>

       
        <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-orange-200">
          <span className="text-xs font-bold text-gray-700">الكمية:</span>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center transition"
            >
              −
            </button>
            <span className="text-lg font-black text-gray-900 w-8 text-center">{quantity}</span>
            <button 
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center transition"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
      
        <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="font-bold">{(product.newPrice * quantity).toLocaleString()} دج</span>
            <span className="text-gray-600">المنتج</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">{deliveryPrice} دج</span>
            <span className="text-gray-600">التوصيل</span>
          </div>
          <div className="h-px bg-gray-300 my-1"></div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-xl font-black text-green-600">{finalTotal.toLocaleString()} <small className="text-sm">دج</small></span>
            <span className="font-bold text-gray-900">المجموع</span>
          </div>
        </div>

   
        <form onSubmit={handleSubmit} className="space-y-2" id="order-form-submit">
          
          <input 
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)} 
            placeholder="الاسم الكامل" 
            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" 
            required
          />

          <input 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            placeholder="رقم الهاتف (05XXXXXXXX)" 
            type="tel" 
            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" 
            required
          />

        
          <div className="relative">
            <select
              value={wilaya}
              onChange={e => setWilaya(e.target.value)}
              disabled={loadingWilayas}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition appearance-none bg-white pr-8"
              required
            >
              <option value="">{loadingWilayas ? 'جارٍ التحميل...' : 'اختر الولاية'}</option>
              {wilayasList.map(w => (
                <option key={w.id} value={w.name}>
                  {w.name} - {w.price} دج
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <textarea 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
            placeholder="العنوان (البلدية والشارع)" 
            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg h-20 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" 
            required
          />

       
          <div className="flex items-center justify-around bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg p-2 border border-gray-200 text-[10px] font-bold">
            <div className="flex items-center gap-1 text-green-700">
              <Truck size={14} />
              <span>توصيل سريع</span>
            </div>
            <div className="flex items-center gap-1 text-blue-700">
              <ShieldCheck size={14} />
              <span>ضمان</span>
            </div>
            <div className="flex items-center gap-1 text-purple-700">
              <Phone size={14} />
              <span>دفع آمن</span>
            </div>
          </div>

       
<button 
  type="submit"
  onMouseDown={() => {
  
    ReactPixel.track('InitiateCheckout', {
      content_ids: [product.id],
      content_name: product.name,
      value: finalTotal,
      currency: 'DZD',
      num_items: quantity,
    });
  }}
  className="hidden md:block w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm"
>
  ✅ تأكيد الطلب الآن
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
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
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
              <p className="leading-relaxed whitespace-pre-line">
                {product.description || PRODUCT_DESCRIPTION}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-20 md:top-24">
            <EmbeddedOrderForm 
  product={product} 
  onFieldsChange={setIsFormFilled}
  navigate={navigate} 
/>

          </div>
        </div>
      </main>

      
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
          
            const form = document.getElementById('order-form-submit') as HTMLFormElement;
            if (form) {
              // حساب السعر الحالي
              const quantityEl = document.querySelector('.font-black.text-gray-900.w-8') as HTMLElement;
              const currentQuantity = quantityEl ? parseInt(quantityEl.textContent || '1') : 1;
              const totalEl = document.querySelector('.text-xl.font-black.text-green-600') as HTMLElement;
              const totalText = totalEl?.textContent?.replace(/[^\d]/g, '') || '';
              const currentTotal = parseInt(totalText) || (product.newPrice * currentQuantity + 500);
              
              ReactPixel.track('InitiateCheckout', {
                content_ids: [product.id],
                content_name: product.name,
                value: currentTotal,
                currency: 'DZD',
                num_items: currentQuantity,
              });
              
              form.requestSubmit();
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
