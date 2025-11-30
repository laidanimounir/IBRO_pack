import React from 'react';
import { Product } from '@/types/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeaturedProductProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const DELIVERY_PRICE = 500;
// وصف مختصر ونظيف
const SHORT_DESC = "الخيار الأمثل لمطبخك العصري. أداء قوي وتصميم متين.";

export default function FeaturedProduct({ product, onAddToCart }: FeaturedProductProps) {
   const navigate = useNavigate();
  const discount = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);
  // const finalPrice = product.newPrice + DELIVERY_PRICE; // يمكن استخدامه إذا أردت عرض السعر النهائي

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative flex flex-col items-center text-center max-w-[320px] md:max-w-[350px] mx-auto cursor-pointer transition-all duration-300 hover:-translate-y-2"
    >
      
      {/* 1. حاوية الصورة النظيفة (دائرية أو مربعة بزوايا ناعمة) */}
      <div className="relative w-full aspect-square bg-[#F5F5F5] rounded-full md:rounded-[2.5rem] overflow-hidden mb-6 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
        
        {/* شارة التخفيض (بسيطة جداً) */}
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
            -{discount}%
          </div>
        )}

        {/* الصورة */}
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* زر إضافة سريع يظهر عند التحويم (اختياري للجمالية) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-4 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 md:flex hidden"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* 2. المعلومات (نظيفة وبسيطة) */}
      <div className="space-y-2 w-full px-2">
        
        {/* التقييم */}
        <div className="flex justify-center gap-0.5 text-yellow-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill="currentColor" />
          ))}
        </div>

        {/* العنوان */}
        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>

        {/* الوصف المختصر جداً */}
        <p className="text-xs text-gray-500 line-clamp-2 px-4">
          {SHORT_DESC}
        </p>

        {/* السعر */}
        <div className="flex items-center justify-center gap-3 mt-3">
           <span className="text-lg font-bold text-gray-900">
             {product.newPrice.toLocaleString()} <span className="text-xs font-normal">دج</span>
           </span>
           {product.oldPrice > product.newPrice && (
             <span className="text-sm text-gray-400 line-through decoration-red-500">
               {product.oldPrice.toLocaleString()}
             </span>
           )}
        </div>
      </div>

      {/* زر الموبايل (يبقى كما هو لأنه ضروري للتجربة) */}
      <div className="md:hidden mt-4 w-full">
        <Button 
           onClick={(e) => {
             e.stopPropagation();
             onAddToCart(product);
           }}
           className="w-full bg-gray-900 text-white rounded-xl py-6 font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
           <span>إضافة للسلة</span>
           <ShoppingCart size={16} />
        </Button>
      </div>

    </div>
  );
}
