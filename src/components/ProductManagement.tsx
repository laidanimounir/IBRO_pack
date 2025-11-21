import { useState, useEffect } from 'react';
import { Product } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

// استيراد Supabase


export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
    const { data, error } = await supabase.from('Products').select('*');
    if (error) {
      console.error('Error loading products:', error.message);
      toast.error('فشل تحميل المنتجات');
    } else {
      setProducts(data);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.oldPrice || !formData.newPrice || !formData.imageUrl) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    const productData = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      oldPrice: parseFloat(formData.oldPrice),
      newPrice: parseFloat(formData.newPrice),
      imageUrl: formData.imageUrl,
      isFeatured: formData.isFeatured,
      createAt: editingProduct?.createdAt || new Date().toISOString(),
    };

   

let updatedProduct;

if (editingProduct) {
  // تحديث منتج موجود - يجب أن ترسل كل الحقول اللازمة باستثناء id (لأنه في eq)
  updatedProduct = await supabase
    .from('Products')
    .update({
      name: formData.name,
      oldPrice: parseFloat(formData.oldPrice),
      newPrice: parseFloat(formData.newPrice),
      imageUrl: formData.imageUrl,
      isFeatured: formData.isFeatured
      // لا ترسل createAt أو createdAt عند التعديل إذا كنت تريد Supabase أن يتحكم بها
    })
    .eq('id', editingProduct.id);

  if (updatedProduct.error) {
    console.error('خطأ التحديث:', updatedProduct.error);
    toast.error('فشل تحديث المنتج');
  } else {
    toast.success('تم تحديث المنتج بنجاح');
  }
} else {
  // إدراج منتج جديد
  if (formData.isFeatured) {
    await supabase
      .from('Products')
      .update({ isFeatured: false })
      .eq('isFeatured', true); // إلغاء التمييز عن كل المنتجات السابقة
  }
  // هنا فقط الحقول المطلوبة في الجدول - id ووقت الإنشاء يتم إنشاؤهما تلقائياً
  updatedProduct = await supabase
    .from('Products')
    .insert([{
      name: formData.name,
      oldPrice: parseFloat(formData.oldPrice),
      newPrice: parseFloat(formData.newPrice),
      imageUrl: formData.imageUrl,
      isFeatured: formData.isFeatured
      // لا ترسل id ولا createAt أو createdAt
    }]);

  if (updatedProduct.error) {
    console.error('Supabase Insert Error:', updatedProduct.error);
    toast.error('فشل إضافة المنتج: ' + updatedProduct.error.message);
  } else {
    toast.success('تم إضافة المنتج بنجاح');
  }
}

// بعدها يمكنك تحميل المنتجات مجدداً وتغيير حالة النموذج كالمعتاد







    if (!updatedProduct.error) {
      loadProducts();
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      oldPrice: product.oldPrice.toString(),
      newPrice: product.newPrice.toString(),
      imageUrl: product.imageUrl,
      isFeatured: product.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await supabase.from('OrderItems').delete().eq('productId', id);
      const { error } = await supabase.from('Products').delete().eq('id', id);
      if (error) {
         
        toast.error('فشل عملية الحذف');
      } else {
        toast.success('تم حذف المنتج بنجاح');
        loadProducts();
      }
    }
  };

 

const toggleFeatured = async (id: string) => {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (!product.isFeatured) {
    // إذا كان المنتج غير مميز ونريد تعيينه كمميز:
    await supabase.from('Products').update({ isFeatured: false }).eq('isFeatured', true); // إلغاء تعيين الباقي
    await supabase.from('Products').update({ isFeatured: true }).eq('id', id);
  } else {
    // إذا أردت إلغاء ميزة التميز لهذا المنتج
    await supabase.from('Products').update({ isFeatured: false }).eq('id', id);
  }

  loadProducts();
  toast.success('تم تحديث المنتج المميز');
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
                    required
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
                  <img src={formData.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded mt-2" />
                )}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  منتج مميز (خصم كبير)
                </Label>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingProduct ? 'تحديث' : 'إضافة'}
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex gap-2">
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
                    className={product.isFeatured ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                  >
                    <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-white' : ''}`} />
                  </Button>
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {product.newPrice.toLocaleString('ar-DZ')} دج
                </TableCell>
                <TableCell className="text-right line-through text-gray-500">
                  {product.oldPrice.toLocaleString('ar-DZ')} دج
                </TableCell>
                <TableCell className="text-right font-semibold">{product.name}</TableCell>
                <TableCell>
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}