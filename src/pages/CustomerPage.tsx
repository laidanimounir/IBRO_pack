import React, { useEffect, useState } from 'react';
import { Product } from '@/types/types';
import FeaturedProduct from '@/components/FeaturedProduct';
import ProductGrid from '@/components/ProductGrid';
import OrderForm from '@/components/OrderForm';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 6;

export default function CustomerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [showOrderFormModal, setShowOrderFormModal] = useState(false);

 



useEffect(() => {
  let isMounted = true;
  
  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;

      // 1. تم دمج الطلبين في طلب واحد (نحصل على البيانات والعدد معاً)
      // 2. تأكدت من جلب الأعمدة الضرورية فقط
      const { data, count, error } = await supabase
        .from('Products')
        .select('id, name, oldPrice, newPrice, imageUrl, isFeatured,createAt', { count: 'exact' })
        .range(from, to);

      if (!isMounted) return; // إذا تغيرت الصفحة، لا تقم بتحديث الحالة

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setProducts(data);
        // نستفيد من العدد القادم مع البيانات ولا داعي لطلبه منفصلاً
        setTotalProducts(count ?? 0); 
      } else {
        setProducts([]);
        setErrorMsg('لا توجد منتجات للعرض حالياً');
      }

    } catch (err) {
      if (isMounted) {
        console.error("Error fetching products:", err.message);
        setErrorMsg('فشل تحميل المنتجات، يرجى التحقق من الاتصال');
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchProducts();

  // تنظيف الذاكرة عند تغيير الصفحة
  return () => {
    isMounted = false;
  };

}, [page]); // فقط page هي المتغير




  const featuredProduct = products.find(p => p.isFeatured);
  const regularProducts = products.filter(p => !p.isFeatured);

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setShowOrderFormModal(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const handleClearCart = () => {
    setCart([]);
    setShowOrderFormModal(false); // غلق النموذج عند مسح السلة أو بعد الطلب
  };

  const pageCount = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const handleCloseOrderForm = () => {
    setShowOrderFormModal(false);
  };

  return (
      
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* نافذة نموذج الطلب (Modal) - نسخة Bottom Sheet للموبايل */}
      {showOrderFormModal && (
        // لاحظ: items-end للموبايل (ينزل للأسفل) و items-center للحاسوب
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 animate-in fade-in duration-200">
          
          {/* لاحظ: rounded-t-[2rem] للموبايل (حواف دائرية من فوق فقط) */}
          <div className="bg-white w-full max-w-lg relative max-h-[85vh] overflow-hidden rounded-t-[2rem] md:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            
            {/* زر الإغلاق */}
            <button
              onClick={handleCloseOrderForm}
              className="absolute top-3 right-4 z-20 bg-gray-100/80 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
            >
              <span className="text-xl font-bold text-gray-500 leading-none">&times;</span>
            </button>

            {/* الفورم */}
            <OrderForm
              cart={cart}
              onRemoveFromCart={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
              onClearCart={handleClearCart}
            />
          </div>
        </div>
      )}


      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative bg-white/20 backdrop-blur-sm p-2 rounded-full">
                <ShoppingBag className="h-7 w-7 text-white" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                    {cart.length}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                <img
                  src="/assets/logo-ibro-kitchen.png"
                  alt="IBRO kitchen dz"
                  className="h-12 w-12 object-contain"
                  loading="lazy"
                />
              </div>
              <div className="text-right">
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  IBRO kitchen dz
                </h1>
                <p className="text-sm text-orange-100 font-medium">أدوات المطبخ الاحترافية</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src="/assets/hero-kitchen-banner.jpg"
          alt="Kitchen Banner"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white text-right mb-2">
              مرحباً بكم في متجرنا
            </h2>
            <p className="text-xl text-white/90 text-right">
              أفضل أدوات المطبخ بأسعار منافسة
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-8">
            {featuredProduct && (
              <div>
                <FeaturedProduct
                  product={featuredProduct}
                  onAddToCart={handleAddToCart}
                />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-right">
                منتجاتنا
              </h2>
              {loading ? (
                <div className="text-center text-orange-600 py-8">جارٍ تحميل المنتجات...</div>
              ) : errorMsg ? (
                <div className="text-center text-red-500 py-8">{errorMsg}</div>
              ) : (
                <ProductGrid
                  products={regularProducts}
                  onAddToCart={handleAddToCart}
                />
              )}
            </div>
          </div>
          {/* لم يعد هناك أي OrderForm أو سلة جانب الصفحة */}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">IBRO kitchen dz</p>
          <p className="text-gray-400">أدوات المطبخ الاحترافية - جودة عالية وأسعار منافسة</p>
        </div>
      </footer>
    </div>
  );
}
