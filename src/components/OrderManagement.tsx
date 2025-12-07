import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Order, Customer, OrderItem } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Search,
  AlertTriangle,
  ThumbsUp,
  Printer,
  X,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [orderToProcess, setOrderToProcess] = useState<Order | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'shipped' | 'delivered' | 'rejected'>('all');

  
const [page, setPage] = useState(1);
const pageSize = 10;

const getCustomerInfoById = (customerId) => {
  return customers.find(c => c.id === customerId);
};


const loadOrders = async () => {
  const { data, error } = await supabase
    .from('Orders')
    .select('*')
    .range((page - 1) * pageSize, page * pageSize - 1); 
  if (error) {
    toast.error('فشل تحميل الطلبات');
    setOrders([]);
  } else {
    setOrders(data ?? []);
  }
};


const loadCustomers = async () => {
  const { data, error } = await supabase.from('Customers').select('*'); 
  if (error) {
    toast.error('فشل تحميل العملاء');
    setCustomers([]);
  } else {
    setCustomers(data ?? []);
  }
};

useEffect(() => {
  loadOrders();
  loadCustomers();
}, [page]); 


  useEffect(() => {
    if (selectedOrder) {
      const fetchOrderItems = async () => {
        const { data, error } = await supabase
          .from('OrderItems')
          .select('*')
          .eq('orderId', selectedOrder.id);
        if (error) {
          toast.error('فشل تحميل منتجات الطلب');
          setOrderItems([]);
        } else {
          setOrderItems(data ?? []);
        }
      };
      fetchOrderItems();
    } else {
      setOrderItems([]);
    }
  }, [selectedOrder]);


const updateOrder = async (
  updatedOrder: Partial<Order>,
  orderId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('Orders')
    .update(updatedOrder)
    .eq('id', orderId);

  if (error) {
    toast.error('فشل تحديث حالة الطلب');
    return false; 
  }

  await loadOrders();
  return true; 
};






const deleteOrder = async (orderId: string) => {
  
  const { error: itemsError } = await supabase
    .from('OrderItems')
    .delete()
    .eq('orderId', orderId);

  if (itemsError) {
    toast.error('فشل حذف منتجات الطلب');
    return;
  }

  
  const { error: orderError } = await supabase
    .from('Orders')
    .delete()
    .eq('id', orderId);

  if (orderError) {
    toast.error('فشل حذف الطلب');
    return;
  }

  
  setSelectedOrder(null);
  setOrders(prev => prev.filter(o => o.id !== orderId));

  toast.success('تم حذف الطلب بنجاح');
};




 
const updateCustomer = async (phone: string, orderStatus: 'delivered' | 'not_delivered') => {
  
  const { data: existingCustomer, error: fetchError } = await supabase
    .from('Customers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (fetchError || !existingCustomer) {
    toast.error('فشل في العثور على الزبون');
    return;
  }

  
  const currentWarnings = existingCustomer.warnings ?? 0;
  const currentDelivered = existingCustomer.deliveredOrders ?? 0;
  const currentTotalOrders = existingCustomer.totalOrders ?? 0;

  
  const updatedWarnings =
    orderStatus === 'not_delivered' ? currentWarnings + 1 : currentWarnings;

  const updatedDeliveredOrders =
    orderStatus === 'delivered' ? currentDelivered + 1 : currentDelivered;

  const updatedTotalOrders = currentTotalOrders;

  
  const updatedIsReliable = updatedDeliveredOrders >= 3;

  const { error: updateError } = await supabase
    .from('Customers')
    .update({
      totalOrders: updatedTotalOrders,
      deliveredOrders: updatedDeliveredOrders,
      isReliable: updatedIsReliable,
      warnings: updatedWarnings,
    })
    .eq('phone', phone);

  if (updateError) {
    toast.error('فشل تحديث بيانات الزبون');
  } else {
    
   
    await loadCustomers();
  }
};


  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error('تعذر فتح نافذة الطباعة');
      return;
    }

    const itemsHtml = orderItems.map(item => `
      <tr>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toLocaleString('ar-DZ')} دج</td>
        <td>${(item.price * item.quantity).toLocaleString('ar-DZ')} دج</td>
      </tr>
    `).join('');
    
  printWindow.document.write(`
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة - ${order.id}</title>
      <style>
        body {
          font-family: 'Tajawal', Arial, sans-serif;
          background: #fafafa;
          padding: 30px;
          color: #444;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to left, #ff9800 30%, #ffc107 100%);
          color: #fff;
          padding: 16px 32px;
          border-radius: 8px 8px 0 0;
          margin-bottom: 24px;
        }
        .invoice-header h1 {
          margin: 0;
          font-size: 2.3rem;
          letter-spacing: 2px;
        }
        .invoice-info {
          background: #fff3cd;
          padding: 16px 32px;
          border-radius: 0 0 8px 8px;
          margin-bottom: 20px;
        }
        .invoice-info p {
          margin: 6px 0;
          font-size: 1.05rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: #ffecb3;
          font-weight: bold;
          border: 1px solid #ffe082;
        }
        td {
          background: #fffbe7;
          border: 1px solid #ffe082;
        }
        th, td {
          padding: 12px 10px;
          text-align: center;
          font-size: 1rem;
        }
        .invoice-total {
          background: #4caf50;
          color: #fff;
          padding: 18px 0;
          font-size: 1.35rem;
          font-weight: bold;
          text-align: left;
          border-radius: 6px;
          margin-bottom: 24px;
        }
        @media print {
          body { background: #fff; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <h1>IBRO kitchen dz</h1>
        <div>
          <span>فاتورة رقم: ${order.id}</span>
        </div>
      </div>
      <div class="invoice-info">
        <p>التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-DZ')}</p>
        <p>اسم الزبون: ${order.customerName}</p>
        <p>الهاتف: ${order.phone}</p>
        <p>العنوان: ${order.address}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="invoice-total">
        <span>المجموع الإجمالي: ${order.totalAmount.toLocaleString('ar-DZ')} دج</span>
      </div>
      <p style="text-align:center;font-size:1.1rem;color:#ff9800;">شكراً لتعاملكم معنا</p>
    </body>
  </html>
`);
printWindow.document.close();
printWindow.focus();
printWindow.print();
  }


  

const getStatusBadge = (status: Order['status']) => {
  const statusConfig = {
    pending: { 
      label: 'قيد الانتظار', 
      
      className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100' 
    },
    accepted: { 
      label: 'مقبول', 
     
      className: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-100' 
    },
    rejected: { 
      label: 'مرفوض', 
      
      className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100' 
    },
    shipped: { 
      label: 'تم الإرسال', 
     
      className: 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100' 
    },
    delivered: { 
      label: 'تم التسليم', 
      
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
    }
  };
  
  const config = statusConfig[status] ?? { label: 'غير معروف', className: 'bg-gray-100 text-gray-700' };
  
  return (

    <Badge variant="outline" className={`${config.className} px-3 py-1 text-xs font-bold shadow-sm border`}>
      {config.label}
    </Badge>
  );
};






  const getCustomerInfo = (phone: string) => {
    return customers.find(c => c.phone === phone);
  };

  const filteredOrders = orders.filter(order => {
  const matchesSearch =
    (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.phone && order.phone.includes(searchTerm));

  const matchesStatus =
    statusFilter === 'all' || order.status === statusFilter;

  return matchesSearch && matchesStatus;
});


 
  const handleAccept = (order: Order) => {
    console.log("قبول الطلب", order);
    setOrderToProcess(order);
    setShowAcceptDialog(true);
  };

  const confirmAccept = async () => {
    if (orderToProcess) {
      await updateOrder({ status: 'accepted', updatedAt: new Date().toISOString() }, orderToProcess.id);
      setShowAcceptDialog(false);
      setOrderToProcess(null);
      toast.success('تم قبول الطلب');
    }
  };

  const handleReject = (order: Order) => {
    console.log("رفض الطلب", order);
    setOrderToProcess(order);
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (orderToProcess && rejectReason.trim()) {
      await updateOrder(
        { status: 'rejected', rejectionReason: rejectReason, updatedAt: new Date().toISOString() },
        orderToProcess.id
      );
      setShowRejectDialog(false);
      setRejectReason('');
      setOrderToProcess(null);
      toast.success('تم رفض الطلب');
    }
  };

  const handleShip = async (order: Order) => {
    console.log("شحن الطلب", order);
    await updateOrder({ status: 'shipped', updatedAt: new Date().toISOString() }, order.id);
    toast.success('تم تحديث حالة الطلب');
  };


const handleDeliver = async (order: Order) => {
  console.log("تسليم الطلب", order);

 
  const ok = await updateOrder(
    { status: 'delivered', updatedAt: new Date().toISOString() },
    order.id
  );

  
  if (!ok) return;

  
  await updateCustomer(order.phone, 'delivered');

  toast.success('تم تسليم الطلب بنجاح');
};



  const handleNotDelivered = async (order: Order) => {
    console.log("سجل لم يستلم", order);
    await updateCustomer(order.phone, 'not_delivered');
    toast.warning('تم تسجيل تحذير للزبون');
  };

  const handleDelete = (order: Order) => {
    console.log("حذف الطلب", order);
    setOrderToProcess(order);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (orderToProcess) {
      await deleteOrder(orderToProcess.id);
      setShowDeleteDialog(false);
      setOrderToProcess(null);
      toast.success('تم حذف الطلب بنجاح');
    }
  };

const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
   
    totalRevenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
};
const [totalRevenue, setTotalRevenue] = useState(0);



const calculateTotalRevenue = async () => {
 
  const { data, error } = await supabase
    .from('Orders')
    .select('totalAmount')
    .eq('status', 'delivered');
  
  if (!error && data) {
    const total = data.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    setTotalRevenue(total);
  }
};


useEffect(() => {
  loadOrders();
  loadCustomers();
  calculateTotalRevenue(); 
}, [page]);




  return (
    <div className="space-y-6">



{/* قسم الإحصائيات الجديد */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
   {/* بطاقة الطلبات الجديدة */}
    <Card className="bg-gradient-to-br from-orange-50 via-orange-50/50 to-white border-orange-200 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right mb-2">طلبات جديدة</p>
                <h3 className="text-4xl font-extrabold text-orange-600">{stats.pendingOrders}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center ring-4 ring-orange-50">
                <AlertTriangle className="h-7 w-7 text-orange-600" />
            </div>
        </CardContent>
    </Card>

    {/* بطاقة المبيعات */}
    <Card className="bg-gradient-to-br from-green-50 via-green-50/50 to-white border-green-200 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right mb-2">إجمالي المبيعات</p>
                <h3 className="text-4xl font-extrabold text-green-600">
                    {totalRevenue.toLocaleString('ar-DZ')} <span className="text-base font-semibold">دج</span>
                </h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center ring-4 ring-green-50">
                <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
        </CardContent>
    </Card>

    {/* بطاقة إجمالي الطلبات */}
    <Card className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white border-blue-200 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right mb-2">كل الطلبات</p>
                <h3 className="text-4xl font-extrabold text-blue-600">{stats.totalOrders}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center ring-4 ring-blue-50">
                <Package className="h-7 w-7 text-blue-600" />
            </div>
        </CardContent>
    </Card>
</div>

      <Card className="shadow-lg border-gray-200">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <CardTitle className="text-2xl font-bold text-gray-800">إدارة الطلبات</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6 p-6">

          


          <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
  {/* معلومات مختصرة عن النتائج */}
  <div className="w-full md:w-auto text-sm text-gray-500 text-right md:text-left">
    تظهر الآن {filteredOrders.length} طلبات من أصل {orders.length}
  </div>

  {/* شريط البحث + الفلاتر */}
  <div className="flex items-center gap-2 w-full md:w-auto">
    {/* فلتر الحالة */}
   <div className="flex flex-col md:flex-row items-center gap-3 justify-between mt-2 mb-3">
  {/* يمين: حقل البحث */}
  <div className="relative w-full md:w-[320px]">
    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
    <Input
      placeholder="ابحث بالاسم أو رقم الهاتف..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className="pr-9 h-9 text-right text-sm rounded-full border-gray-300 focus:ring-2 focus:ring-orange-300"
    />
  </div>

  {/* يسار: فلتر الحالة + نص صغير */}
  <div className="flex items-center gap-2 text-xs text-gray-500">
    
    <select
      className="border border-gray-300 rounded-full bg-white px-3 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-orange-300"
      value={statusFilter}
      onChange={e => setStatusFilter(e.target.value as any)}
    >
      <option value="all">كل الحالات</option>
      <option value="pending">قيد الانتظار</option>
      <option value="accepted">مقبول</option>
      <option value="shipped">تم الإرسال</option>
      <option value="delivered">تم التسليم</option>
      <option value="rejected">مرفوض</option>
    </select>
  </div>
</div>


    {/* زر إعادة التعيين */}
<Button
  type="button"
  variant="outline"
  className="shrink-0 text-xs md:text-sm px-4 h-9 rounded-full border-gray-300 text-gray-600 
             hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
  onClick={() => {
    setSearchTerm('');
    setStatusFilter('all');
  }}
>
  عودة للوضع الافتراضي
</Button>


  </div>
</div>


         


<div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md bg-white">
  <Table>
    <TableHeader className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
      <TableRow className="hover:bg-transparent">
        <TableHead className="text-right font-bold text-gray-700 py-4 w-[260px]">الإجراءات</TableHead>
        <TableHead className="text-right font-bold text-gray-700">الحالة</TableHead>
        <TableHead className="text-right font-bold text-gray-700">المبلغ</TableHead>
        <TableHead className="text-right font-bold text-gray-700">العنوان</TableHead>
        <TableHead className="text-right font-bold text-gray-700">الهاتف</TableHead>
        <TableHead className="text-right font-bold text-gray-700">الاسم</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {filteredOrders.length === 0 ? (
        /* الحالة الفارغة (Empty State) */
        <TableRow>
          <TableCell colSpan={7} className="h-[400px] text-center align-middle">
            <div className="flex flex-col items-center justify-center text-gray-400 animate-in fade-in zoom-in duration-300">
              <div className="bg-gray-50 p-6 rounded-full mb-4 border border-dashed border-gray-200">
                <Package className="h-12 w-12 text-gray-300" />
              </div>
              
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                {searchTerm 
                  ? "لا توجد نتائج مطابقة لبحثك." 
                  : "القائمة فارغة. انتظر الطلبات الجديدة!"}
              </p>
            </div>
          </TableCell>
        </TableRow>
      ) : (
        /* عرض الطلبات */
        filteredOrders.map(order => {
          const customerInfo = getCustomerInfo(order.phone);
          return (
            <TableRow
    key={order.id}
    className="group hover:bg-orange-50/60 cursor-pointer transition-all duration-150 border-b border-gray-100 last:border-0"
    onClick={() => setSelectedOrder(order)}
>
           {/* عمود الإجراءات */}
<TableCell className="py-3">
  <div className="flex flex-wrap gap-1.5 justify-start md:justify-center">
    {order.status === 'pending' && (
      <>
        <Button
          variant="outline"
          className="h-8 px-3 rounded-full border-gray-300 text-gray-700 bg-white
                     hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors"
          onClick={e => { e.stopPropagation(); handleAccept(order); }}
        >
          <CheckCircle className="h-4 w-4 ml-1" />
          قبول
        </Button>

        <Button
          variant="outline"
          className="h-8 px-3 rounded-full border-gray-300 text-gray-700 bg-white
                     hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors"
          onClick={e => { e.stopPropagation(); handleReject(order); }}
        >
          <XCircle className="h-4 w-4 ml-1" />
          رفض
        </Button>
      </>
    )}

    {order.status === 'accepted' && (
     <Button
  variant="outline"
  className="h-8 px-3 rounded-full border-sky-300 text-sky-700 bg-sky-50
             hover:bg-sky-100 hover:border-sky-500 hover:text-sky-800 transition-colors text-xs md:text-sm"
  onClick={e => { e.stopPropagation(); handleShip(order); }}
>
  <Truck className="h-3.5 w-3.5 ml-1" />
  شحن
</Button>
    )}

    {order.status === 'shipped' && (
      <>
        <Button
          variant="outline"
          className="h-8 px-3 rounded-full border-gray-300 text-gray-700 bg-white
                     hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-colors"
          onClick={e => { e.stopPropagation(); handleDeliver(order); }}
        >
          <Package className="h-4 w-4 ml-1" />
          تسليم
        </Button>

        <Button
          variant="outline"
          className="h-8 px-3 rounded-full border-gray-300 text-gray-700 bg-white
                     hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors"
          onClick={e => { e.stopPropagation(); handleNotDelivered(order); }}
        >
          <AlertTriangle className="h-4 w-4 ml-1" />
          لم يستلم
        </Button>

        <Button
          variant="outline"
          className="h-8 px-3 rounded-full border-gray-300 text-gray-700 bg-white
                     hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 transition-colors"
          onClick={e => { e.stopPropagation(); handlePrintInvoice(order); }}
        >
          <Printer className="h-4 w-4 ml-1" />
          فاتورة
        </Button>
      </>
    )}

    {(order.status === 'delivered' || order.status === 'rejected') && (
       <Button
    variant="outline"
    className="h-8 px-3 rounded-full border-red-300 text-red-600 bg-red-50
               hover:bg-red-100 hover:border-red-500 hover:text-red-700 font-semibold transition-colors text-xs md:text-sm"
    onClick={e => { e.stopPropagation(); handleDelete(order); }}
  >
    <Trash2 className="h-3.5 w-3.5 ml-1" />
    حذف
  </Button>
    )}
  </div>
</TableCell>


              {/* عمود الحالة */}
              <TableCell>
                <div className="space-y-1">
                  {getStatusBadge(order.status)}
                  {order.status === 'rejected' && order.rejectionReason && (
                    <p className="text-[10px] text-red-600 bg-red-50 px-1 rounded truncate max-w-[100px]" title={order.rejectionReason}>
                      {order.rejectionReason}
                    </p>
                  )}
                </div>
              </TableCell>

              {/* بقية الأعمدة */}
              <TableCell className="font-mono text-gray-700 font-medium">{order.totalAmount?.toLocaleString('ar-DZ')} دج</TableCell>
              <TableCell className="text-sm text-gray-600 truncate max-w-[150px]" title={order.address}>{order.address}</TableCell>
              
              <TableCell>
                  <div className="flex items-center justify-start gap-1.5">
                    <span className="font-mono text-sm text-gray-600" dir="ltr">{order.phone}</span>
                    {customerInfo?.warnings > 0 && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    {customerInfo?.isReliable && <ThumbsUp className="h-3.5 w-3.5 text-green-500" />}
                  </div>
              </TableCell>
              
              <TableCell className="font-medium text-gray-900">
                {/* هنا عدلتها لتظهر الاسم بشكل صحيح بدلاً من البحث بالـ ID */}
                {getCustomerInfoById(order. customerId)?.name || "اسم غير متوفر"}
              </TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  </Table>
</div>
{/* --- نهاية كود الجدول الجديد --- */}




                  <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-200">
    <Button 
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        variant="outline"
        className="px-6 font-semibold"
    >
        السابق
    </Button>
    <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-bold border border-orange-200">
        صفحة {page}
    </span>
    <Button 
        onClick={() => setPage(p => p + 1)}
        variant="outline"
        className="px-6 font-semibold"
    >
        التالي
    </Button>
</div>


         

          {selectedOrder && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-10">
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-4 text-white hover:bg-white/20"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <CardTitle className="text-2xl text-right pr-12">تفاصيل الطلب #{selectedOrder.id}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-right">
                      <p className="mb-1 text-sm text-blue-600 font-semibold">اسم الزبون</p>
                      <p className="text-lg font-bold text-gray-900">اسم</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-right">
                      <p className="mb-1 text-sm text-green-600 font-semibold">الهاتف</p>
                      <p className="text-lg font-bold text-gray-900">{selectedOrder.phone}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-right md:col-span-2">
                      <p className="mb-1 text-sm text-purple-600 font-semibold">العنوان</p>
                      <p className="text-lg font-bold text-gray-900">{selectedOrder.address}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <h3 className="mb-3 text-lg font-bold flex items-center justify-end gap-2 text-gray-900">
                      <span>المنتجات المطلوبة</span>
                      <Package className="h-5 w-5 text-orange-600" />
                    </h3>
                    <div className="space-y-2">
                      {orderItems.length === 0 ? (
                        <div className="text-center text-gray-500">لا يوجد منتجات لهذا الطلب</div>
                      ) : (
                        orderItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg flex justify-between items-center hover:shadow-md transition-shadow"
                          >
                            <div className="text-left">
                              <span className="text-xl font-bold text-green-600">
                                {(item.price * item.quantity).toLocaleString('ar-DZ')} دج
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-900 font-semibold">{item.productName}</p>
                              <p className="text-sm text-gray-600">
                                الكمية: {item.quantity} × {item.price.toLocaleString('ar-DZ')} دج
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 rounded-lg text-white">
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-bold">
                        {selectedOrder.totalAmount.toLocaleString('ar-DZ')} دج
                      </span>
                      <span className="text-xl font-semibold">المجموع الإجمالي</span>
                    </div>
                  </div>

                  {(() => {
                    const customerInfo = getCustomerInfo(selectedOrder.phone);
                    if (customerInfo) {
                      return (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-lg border-2 border-orange-200">
                          <h3 className="mb-3 text-lg font-bold text-gray-900 flex items-center justify-end gap-2 text-right">
                            <span>معلومات الزبون</span>
                            <ThumbsUp className="h-5 w-5 text-orange-600" />
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-right">
                            <div className="bg-white/70 p-3 rounded">
                              <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                              <p className="text-2xl font-bold text-orange-600">{customerInfo.totalOrders}</p>
                            </div>
                            <div className="bg-white/70 p-3 rounded">
                              <p className="text-sm text-gray-600">الطلبات المستلمة</p>
                              <p className="text-2xl font-bold text-green-600">{customerInfo.deliveredOrders}</p>
                            </div>
                            <div className="col-span-2 flex justify-end">
                              {customerInfo.isReliable ? (
                                <Badge className="bg-green-600 text-lg px-4 py-2">
                                  <ThumbsUp className="ml-2 h-5 w-5" />
                                  زبون جاد وموثوق
                                </Badge>
                              ) : customerInfo.warnings > 0 ? (
                                <Badge className="bg-red-600 text-lg px-4 py-2">
                                  <AlertTriangle className="ml-2 h-5 w-5" />
                                  تحذير: لا يستلم الطلبات ({customerInfo.warnings})
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-500 text-lg px-4 py-2">
                                  زبون جديد
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <Button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg py-6"
                  >
                    إغلاق
                  </Button>

        
                </CardContent>
              </Card>
            </div>
          )}



        </CardContent>
      </Card>
     <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد قبول الطلب</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من قبول هذا الطلب؟ سيتم تحديث حالة الطلب إلى "مقبول".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAccept} className="bg-green-600 hover:bg-green-700">
              تأكيد القبول
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">رفض الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason" className="block text-right">سبب الرفض</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="اكتب سبب رفض الطلب..."
                className="min-h-24 text-right"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason.trim()}>
                تأكيد الرفض
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف الطلب</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا الطلب؟ لن تتمكن من استرجاعه بعد الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
