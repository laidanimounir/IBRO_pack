# خطة تطوير تطبيق IBRO kitchen dz

## الملفات المطلوب إنشاؤها:

### 1. الصفحات الرئيسية (src/pages/)
- [x] CustomerPage.tsx - صفحة الزبائن (عرض المنتجات + نموذج الطلب)
- [x] AdminLoginPage.tsx - صفحة تسجيل دخول الأدمين
- [x] AdminDashboard.tsx - لوحة تحكم الأدمين (إدارة المنتجات + الطلبات)

### 2. المكونات (src/components/)
- [x] FeaturedProduct.tsx - عرض المنتج المميز (الخصم الكبير)
- [x] ProductGrid.tsx - عرض شبكة المنتجات العادية
- [x] OrderForm.tsx - نموذج الطلب
- [x] ProductManagement.tsx - إدارة المنتجات (إضافة/تعديل/حذف)
- [x] OrderManagement.tsx - إدارة الطلبات (قبول/رفض/إرسال/استلام)
- [x] Invoice.tsx - مكون الفاتورة للطباعة

### 3. الأنواع والواجهات (src/types/)
- [x] types.ts - تعريف جميع الأنواع (Product, Order, Customer, etc.)

### 4. خدمات Supabase (src/lib/)
- [x] supabase.ts - إعداد اتصال Supabase
- [x] database.types.ts - أنواع قاعدة البيانات

### 5. السياقات (src/contexts/)
- [x] AuthContext.tsx - إدارة حالة تسجيل الدخول

### 6. التحديثات
- [x] App.tsx - تحديث التوجيه (routing)
- [x] index.html - تحديث عنوان الصفحة والوصف

## ملاحظات التطوير:
- استخدام localStorage للتخزين المؤقت (Supabase غير مفعل)
- تصميم احترافي بألوان مناسبة لأدوات المطبخ
- واجهة عربية كاملة
- نظام تتبع الزبائن بناءً على رقم الهاتف