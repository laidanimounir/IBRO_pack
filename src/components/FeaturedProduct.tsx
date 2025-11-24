
import { Product } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface FeaturedProductProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function FeaturedProduct({ product, onAddToCart }: FeaturedProductProps) {
  const discount = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);

  return (
    <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl overflow-hidden shadow-2xl mb-12">
      <div className="absolute top-6 right-6 z-10">
        <Badge className="bg-red-600 text-white text-lg px-4 py-2 shadow-lg">
          خصم {discount}%
        </Badge>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
        <div className="flex flex-col justify-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            عرض خاص!
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-orange-600">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-bold text-green-600">
              {product.newPrice.toLocaleString('ar-DZ')} دج
            </span>
            <span className="text-2xl text-gray-500 line-through">
              {product.oldPrice.toLocaleString('ar-DZ')} دج
            </span>
          </div>
          
          <p className="text-lg text-gray-700">
            وفر {(product.oldPrice - product.newPrice).toLocaleString('ar-DZ')} دج على هذا المنتج المميز!
          </p>
          
          <Button 
            onClick={() => onAddToCart(product)}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white text-xl py-6 px-8 rounded-xl shadow-lg"
          >
            <ShoppingCart className="ml-2 h-6 w-6" />
أطلب الآن          </Button>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-xl">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}