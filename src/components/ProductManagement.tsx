import React, { useState, useEffect } from 'react';
import { Product } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // --- المتغيرات الجديدة التي كانت تسبب المشاكل ---
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    oldPrice: '',
    newPrice: '',
    imageUrl: '',
    isFeatured: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase.from('Products').select('*').order('createAt', { ascending: false });
    if (error) {
      console.error('Error loading products:', error.message);
      toast.error('فشل تحميل المنتجات');
    } else {
      setProducts(data || []);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // حفظ الملف الأصلي للرفع لاحقاً
      // عرض معاينة سريعة فقط
      setFormData({ ...formData, imageUrl: URL.createObjectURL(file) });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      oldPrice: '',
      newPrice: '',
      imageUrl: '',
      isFeatured: false,
    });
    setEditingProduct(null);
    setImageFile(null); // تنظيف الملف
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    // 1. التحقق من البيانات
    if (!formData.name || !formData.newPrice) {
      toast.error('الرجاء ملء اسم المنتج والسعر');
      return;
    }

    // في حالة إضافة منتج جديد، يجب أن يكون هناك صورة (إما ملف جديد أو رابط قديم)
    if (!editingProduct && !imageFile && !formData.imageUrl) {
      toast.error('الرجاء اختيار صورة للمنتج');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // 2. خطوة رفع الصورة (فقط إذا اختار المستخدم صورة جديدة)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        // اسم فريد للملف
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // رفع الصورة للـ Storage
        const { error: uploadError } = await supabase.storage
          .from('images') 
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // جلب الرابط العام
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      // 3. تجهيز البيانات
      const productData = {
        name: formData.name,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        newPrice: parseFloat(formData.newPrice),
        imageUrl: finalImageUrl,
        isFeatured: formData.isFeatured
      };

      let result; 

      if (editingProduct) {
        // === حالة التعديل ===
        result = await supabase
          .from('Products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        // === حالة الإضافة ===
        if (formData.isFeatured) {
            // إلغاء التمييز عن الآخرين إذا كان هذا المنتج مميزاً
            await supabase.from('Products').update({ isFeatured: false }).eq('isFeatured', true);
        }
        
        result = await supabase
          .from('Products')
          .insert([productData]);
      }

      // 4. التحقق من النتيجة
      if (result.error) {
        throw result.error;
      }

      // نجاح!
      toast.success(editingProduct ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
      
      // إعادة تحميل القائمة وتنظيف النموذج
      loadProducts();
      resetForm();
      setIsDialogOpen(false);

    } catch (error: any) {
      console.error('Error:', error);
      toast.error('حدث خطأ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      oldPrice: product.oldPrice ? product.oldPrice.toString() : '',
      newPrice: product.newPrice.toString(),
      imageUrl: product.imageUrl,
      isFeatured: product.isFeatured,
    });
    setImageFile(null); // نبدأ بدون ملف جديد عند التعديل
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: any) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      // ملاحظة: تأكد من العلاقات في قاعدة البيانات (Cascade Delete) لتجنب حذف OrderItems يدوياً
      const { error } = await supabase.from('Products').delete().eq('id', id);
      if (error) {
        toast.error('فشل عملية الحذف');
      } else {
        toast.success('تم حذف المنتج بنجاح');
        loadProducts();
      }
    }
  };

  const toggleFeatured = async (id: any) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (!product.isFeatured) {
      await supabase.from('Products').update({ isFeatured: false }).eq('isFeatured', true); 
      await supabase.from('Products').update({ isFeatured: true }).eq('id', id);
    } else {
      await supabase.from('Products').update({ isFeatured: false }).eq('id', id);
    }

    loadProducts();
    toast.success('تم تحديث حالة المنتج');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">إدارة المنتجات</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="ml-2 h-5 w-5" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-right text-2xl">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName" className="text-right block">اسم المنتج</Label>
                <Input
                  id="productName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم المنتج"
                  className="text-right"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPrice" className="text-right block">السعر القديم (دج)</Label>
                  <Input
                    id="oldPrice"
                    type="number"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    placeholder="0"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPrice" className="text-right block">السعر الجديد (دج)</Label>
                  <Input
                    id="newPrice"
                    type="number"
                    value={formData.newPrice}
                    onChange={(e) => setFormData({ ...formData, newPrice: e.target.value })}
                    placeholder="0"
                    className="text-right"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-right block">صورة المنتج</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-right"
                />
                {formData.imageUrl && (
                  <div className="mt-2 relative w-32 h-32">
                    <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded border" 
                    />
                    {imageFile && <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded">جديد</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
                />
                <Label htmlFor="featured" className="cursor-pointer mr-2">
                  منتج مميز (خصم كبير)
                </Label>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 min-w-[100px]">
                  {loading ? 'جاري الحفظ...' : (editingProduct ? 'تحديث' : 'إضافة')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الإجراءات</TableHead>
              <TableHead className="text-right">مميز</TableHead>
              <TableHead className="text-right">السعر الجديد</TableHead>
              <TableHead className="text-right">السعر القديم</TableHead>
              <TableHead className="text-right">اسم المنتج</TableHead>
              <TableHead className="text-right">الصورة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        لا توجد منتجات حالياً
                    </TableCell>
                </TableRow>
            ) : (
                products.map((product) => (
                <TableRow key={product.id}>
                    <TableCell>
                    <div className="flex gap-2 justify-star">
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        >
                        <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </TableCell>
                    <TableCell>
                    <Button
                        variant={product.isFeatured ? "default" : "outline"}
                        size="icon"
                        onClick={() => toggleFeatured(product.id)}
                        className={product.isFeatured ? "bg-yellow-500 hover:bg-yellow-600 border-none" : ""}
                    >
                        <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-white text-white' : 'text-gray-400'}`} />
                    </Button>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                    {product.newPrice.toLocaleString('ar-DZ')} دج
                    </TableCell>
                    <TableCell className="text-right line-through text-gray-500">
                    {product.oldPrice ? product.oldPrice.toLocaleString('ar-DZ') + ' دج' : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{product.name}</TableCell>
                    <TableCell className="text-right">
                    <img 
                        src={product.imageUrl || "https://via.placeholder.com/64"} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover rounded ml-auto" 
                    />
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
