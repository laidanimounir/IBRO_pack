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
  
const [page, setPage] = useState(1);
const pageSize = 10;

const getCustomerInfoById = (customerId) => {
  return customers.find(c => c.id === customerId);
};

// دالة جلب الطلبات فقط هي التي تستعمل التقسيم
const loadOrders = async () => {
  const { data, error } = await supabase
    .from('Orders')
    .select('*')
    .range((page - 1) * pageSize, page * pageSize - 1); // تقسيـم فقط للطلبات
  if (error) {
    toast.error('فشل تحميل الطلبات');
    setOrders([]);
  } else {
    setOrders(data ?? []);
  }
};

// تحميل جميع العملاء دفعة واحدة (بدون تقسيم)
const loadCustomers = async () => {
  const { data, error } = await supabase.from('Customers').select('*'); // جلب كامل للعملاء
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
}, [page]); // يعتمد على تغيير الصفحة لجلب الطلبات فقط


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

  const updateOrder = async (updatedOrder: Partial<Order>, orderId: string) => {
    const { error } = await supabase.from('Orders').update(updatedOrder).eq('id', orderId);
    if (error) {
      toast.error('فشل تحديث الحالة');
    } else {
      toast.success('تم تحديث حالة الطلب');
      const { data } = await supabase.from('Orders').select('*');
      setOrders(data ?? []);
    }
  };

 const deleteOrder = async (orderId: string) => {
  await supabase.from('OrderItems').delete().eq('orderId', orderId);
  const { error } = await supabase.from('Orders').delete().eq('id', orderId);
  if (error) {
    
    toast.error('فشل حذف الطلب');
  } else {
    await supabase.from('Customers').delete().eq('id', orderId);
    setSelectedOrder(null);
    // التحديث المحلي الأفضل:
    setOrders(orders => orders.filter(o => o.id !== orderId));
    
    toast.success('تم حذف الطلب بنجاح');
    // أو إعادة تحميل بالتصفح لو أردت التأكد دائماً من الترتيب:
    // await loadOrders();
  }
};

  const updateCustomer = async (phone: string, orderStatus: 'delivered' | 'not_delivered') => {
    const { data: existingCustomer } = await supabase
      .from('Customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existingCustomer) {
      const updatedTotalOrders = orderStatus === 'delivered'
  ? existingCustomer.totalOrders + 1
  : existingCustomer.totalOrders;
      const updatedWarnings = orderStatus === 'not_delivered' ? existingCustomer.warnings + 1 : existingCustomer.warning;
      const updatedDeliveredOrders = orderStatus === 'delivered' ? existingCustomer.deliveredOrders + 1 : existingCustomer.deliveredOrders;
      const updatedReliable = orderStatus === 'delivered' ? updatedDeliveredOrders >= 3 : existingCustomer.isReable;

      const { error } = await supabase.from('Customers').update({
        totalOrders:  updatedTotalOrders,
        deliveredOrders: updatedDeliveredOrders,
        isReliable: updatedReliable,
        warnings: updatedWarnings,
      }).eq('phone', phone);

      if (!error) {
        toast.success('تم تحديث بيانات الزبون');
      }
    }

    const { data } = await supabase.from('Customers').select('*');
    setCustomers(data ?? []);
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
      pending: { label: 'قيد الانتظار', className: 'bg-yellow-500' },
      accepted: { label: 'مقبول', className: 'bg-green-500' },
      rejected: { label: 'مرفوض', className: 'bg-red-500' },
      shipped: { label: 'تم الإرسال', className: 'bg-blue-500' },
      delivered: { label: 'تم التسليم', className: 'bg-purple-500' }
    };
    const config = statusConfig[status] ?? { label: 'غير معروف', className: 'bg-gray-400' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCustomerInfo = (phone: string) => {
    return customers.find(c => c.phone === phone);
  };

  const filteredOrders = orders.filter(order =>
    (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.phone && order.phone.includes(searchTerm))
  );

  // إجراءات الطلب
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
    await updateOrder({ status: 'delivered', updatedAt: new Date().toISOString() }, order.id);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">إدارة الطلبات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="ابحث بالاسم أو رقم الهاتف..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الإجراءات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">لا توجد طلبات حالياً</TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => {
                    const customerInfo = getCustomerInfo(order.phone);
                    return (
                      <TableRow
                        key={order.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={e => { e.stopPropagation(); handleAccept(order); }}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={e => { e.stopPropagation(); handleReject(order); }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {order.status === 'accepted' && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={e => { e.stopPropagation(); handleShip(order); }}
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status === 'shipped' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={e => { e.stopPropagation(); handleDeliver(order); }}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={e => { e.stopPropagation(); handleNotDelivered(order); }}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={e => { e.stopPropagation(); handlePrintInvoice(order); }}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {order.status === 'delivered' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={e => { e.stopPropagation(); handlePrintInvoice(order); }}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={e => { e.stopPropagation(); handleDelete(order); }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {order.status === 'rejected' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={e => { e.stopPropagation(); handleDelete(order); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(order.status)}
                            {order.status === 'rejected' && order.rejectionReason && (
                              <p className="text-xs text-red-600">السبب: {order.rejectionReason}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{order.totalAmount?.toLocaleString('ar-DZ')} دج</TableCell>
                        <TableCell className="text-sm">{order.address}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-start">
                            <span>{order.phone}</span>
                            {customerInfo?.warnings > 0 && (
                              <Badge className="ml-2 bg-red-600 text-xs">
                                <AlertTriangle className="h-3 w-3" />
                              </Badge>
                            )}
                            {customerInfo?.isReliable && (
                              <Badge className="ml-2 bg-green-600 text-xs">
                                <ThumbsUp className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getCustomerInfoById(order. customerId)?.name || "اسم غير متوفر"}</TableCell>
                        
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
                  
            </Table>
 
          </div>
                  <div className="flex justify-center gap-3 my-4">
  <Button onClick={() => setPage(p => Math.max(1, p - 1))}>السابق</Button>
  <span>صفحة {page}</span>
  <Button onClick={() => setPage(p => p + 1)}>التالي</Button>
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
