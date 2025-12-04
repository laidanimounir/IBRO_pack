import React, { useEffect, useState } from 'react';
import { Product } from '@/types/types';
import FeaturedProduct from '@/components/FeaturedProduct';
import ProductGrid from '@/components/ProductGrid';
import OrderForm from '@/components/OrderForm';
import { ShoppingBag, Search, Menu } from 'lucide-react';
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
  const [isScrolled, setIsScrolled] = useState(false);
const [showBrowseButton, setShowBrowseButton] = useState(true);
 
  // Scroll effect for Navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(window.scrollY > 50);
      setShowBrowseButton(scrollY < 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = page * PAGE_SIZE - 1;

        const { data, count, error } = await supabase
          .from('Products')
          .select('id, name, oldPrice, newPrice, imageUrl, isFeatured, createAt', { count: 'exact' })
          .range(from, to);

        if (!isMounted) return;

        if (error) throw error;

        if (data && data.length > 0) {
          setProducts(data);
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

    return () => {
      isMounted = false;
    };

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
    setShowOrderFormModal(false);
  };

  const handleCloseOrderForm = () => {
    setShowOrderFormModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Order Modal */}
      {showOrderFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg relative max-h-[85vh] overflow-hidden rounded-t-[2rem] md:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            <button
              onClick={handleCloseOrderForm}
              className="absolute top-3 left-4 z-20 bg-gray-100/80 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
            >
              <span className="text-xl font-bold text-gray-500 leading-none">&times;</span>
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

      {/* Modern Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3">
               {/* Use a transparent PNG logo here ideally */}
               <div className={`p-2 rounded-full ${isScrolled ? 'bg-orange-50' : 'bg-white/20 backdrop-blur-sm'}`}>
                 <img
                   src="/assets/logo-ibro-kitchen.png"
                   alt="IBRO"
                   className="h-8 w-8 md:h-10 md:w-10 object-contain"
                 />
               </div>
               <div>
                 <h1 className={`text-xl md:text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                   IBRO<span className="text-orange-500">.kitchen</span>
                 </h1>
               </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/20 text-white'}`}>
                <Search className="w-6 h-6" />
              </button>
              
              <div className="relative group cursor-pointer" onClick={() => setShowOrderFormModal(true)}>
                 <div className={`p-2 rounded-full transition-colors ${isScrolled ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/20 text-white'}`}>
                   <ShoppingBag className="w-6 h-6" />
                 </div>
                 {cart.length > 0 && (
                   <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-bold rounded-full
                 w-6 h-6 text-[11px] md:w-5 md:h-5 md:text-[10px]
                 flex items-center justify-center border-2 border-white">
                     {cart.length}
                   </span>
                 )}
              </div>

              <button className={`md:hidden p-2 rounded-full ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
{/* Hero Section */}
<div className="relative min-h-screen overflow-hidden bg-[#f8f5f2]">
  {/* صورة الخلفية */}
  <img
    src="/assets/ibro.png"
    alt="IBRO Kitchen Banner"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* طبقة تعتيم خفيفة */}
  <div className="absolute inset-0 bg-black/40" />

  {/* البانر البرتقالي يملأ ارتفاع الهيرو */}
  <div className="absolute inset-0 z-10 flex justify-end">
    <div className="w-full max-w-lg md:max-w-3xl lg:max-w-4xl h-full pr-4 md:pr-16">
      <div className="relative h-full rounded-3xl shadow-2xl overflow-hidden animate-[heroSlideIn_0.6s_ease-out]">

        {/* الخلفية البرتقالية المائلة فقط */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)',
          }}
        />

        {/* محتوى الكارد فوق الخلفية، بدون أي clip-path */}
        <div className="relative h-full text-white p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          {/* منطقة آمنة للنص */}
          <div className="max-w-[70%] md:max-w-[55%] lg:max-w-[50%]">
           
          

            {/* العنوان - الآن لن يُقصّ أبداً */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
              كل ما يحتاجه مطبخك
              <span className="block text-orange-100">في متجر IBRO Kitchen</span>
            </h1>

            {/* نص ثانوي */}
            <p className="text-sm md:text-base text-orange-50/95 mb-6">

              أجهزة مطبخ كهربائية وأدوات طهي مختارة بعناية، مع جودة عالية
              وتجربة شراء سهلة وسريعة من مكان واحد.
            </p>

            {/* الأزرار */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={() =>
                  document
                    .getElementById('products-section')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-3 rounded-full
                           text-sm md:text-base shadow-md shadow-black/20
                           transition-transform hover:scale-[1.03] active:scale-95"
              >
                تسوّق الآن
              </button>

              
            </div>
          </div>

          {/* دائرة الخصم في أسفل الكارد */}
<div className="absolute bottom-6 left-6 md:left-10">
  <div
    className="
      relative w-28 h-28 md:w-32 md:h-32 rounded-full
      bg-white/95 text-orange-600 border-2 border-orange-400
      flex flex-col items-center justify-center font-bold shadow-xl
      hover:scale-105 transition-transform duration-200
    "
  >
    <span className="text-[11px] md:text-xs text-orange-500 tracking-wide">
      خصم يصل حتى
    </span>
    <span className="text-3xl md:text-4xl leading-none">
      70%
    </span>
    <span className="text-[10px] md:text-xs text-gray-500 font-normal mt-1">
      على مختارات مختارة
    </span>
  </div>
</div>

        </div>
      </div>
    </div>
  </div>


</div>




      {/* Main Content */}
      <div id="products-section" className="container mx-auto px-4 py-12 md:py-20 space-y-20 md:space-y-24">
        
        {/* Featured Product Section */}
        {featuredProduct && (
          <section className="bg-gradient-to-br from-white to-orange-50 rounded-[2.5rem] p-6 md:p-12 shadow-sm border border-gray-100">

            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-1.5 bg-orange-500 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">الأكثر مبيعا </h2>
            </div>
            <FeaturedProduct
              product={featuredProduct}
              onAddToCart={handleAddToCart}
            />
          </section>
        )}

        {/* Products Grid Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1.5 bg-gray-900 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">كل المنتجات</h2>
            </div>
            {/* Optional: Filter/Sort buttons could go here */}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">جارٍ تحميل أفضل المنتجات...</p>
            </div>
          ) : errorMsg ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
              {errorMsg}
            </div>
          ) : (
            <ProductGrid
              products={regularProducts}
              onAddToCart={handleAddToCart}
            />
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-orange-50 rounded-lg">
                   <img src="/assets/logo-ibro-kitchen.png" alt="Logo" className="w-8 h-8 object-contain" />
                 </div>
                 <span className="text-xl font-bold text-gray-900">IBRO.dz</span>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-sm">
                وجهتكم الأولى لأدوات المطبخ العصرية في الجزائر. نضمن لكم الجودة، السعر المنافس، والتوصيل السريع لجميع الولايات.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-orange-500 transition-colors">الرئيسية</a></li>
                <li><a href="#products-section" className="hover:text-orange-500 transition-colors">المنتجات</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">اتصل بنا</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-gray-500">
                <li>0555 00 00 00</li>
                <li>contact@ibro-kitchen.dz</li>
                <li>الجزائر العاصمة، الجزائر</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} IBRO kitchen dz. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
