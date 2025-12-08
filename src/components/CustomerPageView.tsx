import React from 'react';
import { ShoppingBag, Search } from 'lucide-react';


type SettingsProps = {
 
  storeName: string;
  storeNameColor1: string; 
  storeNameColor2: string; 
  logoUrl: string; 
  primaryColor: string; 

  
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroImageUrl: string; 
  
  
  showDiscount: boolean;
  discountText: string;

 
  featuredTitle: string;
  allProductsTitle: string;

  
  footerDescription: string;
  phone: string;
  email: string;
  address: string;
};

export default function CustomerPageView({ settings }: { settings: SettingsProps }) {
  
 
  const primaryColor = settings.primaryColor || '#f97316';
 
  const heroImage = settings.heroImageUrl && settings.heroImageUrl.length > 0 
    ? settings.heroImageUrl 
    : '/assets/ibro.png'; 


  const storeNameParts = settings.storeName ? settings.storeName.split(' ') : ['IBRO', 'Kitchen'];
  const firstNamePart = storeNameParts[0];
  const restNamePart = storeNameParts.slice(1).join(' ');

  return (
    <div className="min-h-full bg-[#f8f5f2] font-sans pb-10 text-right" dir="rtl">
      
      
      <header className="absolute w-full top-0 z-30 p-4 md:p-8 flex items-center justify-between bg-transparent pt-8 md:pt-8"> 
         <div className="flex items-center gap-3">
           
            <div className="bg-white/40 backdrop-blur-md p-2 rounded-full shadow-sm w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden border border-white/50">
               {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                  <span className="text-xs font-bold text-gray-800">Logo</span>
               )}
            </div>
            
            
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight drop-shadow-sm">
               <span style={{ color: settings.storeNameColor1 || '#1f2937' }}>
                  {firstNamePart}
               </span>
               {restNamePart && (
                  <span style={{ color: settings.storeNameColor2 || primaryColor }}>
                     {` ${restNamePart}`}
                  </span>
               )}
            </h1>
         </div>

        
         <div className="flex gap-3">
            <button className="bg-white/40 backdrop-blur-md p-2.5 rounded-full text-gray-800 hover:bg-white/60 transition shadow-sm border border-white/30">
               <Search size={20} />
            </button>
            <button className="bg-white/40 backdrop-blur-md p-2.5 rounded-full text-gray-800 hover:bg-white/60 relative transition shadow-sm border border-white/30">
               <ShoppingBag size={20} />
               <span 
                 style={{ backgroundColor: primaryColor }} 
                 className="absolute -top-1 -right-1 text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-bold shadow-sm"
               >
                 0
               </span>
            </button>
         </div>
      </header>

      
      <div className="relative h-[450px] md:h-[550px] overflow-hidden group">
        
         <img 
            src={heroImage} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            alt="Hero Background"
            onError={(e) => {
              
              e.currentTarget.style.display = 'none'; 
              e.currentTarget.parentElement!.style.backgroundColor = '#e5e7eb';
            }}
         />
         
         
         <div className="absolute inset-0 bg-black/10"></div>

         
         <div className="absolute inset-0 flex justify-end pointer-events-none">
            <div className="w-full h-full relative">
               <div 
                  className="absolute inset-0 shadow-2xl opacity-95"
                  style={{ 
                     background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}ee)`,
                     clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 85%)' 
                  }}
               ></div>
               
               
               <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8 pt-24 md:pt-20 text-white max-w-2xl mx-auto pointer-events-auto">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 drop-shadow-lg">
                     {settings.heroTitle}
                  </h2>
                  <p className="text-sm md:text-lg text-white/95 max-w-md leading-relaxed mb-10 font-medium drop-shadow-md">
                     {settings.heroSubtitle}
                  </p>
                  <button className="bg-white text-gray-900 text-sm md:text-base font-bold px-8 py-3.5 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2">
                     {settings.heroButtonText}
                  </button>
               </div>
            </div>
         </div>
      </div>

      
      {settings.showDiscount && (
         <div className="relative -mt-12 px-8 md:px-20 mb-16 flex justify-start z-20 pointer-events-none">
            <div className="bg-white w-28 h-28 md:w-36 md:h-36 rounded-full border-[5px] shadow-2xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 pointer-events-auto" style={{ borderColor: primaryColor }}>
               <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wide">خصم حتى</span>
               <span className="text-4xl md:text-5xl font-black leading-none my-1" style={{ color: primaryColor }}>{settings.discountText}</span>
               <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">على منتجات مختارة</span>
            </div>
         </div>
      )}

      
      <div className="px-4 md:px-16 space-y-16 pb-20 max-w-7xl mx-auto">
         
         
         <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 overflow-hidden relative">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[4rem] -z-10"></div>

            <div className="flex items-center gap-3 mb-8">
               <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
               <h3 className="font-extrabold text-gray-900 text-2xl">{settings.featuredTitle}</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
               <div className="w-full md:w-40 h-40 bg-white rounded-2xl shrink-0 shadow-sm flex items-center justify-center overflow-hidden p-4">
                  
                  <ShoppingBag className="text-gray-200 w-16 h-16" />
               </div>
               <div className="flex-1 w-full text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                     <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">عرض خاص</span>
                     <span className="text-xs text-gray-400 font-medium">الأكثر طلباً</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg md:text-xl mb-2 group-hover:text-[var(--primary)] transition-colors" style={{ '--primary': primaryColor } as any}>
                     عجانة احترافية متعددة الاستخدامات 5 لتر
                  </h4>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-lg">
                     محرك قوي 1200 واط، وعاء ستانلس ستيل، 3 ملحقات للعجن والخفق، ضمان شامل لمدة عامين مع توصيل مجاني.
                  </p>
                  <div className="flex items-center justify-between md:justify-start md:gap-8 bg-white p-3 md:p-0 md:bg-transparent rounded-xl">
                     <div>
                        <span className="text-xs text-gray-400 line-through block text-right">32,000 دج</span>
                        <span className="font-black text-xl md:text-2xl" style={{ color: primaryColor }}>25,000 دج</span>
                     </div>
                     <button className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
                        <ShoppingBag size={16} /> إضافة للسلة
                     </button>
                  </div>
               </div>
            </div>
         </div>

         
         <div>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 rounded-full bg-gray-900"></div>
                  <h3 className="font-extrabold text-gray-900 text-2xl">{settings.allProductsTitle}</h3>
               </div>
               <button className="text-sm font-bold text-gray-500 hover:text-gray-900">عرض الكل</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-3 md:p-4 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                     <div className="bg-gray-100 aspect-square rounded-2xl mb-4 w-full relative overflow-hidden flex items-center justify-center">
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-red-500 text-[10px] md:text-xs px-2 py-1 rounded-full font-bold shadow-sm z-10">-20%</span>
                        <ShoppingBag className="text-gray-300 w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1 leading-tight group-hover:text-[var(--primary)] transition-colors" style={{ '--primary': primaryColor } as any}>
                        خلاط كهربائي يدوي
                     </h4>
                     <p className="text-[10px] text-gray-400 mb-3">أجهزة كهربائية</p>
                     <div className="flex items-end justify-between">
                        <div>
                           <span className="text-[10px] text-gray-400 line-through block">5,500 دج</span>
                           <span className="text-sm md:text-lg font-bold text-gray-900">4,500 دج</span>
                        </div>
                        <button 
                           className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90" 
                           style={{ color: primaryColor }}
                        >
                           <span className="text-xl leading-none mb-1">+</span>
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      
      <footer className="bg-white pt-16 pb-10 px-6 md:px-16 border-t border-gray-200">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
            
            
            <div className="text-center md:text-right md:w-1/3">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                     <span className="font-bold text-xs">L</span>
                  </div>
                  <h4 className="text-2xl font-black text-gray-900">{settings.storeName}</h4>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {settings.footerDescription}
               </p>
            </div>

            
            <div className="text-center md:text-right">
               <h5 className="font-bold text-gray-900 mb-4">روابط سريعة</h5>
               <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li><a href="#" className="hover:text-gray-900">الرئيسية</a></li>
                  <li><a href="#" className="hover:text-gray-900">المنتجات</a></li>
                  <li><a href="#" className="hover:text-gray-900">اتصل بنا</a></li>
               </ul>
            </div>

            
            <div className="text-center md:text-right md:w-1/4">
               <h5 className="font-bold text-gray-900 mb-4">تواصل معنا</h5>
               <div className="space-y-3 text-sm text-gray-600 font-medium bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="flex items-center justify-center md:justify-start gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span>
                     {settings.phone}
                  </p>
                  <p className="flex items-center justify-center md:justify-start gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                     {settings.email}
                  </p>
                  <p className="flex items-center justify-center md:justify-start gap-2">
                     <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                     {settings.address}
                  </p>
               </div>
            </div>
         </div>

         
         <div className="mt-16 pt-8 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-medium">
               © 2025 جميع الحقوق محفوظة لـ {settings.storeName}
            </p>
         </div>
      </footer>

    </div>
  );
}
