import { useState } from 'react';
import { Product, OrderItem } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import ReactPixel from 'react-facebook-pixel';

interface OrderFormProps {
  cart: Array<{ product: Product; quantity: number }>;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
}
declare global {
  interface Window {
    fbq: any;
  }
}

export default function OrderForm({ cart, onRemoveFromCart, onUpdateQuantity, onClearCart }: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + item.product.newPrice * item.quantity, 0);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    if (cart.length === 0) {
      toast.error('السلة فارغة! الرجاء إضافة منتجات أولاً');
      return;
    }

    try {
      let customerId: string | null = null;

      // ... (جزء الزبون - اتركه كما هو) ...
      const { data: existingCustomer, error: selectError } = await supabase
        .from('Customers')
        .select('id, totalOrders')
        .eq('phone', phone)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        toast.error(`خطأ في التحقق من الزبون: ${selectError.message}`);
        return;
      }

      if (existingCustomer) {
        const newTotalOrders = (existingCustomer.totalOrders ?? 0) + 1;
        await supabase
          .from('Customers')
          .update({ totalOrders: newTotalOrders })
          .eq('phone', phone);
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: insertError } = await supabase
          .from('Customers')
          .insert({
            phone,
            name: customerName,
            address,
            totalOrders: 1,
            deliveredOrders: 0,
            isReliable: true,
            warnings: 0,
          })
          .select('id')
          .single();

        if (insertError) {
          toast.error(`فشل إضافة الزبون: ${insertError.message}`);
          return;
        }
        customerId = newCustomer.id;
      }

      if (!customerId) {
        toast.error('حدث خطأ في ربط الطلب بالزبون');
        return;
      }

      // ... (جزء الطلب - اتركه كما هو) ...
      const { data: newOrder, error: orderError } = await supabase
        .from('Orders')
        .insert({
          customerId,
          phone,
          address,
          totalAmount,
          status: 'pending',
          rejectionReason: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (orderError) {
        toast.error(`حدث خطأ في إضافة الطلب: ${orderError.message}`);
        return;
      }

      const orderItems = cart.map(item => ({
        orderId: newOrder.id,
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.newPrice,
        quantity: item.quantity,
      }));

      await supabase.from('OrderItems').insert(orderItems);

      // 🔥 كود البيكسل (تم تصحيح المكان) 🔥
      ReactPixel.track('Purchase', {
        currency: "DZD",
        value: totalAmount,
        content_type: 'product',
        num_items: cart.length
      });

      // ✅ الآن toast والمسح داخل الـ try بشكل صحيح
      toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');

      setCustomerName('');
      setPhone('');
      setAddress('');
      onClearCart();

    } catch (err: any) { // هنا يغلق القوس try بشكل صحيح
      console.error('حدث خطأ أثناء معالجة الطلب:', err);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    }
  };




  if (cart.length === 0) {
    return (
      <Card className="sticky top-6">
        <CardContent className="p-8 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">لقد ألغيت الطلب</p>
          <p className="text-gray-500 text-sm mt-2">حــــأول مرة أخرى</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6">
      <CardHeader className="bg-orange-600 text-white">
        <CardTitle className="text-2xl text-right">سلة المشتريات</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {cart.map(item => (
            <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 text-right">
                <p className="font-semibold text-sm">{item.product.name}</p>
                <p className="text-green-600 font-bold">{item.product.newPrice.toLocaleString('ar-DZ')} دج</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemoveFromCart(item.product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <Badge className="text-lg px-4 py-2 bg-green-600">{totalAmount.toLocaleString('ar-DZ')} دج</Badge>
            <span className="text-lg font-semibold">المجموع الكلي:</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">الاسم الكامل</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="text-right"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-right block">رقم الهاتف</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0XXX XX XX XX"
              className="text-right"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-right block">العنوان</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="أدخل عنوانك الكامل"
              className="text-right min-h-24"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
          >
            إرسال الطلب
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
