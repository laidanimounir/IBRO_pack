import React, { useState } from 'react';
import { Save, Truck, Search, RefreshCw, Info, Package, DollarSign } from 'lucide-react';

const ALGERIA_WILAYAS = [
  { id: 1, name: 'أدرار', price: 900, active: true },
  { id: 2, name: 'الشلف', price: 600, active: true },
  { id: 3, name: 'الأغواط', price: 700, active: true },
  { id: 4, name: 'أم البواقي', price: 600, active: true },
  { id: 5, name: 'باتنة', price: 600, active: true },
  { id: 6, name: 'بجاية', price: 600, active: true },
  { id: 7, name: 'بسكرة', price: 700, active: true },
  { id: 8, name: 'بشار', price: 900, active: true },
  { id: 9, name: 'البليدة', price: 400, active: true },
  { id: 10, name: 'البويرة', price: 500, active: true },
  { id: 11, name: 'تمنراست', price: 1200, active: true },
  { id: 12, name: 'تبسة', price: 700, active: true },
  { id: 13, name: 'تلمسان', price: 700, active: true },
  { id: 14, name: 'تيارت', price: 600, active: true },
  { id: 15, name: 'تيزي وزو', price: 500, active: true },
  { id: 16, name: 'الجزائر', price: 400, active: true },
  { id: 17, name: 'الجلفة', price: 700, active: true },
  { id: 18, name: 'جيجل', price: 600, active: true },
  { id: 19, name: 'سطيف', price: 600, active: true },
  { id: 20, name: 'سعيدة', price: 700, active: true },
  { id: 21, name: 'سكيكدة', price: 600, active: true },
  { id: 22, name: 'سيدي بلعباس', price: 600, active: true },
  { id: 23, name: 'عنابة', price: 600, active: true },
  { id: 24, name: 'قالمة', price: 600, active: true },
  { id: 25, name: 'قسنطينة', price: 600, active: true },
  { id: 26, name: 'المدية', price: 500, active: true },
  { id: 27, name: 'مستغانم', price: 600, active: true },
  { id: 28, name: 'المسيلة', price: 600, active: true },
  { id: 29, name: 'معسكر', price: 600, active: true },
  { id: 30, name: 'ورقلة', price: 800, active: true },
  { id: 31, name: 'وهران', price: 600, active: true },
  { id: 32, name: 'البيض', price: 800, active: true },
  { id: 33, name: 'إليزي', price: 1200, active: true },
  { id: 34, name: 'برج بوعريريج', price: 600, active: true },
  { id: 35, name: 'بومرداس', price: 400, active: true },
  { id: 36, name: 'الطارف', price: 700, active: true },
  { id: 37, name: 'تندوف', price: 1200, active: true },
  { id: 38, name: 'تيسمسيلت', price: 600, active: true },
  { id: 39, name: 'الوادي', price: 800, active: true },
  { id: 40, name: 'خنشلة', price: 700, active: true },
  { id: 41, name: 'سوق أهراس', price: 700, active: true },
  { id: 42, name: 'تيبازة', price: 400, active: true },
  { id: 43, name: 'ميلة', price: 600, active: true },
  { id: 44, name: 'عين الدفلى', price: 500, active: true },
  { id: 45, name: 'النعامة', price: 800, active: true },
  { id: 46, name: 'عين تموشنت', price: 600, active: true },
  { id: 47, name: 'غرداية', price: 800, active: true },
  { id: 48, name: 'غليزان', price: 600, active: true },
  { id: 49, name: 'تيميمون', price: 900, active: true },
  { id: 50, name: 'برج باجي مختار', price: 1200, active: true },
  { id: 51, name: 'أولاد جلال', price: 700, active: true },
  { id: 52, name: 'بني عباس', price: 900, active: true },
  { id: 53, name: 'إن صالح', price: 1000, active: true },
  { id: 54, name: 'إن قزام', price: 1200, active: true },
  { id: 55, name: 'تقرت', price: 800, active: true },
  { id: 56, name: 'جانت', price: 1200, active: true },
  { id: 57, name: 'المغير', price: 800, active: true },
  { id: 58, name: 'المنيعة', price: 800, active: true },
];



const SAMPLE_PRODUCTS = [
  { id: 1, name: 'عجانة احترافية 5 لتر', shippingType: 'default', customPrice: 0 },
  { id: 2, name: 'خلاط كهربائي يدوي', shippingType: 'free', customPrice: 0 },
  { id: 3, name: 'طقم أواني جرانيت', shippingType: 'fixed', customPrice: 800 },
];

export default function ShippingOptions() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'products'>('general'); // تبويب للتبديل
  const [searchQuery, setSearchQuery] = useState('');
  
 
  const [shippingConfig, setShippingConfig] = useState({ globalRate: 600, freeShippingEnabled: true, freeShippingThreshold: 20000 });
  const [wilayas, setWilayas] = useState(ALGERIA_WILAYAS);
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);

  
  const handleWilayaChange = (id: number, field: 'price' | 'active', value: any) => {
    setWilayas(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleProductShippingChange = (id: number, type: string, price: number = 0) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, shippingType: type, customPrice: price } : p));
  };

  const applyGlobalRate = () => {
    if(window.confirm(`هل أنت متأكد من تعميم السعر ${shippingConfig.globalRate} دج؟`)) {
       setWilayas(prev => prev.map(w => ({ ...w, price: shippingConfig.globalRate })));
    }
  };

  const filteredWilayas = wilayas.filter(w => w.name.includes(searchQuery) || w.id.toString().includes(searchQuery));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans text-right" dir="rtl">
      
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Truck className="text-orange-500" /> خيارات الشحن
          </h1>
          <p className="text-sm text-gray-500 mt-1">إدارة أسعار الولايات وتخصيص الشحن لكل منتج.</p>
        </div>
        <button 
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}
          className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Save size={18} /> {loading ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      
      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-1">
        <button 
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'general' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          أسعار الولايات (الأساسي)
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          تخصيص لكل منتج
        </button>
      </div>

     
      {activeTab === 'general' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <RefreshCw size={18} className="text-blue-500" /> تحديث جماعي
                </h3>
                <div className="flex gap-2">
                   <input type="number" value={shippingConfig.globalRate} onChange={(e) => setShippingConfig({...shippingConfig, globalRate: Number(e.target.value)})} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none" />
                   <button onClick={applyGlobalRate} className="bg-blue-50 text-blue-600 px-4 rounded-xl font-bold text-sm">تطبيق</button>
                </div>
             </div>
             
          </div>
          <div className="lg:col-span-8">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[600px] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                   <Search className="text-gray-400" size={20} />
                   <input type="text" placeholder="ابحث عن ولاية..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold" />
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                   <table className="w-full text-right">
                      <thead className="bg-gray-50 sticky top-0 text-xs font-bold text-gray-500">
                         <tr><th className="px-6 py-3">الرقم</th><th className="px-6 py-3">الولاية</th><th className="px-6 py-3">الحالة</th><th className="px-6 py-3">السعر</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {filteredWilayas.map(w => (
                            <tr key={w.id} className="hover:bg-orange-50/30">
                               <td className="px-6 py-3 text-gray-400 font-mono">{w.id}</td>
                               <td className="px-6 py-3 font-bold">{w.name}</td>
                               <td className="px-6 py-3"><input type="checkbox" checked={w.active} onChange={() => handleWilayaChange(w.id, 'active', !w.active)} className="accent-green-500 w-4 h-4" /></td>
                               <td className="px-6 py-3"><input type="number" value={w.price} onChange={(e) => handleWilayaChange(w.id, 'price', Number(e.target.value))} className="w-24 bg-gray-50 border rounded p-1 font-bold text-sm" /></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      ) : (
       
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
           <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
                 <tr>
                    <th className="px-6 py-4">اسم المنتج</th>
                    <th className="px-6 py-4">نوع الشحن</th>
                    <th className="px-6 py-4 w-48">السعر المخصص (دج)</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {products.map((product) => (
                    <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                <Package size={20} />
                             </div>
                             <span className="font-bold text-gray-800">{product.name}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex gap-2">
                             <button 
                                onClick={() => handleProductShippingChange(product.id, 'default')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${product.shippingType === 'default' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                             >
                                حسب الولاية
                             </button>
                             <button 
                                onClick={() => handleProductShippingChange(product.id, 'free')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${product.shippingType === 'free' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                             >
                                مجاني
                             </button>
                             <button 
                                onClick={() => handleProductShippingChange(product.id, 'fixed')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${product.shippingType === 'fixed' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                             >
                                ثابت
                             </button>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          {product.shippingType === 'fixed' ? (
                             <div className="relative">
                                <input 
                                  type="number" 
                                  value={product.customPrice}
                                  onChange={(e) => handleProductShippingChange(product.id, 'fixed', Number(e.target.value))}
                                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:border-orange-500 outline-none"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">دج</span>
                             </div>
                          ) : (
                             <span className="text-xs text-gray-400 font-medium">
                                {product.shippingType === 'free' ? 'مجاني (0 دج)' : 'حسب جدول الولايات'}
                             </span>
                          )}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

    </div>
  );
}
