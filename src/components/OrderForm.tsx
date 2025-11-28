import { useState } from 'react';
import { Product } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ShoppingBag, Truck, User, Phone, MapPin, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import ReactPixel from 'react-facebook-pixel';

const DELIVERY_PRICE = 500;

interface OrderFormProps {
  cart: Array<{ product: Product; quantity: number }>;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
}

declare global {
  interface Window { fbq: any; }
}

export default function OrderForm({ cart, onRemoveFromCart, onUpdateQuantity, onClearCart }: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const productsTotal = cart.reduce((sum, item) => sum + item.product.newPrice * item.quantity, 0);
  const finalTotal = productsTotal + DELIVERY_PRICE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. التحقق من المدخلات
    if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (cart.length === 0) {
      toast.error('السلة فارغة!');
      return;
    }

    try {
      let customerId: string | null = null;

      // 2. التحقق من الزبون
      const { data: existingCustomer, error: selectError } = await supabase
        .from('Customers')
        .select('id, totalOrders')
        .eq('phone', phone)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error finding customer:', selectError);
        // نكمل العملية ولا نوقفها، قد يكون خطأ شبكة عابر
      }

      if (existingCustomer) {
        // تحديث زبون موجود
        const newTotalOrders = (existingCustomer.totalOrders ?? 0) + 1;
        await supabase
          .from('Customers')
          .update({ totalOrders: newTotalOrders })
          .eq('phone', phone);
        customerId = existingCustomer.id;
      } else {
        // إنشاء زبون جديد
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
          throw new Error(`فشل إضافة الزبون: ${insertError.message}`);
        }
        customerId = newCustomer.id;
      }

      if (!customerId) {
        throw new Error('لم يتم تحديد معرف الزبون');
      }

      // 3. إنشاء الطلب
      const { data: newOrder, error: orderError } = await supabase
        .from('Orders')
        .insert({
          customerId,
          phone,
          address,
          totalAmount: finalTotal, // تم التصحيح هنا
          status: 'pending',
          rejectionReason: null,
          //notes: orderNotes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (orderError) {
        throw new Error(`فشل إنشاء الطلب: ${orderError.message}`);
      }

      // 4. إضافة المنتجات للطلب
      const orderItems = cart.map(item => ({
        orderId: newOrder.id,
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.newPrice,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('OrderItems').insert(orderItems);
      
      if (itemsError) {
         // ملاحظة: الطلب أنشئ لكن المنتجات فشلت، هذا نادر الحدوث لكن يجب تسجيله
         console.error('Error inserting items:', itemsError);
         throw new Error('فشل تسجيل تفاصيل المنتجات');
      }

      // 5. تتبع البيكسل والنجاح
      if (typeof window !== 'undefined' && window.fbq) {
        ReactPixel.track('Purchase', {
          currency: "DZD",
          value: finalTotal,
          content_type: 'product',
          num_items: cart.length
        });
      }

      toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');

      // تصفير النموذج
      setCustomerName('');
      setPhone('');
      setAddress('');
      setOrderNotes('');
      onClearCart(); // هذا سيغلق النافذة أيضاً لأنها تعتمد على السلة

    } catch (err: any) {
      console.error('Critical Error in Order:', err);
      toast.error(err.message || 'حدث خطأ غير متوقع أثناء الطلب');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
         <ShoppingBag size={48} className="mb-4 opacity-20" />
         <p>سلتك فارغة حالياً</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white md:rounded-xl overflow-hidden font-sans">
      
      {/* 1. الهيدر الجذاب */}
     

      {/* محتوى قابل للتمرير */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
         
         {/* 2. قائمة المنتجات (Cards) */}
         <div className="space-y-3">
            {cart.map(item => (
               <div key={item.product.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 transition-all hover:shadow-md hover:border-orange-100">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 shadow-sm shrink-0 border border-gray-100">
                     <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                     <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2 ml-2">{item.product.name}</h4>
                       
                        <button 
                          onClick={() => onRemoveFromCart(item.product.id)} 
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={16}/>
                        </button>
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 h-6 shadow-sm">
                           <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-full hover:bg-orange-50 text-orange-600 font-bold border-l border-gray-100 transition-colors">+</button>
                           <span className="w-8 text-center text-sm font-medium text-gray-700">{item.quantity}</span>
                           <button onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))} className="w-8 h-full hover:bg-red-50 text-red-500 font-bold border-r border-gray-100 transition-colors">-</button>
                        </div>
                        <span className="font-bold text-orange-600 text-sm">
                           {(item.product.newPrice * item.quantity).toLocaleString()} دج
                        </span>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* 3. الفاتورة المفصلة (Receipt Style) */}
         <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-orange-200 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-50"></div>
            <div className="flex justify-between text-sm text-gray-600">
               <span>المجموع الفرعي</span>
               <span className="font-medium">{productsTotal.toLocaleString()} دج</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
               <span className="flex items-center gap-1"><Truck size={14} className="text-orange-500"/> تكلفة التوصيل</span>
               <span className="font-medium">{DELIVERY_PRICE} دج</span>
            </div>
            <div className="h-px bg-gray-200 my-2 w-full group-hover:bg-orange-100 transition-colors"></div>
            <div className="flex justify-between items-center">
               <span className="font-bold text-gray-800 text-lg">الإجمالي للدفع</span>
               <span className="text-2xl font-black text-green-600 drop-shadow-sm">{finalTotal.toLocaleString()} <small className="text-gray-500 font-normal text-sm">دج</small></span>
            </div>
         </div>

         {/* 4. نموذج المعلومات (Modern Inputs) */}
         <form onSubmit={handleSubmit} className="space-y-0 pt-0">
            
                        {/* بداية التعديل: شبكة لجمع الهاتف والاسم */}
            <div className="grid grid-cols-2 gap-2">
               
           

               {/* الاسم */}
               <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-gray-500">الاسم *</Label>
                  <div className="relative">
                     <User className="absolute right-2 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                     <Input 
                        value={customerName} onChange={(e) => setCustomerName(e.target.value)} 
                        placeholder="الاسم" 
                        className="pr-8 h-9 text-sm bg-gray-50 border-gray-200 rounded-lg" // لاحظ h-9
                     />
                  </div>
               </div>
    {/* الهاتف */}
               <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-gray-500">رقم الهاتف *</Label>
                  <div className="relative">
                     <Phone className="absolute right-2 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                     <Input 
                        type="tel" dir="rtl" 
                        value={phone} onChange={(e) => setPhone(e.target.value)} 
                        placeholder="05 XX XX XX XX" 
                        className="pr-8 h-9 text-sm bg-gray-50 border-gray-200 rounded-lg" // لاحظ h-9
                     />
                  </div>
               </div>
            </div>

            
            {/* نهاية التعديل */}


            {/* العنوان */}
            <div className="space-y-1.5">
               <Label className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                 <MapPin size={12}/> العنوان (الولاية والبلدية) <span className="text-red-500">*</span>
               </Label>
               <div className="relative group">
                  <div className="absolute right-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none group-focus-within:text-orange-500 transition-colors">
                    <MapPin size={20}/>
                  </div>
                  <Textarea 
                     value={address} onChange={(e) => setAddress(e.target.value)} 
                     placeholder="مثال: الجزائر العاصمة، بئر مراد رايس" 
                     className="pr-10 min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl transition-all resize-none py-3 placeholder:text-gray-400"
                  />
               </div>
            </div>

            {/* ملاحظات قابلة للطي */}
            <div className="pt-2">
               <button type="button" onClick={() => setShowNotes(!showNotes)} className="flex items-center gap-1 text-xs text-orange-600 font-bold hover:underline transition-all mb-2">
                  {showNotes ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  {showNotes ? 'إخفاء الملاحظات' : 'هل لديك ملاحظة إضافية؟ (اختياري)'}
               </button>
               {showNotes && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <Textarea 
                       value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} 
                       placeholder="لون، مقاس، توقيت توصيل مفضل..." 
                       className="bg-yellow-50/50 border-yellow-200 text-sm min-h-[60px] focus:border-yellow-400 focus:ring-yellow-100 placeholder:text-yellow-600/50"
                    />
                  </div>
               )}
            </div>

            {/* زر الإرسال العملاق */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-xl shadow-lg shadow-green-600/20 font-bold text-xl flex items-center justify-center gap-2 mt-4 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
               <span>تأكيد الطلب الآن</span>
               <Calculator className="animate-pulse" size={24} />
            </Button>
            
            <div className="flex items-center justify-center gap-2 opacity-50 mt-2">
              <Truck size={12} />
              <p className="text-center text-[10px]">الدفع عند الاستلام - توصيل سريع ومضمون</p>
            </div>
         </form>
      </div>
    </div>
  );
}
