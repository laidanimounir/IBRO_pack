import React, { useState, useEffect } from 'react';
import { Save, Truck, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Wilaya {
  id: number;
  name: string;
  price: number;
  active: boolean;
}

export default function ShippingOptions() {
  const [loading, setLoading] = useState(false);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalRate, setGlobalRate] = useState(600);

 
  useEffect(() => {
    loadWilayas();
  }, []);

  const loadWilayas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Wilayas')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      toast.error('فشل تحميل الولايات');
      console.error(error);
    } else {
      setWilayas(data || []);
    }
    setLoading(false);
  };


  const handleSaveChanges = async () => {
    setLoading(true);
    
    try {
     
      const updates = wilayas.map(w => 
        supabase
          .from('Wilayas')
          .update({ price: w.price, active: w.active, updated_at: new Date().toISOString() })
          .eq('id', w.id)
      );

      await Promise.all(updates);
      toast.success('تم حفظ التغييرات بنجاح');
      await loadWilayas();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
      console.error(error);
    }
    
    setLoading(false);
  };

  const handleWilayaChange = (id: number, field: 'price' | 'active', value: any) => {
    setWilayas(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const applyGlobalRate = () => {
    if (window.confirm(`هل أنت متأكد من تعميم السعر ${globalRate} دج على جميع الولايات؟`)) {
      setWilayas(prev => prev.map(w => ({ ...w, price: globalRate })));
      toast.info('تم التطبيق محلياً. اضغط "حفظ التغييرات" لحفظها في قاعدة البيانات.');
    }
  };

  const filteredWilayas = wilayas.filter(w => 
    w.name.includes(searchQuery) || w.id.toString().includes(searchQuery)
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans text-right" dir="rtl">
      
     
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Truck className="text-orange-500" /> خيارات الشحن
          </h1>
          <p className="text-sm text-gray-500 mt-1">إدارة أسعار الولايات - التغييرات تُحفظ في قاعدة البيانات</p>
        </div>
        <button 
          onClick={handleSaveChanges}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Save size={18} /> {loading ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCw size={18} className="text-blue-500" /> تحديث جماعي
            </h3>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={globalRate} 
                onChange={(e) => setGlobalRate(Number(e.target.value))} 
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-orange-500" 
              />
              <button 
                onClick={applyGlobalRate} 
                className="bg-blue-50 text-blue-600 px-4 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
              >
                تطبيق
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              لا تنسى الضغط على "حفظ التغييرات" بعد التطبيق
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-medium">
               <strong>ملاحظة:</strong> التغييرات هنا تؤثر مباشرة على أسعار التوصيل في نموذج الطلب.
            </p>
          </div>
        </div>

       
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <Search className="text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="ابحث عن ولاية..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="flex-1 bg-transparent outline-none text-sm font-bold" 
              />
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <table className="w-full text-right">
                  <thead className="bg-gray-50 sticky top-0 text-xs font-bold text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">الرقم</th>
                      <th className="px-6 py-3">الولاية</th>
                      <th className="px-6 py-3">الحالة</th>
                      <th className="px-6 py-3">السعر (دج)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredWilayas.map(w => (
                      <tr key={w.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-6 py-3 text-gray-400 font-mono text-sm">{w.id}</td>
                        <td className="px-6 py-3 font-bold text-gray-900">{w.name}</td>
                        <td className="px-6 py-3">
                          <input 
                            type="checkbox" 
                            checked={w.active} 
                            onChange={() => handleWilayaChange(w.id, 'active', !w.active)} 
                            className="accent-green-500 w-4 h-4 cursor-pointer" 
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input 
                            type="number" 
                            value={w.price} 
                            onChange={(e) => handleWilayaChange(w.id, 'price', Number(e.target.value))} 
                            className="w-28 bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold text-sm focus:border-orange-500 outline-none" 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
