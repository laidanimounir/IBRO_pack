import React, { useState, useRef } from 'react';
import { Save, Smartphone, Monitor, LayoutTemplate, Type, Image as ImageIcon, Link as LinkIcon, Settings, Upload } from 'lucide-react';
import CustomerPageView from './CustomerPageView';

export default function StorefrontSettings() {
  const [activeTab, setActiveTab] = useState('general'); 
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    storeName: 'IBRO Kitchen',
    storeNameColor1: '#1f2937', 
    storeNameColor2: '#f97316', 
    logoUrl: '/assets/logo-ibro-kitchen.png', 
    heroTitle: 'كل ما يحتاجه مطبخك في متجر IBRO Kitchen',
    heroSubtitle: 'أجهزة مطبخ كهربائية وأدوات طهي مختارة بعناية، مع جودة عالية وتجربة شراء سهلة.',
    heroButtonText: 'تسوق الآن',
    heroImageUrl: '/assets/ibro.png', 
    primaryColor: '#f97316',
    showDiscount: true,
    discountText: '70%',
    featuredTitle: 'الأكثر مبيعاً',
    allProductsTitle: 'كل المنتجات',
    footerDescription: 'وجهتكم الأولى لأدوات المطبخ العصرية في الجزائر.',
    phone: '0555 00 00 00',
    email: 'contact@ibro-kitchen.dz',
    address: 'الجزائر العاصمة، الجزائر',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'heroImageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSettings(prev => ({ ...prev, [field]: imageUrl }));
    }
  };

  const inputStyle = "w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-sm";
  const labelStyle = "block text-xs font-bold text-gray-500 mb-1.5";

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] overflow-hidden bg-gray-50" dir="rtl">
      
      {/* 1. لوحة التحكم (يمين) */}
      <div className="w-full lg:w-[400px] xl:w-[450px] bg-white border-l shadow-xl z-20 flex flex-col h-full shrink-0">
         <div className="p-6 border-b bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h2 className="text-xl font-extrabold text-gray-900">تخصيص المتجر</h2>
                  <p className="text-xs text-gray-500 mt-1">عدّل الهوية والمظهر</p>
               </div>
               <button className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg flex gap-2 items-center text-xs font-bold transition-transform active:scale-95 shadow-lg">
                  <Save size={14} /> حفظ
               </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
               {[
                 { id: 'general', label: 'عام', icon: Settings },
                 { id: 'hero', label: 'الواجهة', icon: LayoutTemplate },
                 { id: 'sections', label: 'الأقسام', icon: Type },
                 { id: 'footer', label: 'التذييل', icon: LinkIcon },
               ].map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTab === tab.id ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                   <tab.icon size={14} /> {tab.label}
                 </button>
               ))}
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
            {activeTab === 'general' && (
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className={labelStyle}>شعار المتجر (Logo)</label>
                     <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative group bg-white">
                        {settings.logoUrl ? (
                           <div className="relative h-24 w-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                              <img src={settings.logoUrl} alt="Logo" className="h-full object-contain" />
                              <button onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"><Upload size={20} className="mb-1" /> تغيير الشعار</button>
                           </div>
                        ) : (
                           <div onClick={() => logoInputRef.current?.click()} className="cursor-pointer py-4 text-gray-400 flex flex-col items-center"><ImageIcon size={24} className="mb-2" /><span className="text-xs">اضغط لرفع الشعار</span></div>
                        )}
                        <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logoUrl')} className="hidden" accept="image/*" />
                     </div>
                  </div>
                  <div><label className={labelStyle}>اسم المتجر</label><input type="text" value={settings.storeName} onChange={(e) => setSettings({...settings, storeName: e.target.value})} className={inputStyle} /></div>
                  <div>
                     <label className={labelStyle}>ألوان الاسم</label>
                     <div className="flex gap-4">
                        <div className="flex-1 flex items-center gap-2 border p-2 rounded-xl bg-gray-50"><input type="color" value={settings.storeNameColor1} onChange={(e) => setSettings({...settings, storeNameColor1: e.target.value})} className="h-8 w-8 cursor-pointer rounded border-0 p-0" /><span className="text-xs font-mono text-gray-500">اللون 1</span></div>
                        <div className="flex-1 flex items-center gap-2 border p-2 rounded-xl bg-gray-50"><input type="color" value={settings.storeNameColor2} onChange={(e) => setSettings({...settings, storeNameColor2: e.target.value})} className="h-8 w-8 cursor-pointer rounded border-0 p-0" /><span className="text-xs font-mono text-gray-500">اللون 2</span></div>
                     </div>
                  </div>
                  <div>
                     <label className={labelStyle}>اللون الرئيسي للمتجر</label>
                     <div className="flex gap-3 flex-wrap">
                        {['#f97316', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#000000'].map(color => (
                           <button key={color} onClick={() => setSettings({...settings, primaryColor: color})} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.primaryColor === color ? 'border-gray-900 scale-110' : 'border-white shadow'}`} style={{ backgroundColor: color }} />
                        ))}
                        <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer" />
                     </div>
                  </div>
               </div>
            )}
            {activeTab === 'hero' && (
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className={labelStyle}>صورة الخلفية الكبيرة</label>
                     <div className="border-2 border-dashed border-gray-200 rounded-xl p-2 text-center hover:bg-gray-50 transition-colors relative group bg-white">
                        <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                           <img src={settings.heroImageUrl} alt="Hero" className="h-full w-full object-cover" />
                           <button onClick={() => heroInputRef.current?.click()} className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"><Upload size={24} className="mb-2" /> تغيير الصورة</button>
                        </div>
                        <input type="file" ref={heroInputRef} onChange={(e) => handleImageUpload(e, 'heroImageUrl')} className="hidden" accept="image/*" />
                     </div>
                  </div>
                  <div><label className={labelStyle}>العنوان الرئيسي</label><input type="text" value={settings.heroTitle} onChange={(e) => setSettings({...settings, heroTitle: e.target.value})} className={inputStyle} /></div>
                  <div><label className={labelStyle}>النص الوصفي</label><textarea value={settings.heroSubtitle} onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})} className={`${inputStyle} h-24 resize-none`} /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className={labelStyle}>نص الزر</label><input type="text" value={settings.heroButtonText} onChange={(e) => setSettings({...settings, heroButtonText: e.target.value})} className={inputStyle} /></div>
                     <div><label className={labelStyle}>نص الخصم</label><input type="text" value={settings.discountText} onChange={(e) => setSettings({...settings, discountText: e.target.value})} className={inputStyle} /></div>
                  </div>
               </div>
            )}
            {activeTab === 'sections' && (
               <div className="space-y-6">
                  <div><label className={labelStyle}>عنوان القسم الأول</label><input type="text" value={settings.featuredTitle} onChange={(e) => setSettings({...settings, featuredTitle: e.target.value})} className={inputStyle} /></div>
                  <div><label className={labelStyle}>عنوان القسم الثاني</label><input type="text" value={settings.allProductsTitle} onChange={(e) => setSettings({...settings, allProductsTitle: e.target.value})} className={inputStyle} /></div>
               </div>
            )}
            {activeTab === 'footer' && (
               <div className="space-y-6">
                  <div><label className={labelStyle}>وصف المتجر في الأسفل</label><textarea value={settings.footerDescription} onChange={(e) => setSettings({...settings, footerDescription: e.target.value})} className={`${inputStyle} h-24 resize-none`} /></div>
                  <div><label className={labelStyle}>رقم الهاتف</label><input type="text" value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} className={inputStyle} /></div>
                  <div><label className={labelStyle}>البريد الإلكتروني</label><input type="text" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} className={inputStyle} /></div>
                  <div><label className={labelStyle}>العنوان</label><input type="text" value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} className={inputStyle} /></div>
               </div>
            )}
         </div>
      </div>

      {/* 2. المعاينة الحية (يسار) - التحسين النهائي */}
      <div className="hidden lg:flex flex-1 bg-[#f0f2f5] flex-col relative overflow-hidden">
         {/* Toolbar */}
         <div className="h-14 bg-white border-b px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</span>
            <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
               <button onClick={() => setViewMode('mobile')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Smartphone size={14} /> هاتف</button>
               <button onClick={() => setViewMode('desktop')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Monitor size={14} /> حاسوب</button>
            </div>
            <div className="w-20"></div>
         </div>

         {/* Canvas Area */}
         <div className="flex-1 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex items-center justify-center overflow-hidden relative">
            
            {/* 
                حاوية الموبايل:
                استخدام transform: scale(0.65) لتصغير الهاتف بشكل كبير ليناسب أي شاشة لابتوب صغيرة.
                الأبعاد الأصلية للهاتف محفوظة (390x844).
            */}
            <div 
               className={`transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden flex flex-col relative origin-center`}
               style={viewMode === 'mobile' ? { 
                  width: '390px',   
                  height: '844px',
                  minWidth: '390px', // منع الانكماش
                  minHeight: '844px',
                  borderRadius: '40px',
                  border: '12px solid #1f2937', 
                  transform: 'scale(0.65)' // تصغير قوي ليظهر بالكامل
               } : { 
                  width: 'calc(100% - 60px)', 
                  height: 'calc(100% - 60px)', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  transform: 'scale(1)'
               }}
            >
               {/* Desktop Browser Header */}
               {viewMode === 'desktop' && (
                  <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-4 shrink-0">
                     <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
                     <div className="bg-white px-3 py-1 rounded text-[10px] text-gray-400 flex-1 text-center font-mono border shadow-sm">ibro-kitchen.dz</div>
                  </div>
               )}

               {/* Mobile Notch */}
               {viewMode === 'mobile' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-[#1f2937] rounded-b-[18px] z-50 pointer-events-none"/>
               )}
               
               {/* المحتوى الداخلي */}
               <div className="flex-1 w-full h-full overflow-y-auto bg-white scroll-smooth no-scrollbar relative">
                  <div className={viewMode === 'mobile' ? 'pt-8' : ''}>
                     <CustomerPageView settings={settings} />
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
