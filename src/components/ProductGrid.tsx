import { Product } from '@/types/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const discount = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);
        
        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-64 overflow-hidden bg-gray-100">
              {discount > 0 && (
                <Badge className="absolute top-3 right-3 bg-red-600 text-white z-10">
                  -{discount}%
                </Badge>
              )}
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-right">
                {product.name}
              </h3>
              
              <div className="flex items-baseline justify-end gap-3 mb-4">
                <span className="text-2xl font-bold text-green-600">
                  {product.newPrice.toLocaleString('ar-DZ')} دج
                </span>
                {product.oldPrice > product.newPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {product.oldPrice.toLocaleString('ar-DZ')} دج
                  </span>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <Button 
                onClick={() => onAddToCart(product)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                أطلب الآن
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}