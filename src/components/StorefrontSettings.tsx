import React, { useState } from 'react';
import { Save, Image as ImageIcon, Layout, Type, Palette } from 'lucide-react';


export default function StorefrontSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // test data
    storeName: 'IBRO Kitchen',
    description: 'أفضل الأكلات السريعة والتقليدية',
    primaryColor: '#f97316',
    showBanner: true,
    bannerText: 'توصيل مجاني للطلبات فوق 2000 دج!',
    isOpen: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
     
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">تخصيص الواجهة</h2>
          <p className="text-gray-500 text-sm mt-1">تعديل مظهر المتجر كما يراه الزبائن</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      
      <div className="w-full">
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'general' 
                ? 'border-orange-500 text-orange-600 bg-orange-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            إعدادات عامة
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'appearance' 
                ? 'border-orange-500 text-orange-600 bg-orange-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            المظهر والألوان
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'content' 
                ? 'border-orange-500 text-orange-600 bg-orange-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            الإعلانات والمحتوى
          </button>
        </div>

        
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                <Layout size={20} className="text-orange-500" />
                بيانات المتجر
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
                  <input 
                    type="text" 
                    value={settings.storeName}
                    onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none transition-shadow text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وصف المتجر</label>
                  <input 
                    type="text" 
                    value={settings.description}
                    onChange={(e) => setSettings({...settings, description: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none transition-shadow text-right"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <span className="block font-medium text-gray-800">حالة المتجر (مفتوح)</span>
                    <span className="text-xs text-gray-500">عند الإغلاق لن يتم استقبال طلبات جديدة</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.isOpen}
                      onChange={(e) => setSettings({...settings, isOpen: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <span className="block font-medium text-red-800">وضع الصيانة</span>
                    <span className="text-xs text-red-600">يظهر صفحة "قيد الصيانة" للزبائن</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                <Palette size={20} className="text-purple-500" />
                الألوان والهوية
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللون الرئيسي</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                      className="h-10 w-16 p-1 rounded cursor-pointer border"
                    />
                    <span className="font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded border">{settings.primaryColor}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} />
                    صورة الغلاف (Banner)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer bg-gray-50/50">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-2">
                      <ImageIcon size={48} strokeWidth={1} />
                    </div>
                    <p className="text-gray-600 font-medium">اضغط هنا لرفع صورة جديدة</p>
                    <p className="text-gray-400 text-sm mt-1">يفضل أن تكون بمقاس 1200×400 بكسل</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

       
        {activeTab === 'content' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                <Type size={20} className="text-blue-500" />
                شريط الإعلانات
              </h3>
              
              <div className="flex items-center justify-between mb-6">
                <span className="font-medium text-gray-700">تفعيل الشريط العلوي</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.showBanner}
                    onChange={(e) => setSettings({...settings, showBanner: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.showBanner && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">نص الإعلان</label>
                  <input 
                    type="text" 
                    value={settings.bannerText}
                    onChange={(e) => setSettings({...settings, bannerText: e.target.value})}
                    placeholder="اكتب نص الإعلان هنا..."
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none transition-shadow text-right"
                  />
                  <p className="text-xs text-gray-500 mt-1">سيظهر هذا النص في أعلى صفحة الزبائن بخلفية ملونة.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
