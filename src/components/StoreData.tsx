import React from 'react';
import { Store, MapPin, Phone, Share2, Globe, Mail, Edit3, ArrowLeft } from 'lucide-react';


export default function StoreData() {
 
  const storeInfo = {
    name: 'IBRO Kitchen',
    description: 'المتجر الأول في الجزائر لبيع مستلزمات المطبخ العصرية والأجهزة الكهرومنزلية.',
    phone: '0555 12 34 56',
    email: 'contact@ibro-kitchen.dz',
    address: 'حي 5 جويلية، باب الزوار، الجزائر العاصمة',
    facebook: 'ibrokitchen',
    instagram: 'ibro_dz',
  };



  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans" dir="rtl">
      
   
      <div className="bg-gradient-to-l from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
       
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="relative z-10 text-center md:text-right">
           <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-orange-300 mb-3 border border-white/10">
              <Store size={14} />
              <span>ملف المتجر</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">{storeInfo.name}</h1>
           <p className="text-gray-300 max-w-lg text-sm md:text-base leading-relaxed opacity-90">
             {storeInfo.description}
           </p>
        </div>

        <button 
          onClick={() => {
          
             console.log("توجيه لصفحة التعديل...");
          }}
          className="relative z-10 group bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-3 hover:bg-orange-50 transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95"
        >
          <Edit3 size={18} className="text-orange-600" />
          <span>تعديل البيانات</span>
          <ArrowLeft size={16} className="text-gray-400 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

       
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Phone size={24} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-4">معلومات الاتصال</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm"><Phone size={14} /></div>
               <span className="text-sm font-bold text-gray-700" dir="ltr">{storeInfo.phone}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm"><Mail size={14} /></div>
               <span className="text-sm font-bold text-gray-700 font-mono">{storeInfo.email}</span>
            </div>
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapPin size={24} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-4">العنوان والموقع</h3>
          <div className="bg-gray-50 p-4 rounded-xl h-[120px] flex flex-col justify-center">
             <p className="text-gray-600 text-sm leading-relaxed font-medium">
               {storeInfo.address}
             </p>
             <div className="mt-3 flex gap-2">
                <span className="text-[10px] bg-white border px-2 py-1 rounded-md text-gray-500">الجزائر</span>
                <span className="text-[10px] bg-white border px-2 py-1 rounded-md text-gray-500">باب الزوار</span>
             </div>
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Share2 size={24} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-4">التواصل الاجتماعي</h3>
          <div className="space-y-3">
            <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group/link">
               <div className="flex items-center gap-3">
                  <Globe size={18} className="text-blue-600" />
                  <span className="text-sm font-bold text-gray-700">Facebook</span>
               </div>
               <span className="text-xs text-gray-400 group-hover/link:text-orange-500 transition-colors">@{storeInfo.facebook}</span>
            </a>
            <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group/link">
               <div className="flex items-center gap-3">
                  <Globe size={18} className="text-pink-600" />
                  <span className="text-sm font-bold text-gray-700">Instagram</span>
               </div>
               <span className="text-xs text-gray-400 group-hover/link:text-orange-500 transition-colors">@{storeInfo.instagram}</span>
            </a>
          </div>
        </div>

      </div>

      
      <div className="mt-10 text-center">
         <p className="text-xs text-gray-400">
            هذه البيانات تظهر للزبائن في أسفل المتجر وفي الفواتير الرسمية.
         </p>
      </div>

    </div>
  );
}
