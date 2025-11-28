import React from 'react';
import { Product } from '@/types/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Truck, Star, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface FeaturedProductProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const DELIVERY_PRICE = 500;
const PRODUCT_DESCRIPTION = "الخيار الأمثل لمطبخك العصري. أداء قوي، تصميم متين، ونتائج مذهلة في كل مرة. احصل عليه الآن واستفد من العرض المحدود.";

export default function FeaturedProduct({ product, onAddToCart }: FeaturedProductProps) {
   const navigate = useNavigate();
  const discount = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);
  const finalPrice = product.newPrice + DELIVERY_PRICE;

  return (
    // إضافة pb-24 هنا لضمان عدم تغطية المحتوى بواسطة الزر الثابت
    <div 
  onClick={() => navigate(`/product/${product.id}`)}
  className="relative bg-white rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 mb-12 cursor-pointer transition-transform hover:scale-[1.01] duration-300 min-h-[450px]"
>
      
      <div className="flex flex-col md:flex-row h-full items-stretch">
        
        {/* 1. الصورة (كاملة العرض في الهاتف) */}
        <div className="w-full md:w-[45%] relative min-h-[300px] md:min-h-full bg-gray-100">
           <img 
             src={product.imageUrl} 
             alt={product.name}
             className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center text-right space-y-6" 
           />
           <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10 animate-pulse">
              تخفيض {discount}% 🔥
           </div>
        </div>

        {/* 2. المحتوى */}
        <div className="w-full md:w-[55%] p-6 md:p-12 flex flex-col justify-center text-right space-y-6">
           
           <div>
              <div className="flex items-center justify-end gap-2 mb-2">
                 <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">الأكثر طلباً</span>
                 <div className="flex text-yellow-400"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-3">{product.name}</h2>
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed border-r-4 border-orange-200 pr-3">
                {PRODUCT_DESCRIPTION}
              </p>
           </div>

           {/* الفاتورة المفصلة */}
           <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200 text-sm">
              <div className="flex justify-between items-center">
                 <span className="font-bold">{product.newPrice.toLocaleString()} دج</span>
                 <span className="text-gray-500">سعر المنتج</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="font-bold">{DELIVERY_PRICE} دج</span>
                 <span className="text-gray-500 flex items-center gap-1">التوصيل <Truck size={12}/></span>
              </div>
              <div className="h-px bg-gray-300 w-full border-t border-dashed my-1"></div>
              <div className="flex justify-between items-center pt-1">
                 <span className="text-2xl font-black text-green-600">
                    {finalPrice.toLocaleString()} <small>دج</small>
                 </span>
                 <span className="font-bold text-gray-900 flex items-center gap-1">
                    المجموع <Calculator size={16} className="text-gray-400"/>
                 </span>
              </div>
           </div>

           {/* 🔥🔥🔥 الزر الثابت (Sticky Button) داخل المكون نفسه 🔥🔥🔥 */}
           {/* يظهر في الموبايل فقط (md:hidden) */}
           <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.15)] z-50 md:hidden flex gap-3 items-center safe-area-pb animate-in slide-in-from-bottom-full">
              <div className="flex flex-col items-start">
                 <span className="text-[10px] text-gray-400 line-through">{product.oldPrice + DELIVERY_PRICE}دج  </span>
                 <span className="text-lg font-bold text-green-600 leading-none">{finalPrice.toLocaleString()} دج</span>
              </div>
              <Button 
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-12 rounded-xl shadow-lg font-bold text-lg flex items-center justify-center gap-2"
              >
                أطلب الآن <ShoppingCart size={18} />
              </Button>
           </div>

           {/* زر الحاسوب (العادي) */}
           <div className="hidden md:block pt-2">
             <Button 
               onClick={() => onAddToCart(product)}
               className="w-full bg-gray-900 hover:bg-orange-600 text-white text-xl py-8 rounded-xl shadow-lg flex items-center justify-center gap-3"
             >
               <span>إضافة للسلة فوراً</span>
               <ShoppingCart className="w-6 h-6" />
             </Button>
           </div>

        </div>
      </div>
    </div>
  );
}
