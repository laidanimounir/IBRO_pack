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
    supabase
      .from('Products')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setTotalProducts(count ?? 0));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setErrorMsg('');
      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;
      const { data, count, error } = await supabase
        .from('Products')
        .select('id, name, oldPrice, newPrice, imageUrl, isFeatured', { count: 'exact' })
        .range(from, to);
      setLoading(false);
      if (error) {
        setErrorMsg('فشل تحميل المنتجات');
        setProducts([]);
      } else if (!data || data.length === 0) {
        setErrorMsg('لا توجد منتجات للعرض حالياً');
        setProducts([]);
      } else {
        setProducts(data);
        setTotalProducts(count ?? 0);
      }
    };
    fetchProducts();
  }, [page]);

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
      {/* نافذة نموذج الطلب (Modal) */}
      {showOrderFormModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl relative">
            <button
              onClick={handleCloseOrderForm}
              className="absolute top-2 right-2 text-3xl text-gray-400 font-bold focus:outline-none"
              aria-label="إغلاق"
            >
              &times;
            </button>
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
