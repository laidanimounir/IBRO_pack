import { Product } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 px-2">
      {products.map((product) => {
        const discount = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);
        
        return (
          <div 
            key={product.id} 
            onClick={() => navigate(`/product/${product.id}`)} 
            className="group flex flex-col items-center text-center cursor-pointer"
          >
            
          
            <div className="relative w-full aspect-[4/5] md:aspect-square bg-[#F5F5F5] rounded-[1.5rem] mb-4 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-md p-4">
              
              {discount > 0 && (
                <Badge className="absolute top-3 right-3 bg-black hover:bg-black text-white text-[10px] px-2 py-0.5 z-10 border-none">
                  -{discount}%
                </Badge>
              )}

        
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              />

              <Button 
                size="icon"
                variant="secondary"
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                }}
                className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white text-orange-600 shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-orange-50 hidden md:flex"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
          
            <div className="w-full space-y-1">
              <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-base md:text-lg font-bold text-gray-900">
                  {product.newPrice.toLocaleString('ar-DZ')} <small className="text-xs font-normal">دج</small>
                </span>
                {product.oldPrice > product.newPrice && (
                  <span className="text-xs md:text-sm text-gray-400 line-through decoration-red-500">
                    {product.oldPrice.toLocaleString('ar-DZ')}
                  </span>
                )}
              </div>

              <Button 
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                }}
                variant="outline"
                className="w-full mt-3 md:hidden border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 h-9 text-xs font-bold rounded-lg"
              >
                أطلب الآن
              </Button>

            </div>
          </div>
        );
      })}
    </div>
  );
}
