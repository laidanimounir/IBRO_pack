import React, { useState, useEffect } from 'react';
import { Product } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Plus, Star, Search } from 'lucide-react';
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

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .order('createAt', { ascending: false });

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
      setImageFile(file);
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
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.newPrice) {
      toast.error('الرجاء ملء اسم المنتج والسعر');
      return;
    }

    if (!editingProduct && !imageFile && !formData.imageUrl) {
      toast.error('الرجاء اختيار صورة للمنتج');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      const productData = {
        name: formData.name,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        newPrice: parseFloat(formData.newPrice),
        imageUrl: finalImageUrl,
        isFeatured: formData.isFeatured,
      };

      let result;

      if (editingProduct) {
        result = await supabase
          .from('Products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        if (formData.isFeatured) {
          await supabase
            .from('Products')
            .update({ isFeatured: false })
            .eq('isFeatured', true);
        }

        result = await supabase.from('Products').insert([productData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(
        editingProduct ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح'
      );

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
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: any) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
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
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (!product.isFeatured) {
      await supabase
        .from('Products')
        .update({ isFeatured: false })
        .eq('isFeatured', true);
      await supabase
        .from('Products')
        .update({ isFeatured: true })
        .eq('id', id);
    } else {
      await supabase
        .from('Products')
        .update({ isFeatured: false })
        .eq('id', id);
    }

    loadProducts();
    toast.success('تم تحديث حالة المنتج');
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card dir="rtl" className="border-gray-100 shadow-sm rounded-3xl">
      {/* الهيدر العصري */}
      <CardHeader className="flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            إدارة المنتجات
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            أضف منتجات جديدة، عدّل الأسعار، وفعّل المنتجات المميزة في متجرك.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* حقل البحث */}
          <div className="relative">
            <Input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-full md:w-64"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* زر إضافة منتج */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 rounded-full px-4 py-2">
                <Plus className="ml-2 h-5 w-5" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right text-2xl">
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-right block">
                    اسم المنتج
                  </Label>
                  <Input
                    id="productName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="أدخل اسم المنتج"
                    className="text-right"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPrice" className="text-right block">
                      السعر القديم (دج)
                    </Label>
                    <Input
                      id="oldPrice"
                      type="number"
                      value={formData.oldPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, oldPrice: e.target.value })
                      }
                      placeholder="0"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPrice" className="text-right block">
                      السعر الجديد (دج)
                    </Label>
                    <Input
                      id="newPrice"
                      type="number"
                      value={formData.newPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, newPrice: e.target.value })
                      }
                      placeholder="0"
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-right block">
                    صورة المنتج
                  </Label>
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
                        className="w-full h-full object-cover rounded-xl border"
                      />
                      {imageFile && (
                        <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          جديد
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isFeatured: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="featured" className="cursor-pointer mr-2">
                    منتج مميز (يظهر في واجهة المتجر)
                  </Label>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-full"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 rounded-full min-w-[110px]"
                  >
                    {loading
                      ? 'جاري الحفظ...'
                      : editingProduct
                      ? 'تحديث'
                      : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      {/* جدول المنتجات بشكل عصري */}
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="text-right text-xs md:text-sm w-40">
                  الإجراءات
                </TableHead>
                <TableHead className="text-center text-xs md:text-sm w-24">
                  الأكثر مبيعا
                </TableHead>
                <TableHead className="text-right text-xs md:text-sm">
                  السعر الجديد
                </TableHead>
                <TableHead className="text-right text-xs md:text-sm">
                  السعر القديم
                </TableHead>
                <TableHead className="text-right text-xs md:text-sm min-w-[150px]">
                  اسم المنتج
                </TableHead>
                <TableHead className="text-right text-xs md:text-sm w-28">
                  الصورة
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    لا توجد منتجات مطابقة لبحثك حالياً
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-orange-50/50 transition-colors"
                  >
                    {/* الإجراءات */}
                    <TableCell>
                      <div className="flex gap-2 justify-start">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="rounded-full bg-gray-100 hover:bg-gray-200 border-none text-gray-700"
                          title="تعديل المنتج"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="rounded-full bg-red-50 text-red-600 hover:bg-red-100 border-none"
                          title="حذف المنتج"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* مميز */}
                    <TableCell className="text-center">
                      <Button
                        variant={product.isFeatured ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => toggleFeatured(product.id)}
                        className={
                          product.isFeatured
                            ? 'bg-yellow-400 hover:bg-yellow-500 border-none rounded-full'
                            : 'rounded-full border-gray-200'
                        }
                        title="تفعيل / إلغاء التمييز"
                      >
                        <Star
                          className={
                            product.isFeatured
                              ? 'h-4 w-4 fill-white text-white'
                              : 'h-4 w-4 text-gray-400'
                          }
                        />
                      </Button>
                    </TableCell>

                    {/* السعر الجديد */}
                    <TableCell className="text-right font-bold text-green-600 whitespace-nowrap">
                      {product.newPrice.toLocaleString('ar-DZ')} دج
                    </TableCell>

                    {/* السعر القديم */}
                    <TableCell className="text-right text-gray-400 whitespace-nowrap">
                      {product.oldPrice ? (
                        <span className="line-through">
                          {product.oldPrice.toLocaleString('ar-DZ')} دج
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    {/* الاسم */}
                    <TableCell className="text-right font-semibold text-gray-900">
                      {product.name}
                    </TableCell>

                    {/* الصورة */}
                    <TableCell className="text-right">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 ml-auto">
                        <img
                          src={
                            product.imageUrl ||
                            'https://via.placeholder.com/64'
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
