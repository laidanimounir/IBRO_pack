import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { Customer } from "../types/types";

// إعداد Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// دوال مساعدة للتصميم
function getReliabilityClasses(isReliable: boolean, warnings: number) {
  if (!isReliable || warnings >= 3) return "bg-red-50 text-red-700 border border-red-200";
  if (warnings > 0) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
}

function getReliabilityLabel(isReliable: boolean, warnings: number) {
  if (!isReliable || warnings >= 3) return "غير موثوق";
  if (warnings > 0) return `تحذير (${warnings})`;
  return "موثوق";
}

export function ManagementCustumers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "reliable" | "warning" | "unreliable">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from("Customers")
          .select("id, name, phone, totalOrders, deliveredOrders, isReliable, warnings, address");

        if (error) throw error;
        setCustomers(data as Customer[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (statusFilter === "reliable" && (!c.isReliable || c.warnings > 0)) return false;
    if (statusFilter === "warning" && c.warnings === 0) return false;
    if (statusFilter === "unreliable" && (c.isReliable && c.warnings === 0)) return false;
    
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return c.name?.toLowerCase().includes(term) || c.phone?.toLowerCase().includes(term);
  });

  if (loading) return <div className="flex justify-center p-10 text-gray-500">جاري تحميل الزبائن...</div>;
  if (error) return <div className="p-6 text-center text-red-500 bg-red-50 border border-red-200 rounded m-4">{error}</div>;

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
      
      {/* رسالة النسخ العائمة */}
      {copyMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white px-4 py-2 rounded-full text-sm shadow-xl animate-in fade-in slide-in-from-top-2">
          {copyMessage}
        </div>
      )}

      {/* الرأس والفلاتر */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">قائمة الزبائن</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap">فلتر:</span>
            <select
              className="w-full sm:w-auto rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 py-2 px-3 outline-none transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">الكل</option>
              <option value="reliable">الموثوقون</option>
              <option value="warning">عليهم تحذيرات</option>
              <option value="unreliable">غير موثوقين</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف..."
              className="w-full rounded-lg border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      {/* الجدول المحسن */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">الاسم</th>
                <th className="p-4 font-semibold whitespace-nowrap">الهاتف</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">الطلبات</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">المسلّمة</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">الحالة</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">تحذيرات</th>
                <th className="p-4 font-semibold whitespace-nowrap">العنوان</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group/row">
                  <td className="p-4 font-medium text-gray-900">{c.name}</td>
                  
                  {/* خلية الهاتف مع الأيقونات الجديدة */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-mono font-semibold text-gray-600 dir-ltr tracking-wide">{c.phone}</span>
                      
                      <div className="flex items-center gap-1">
                        {/* زر واتساب (الأيقونة الأصلية) */}
                        <a
                          href={`https://wa.me/213${c.phone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md hover:bg-green-100 transition-colors"
                          title="مراسلة واتساب"
                        >
                          {/* SVG الأصلي للواتساب باللون الأخضر */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                        </a>
                        
                        {/* زر النسخ */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(c.phone);
                            setCopyMessage("تم النسخ!");
                            setTimeout(() => setCopyMessage(null), 1500);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                          title="نسخ الرقم"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-center font-medium text-gray-700">{c.totalOrders}</td>
                  <td className="p-4 text-center text-gray-500">{c.deliveredOrders}</td>
                  
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReliabilityClasses(c.isReliable, c.warnings)}`}>
                      {getReliabilityLabel(c.isReliable, c.warnings)}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {c.warnings > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                        {c.warnings}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  <td className="p-4 max-w-[200px]">
                    <div className="truncate text-gray-500 text-xs" title={c.address}>
                      {c.address || "---"}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      className="text-xs bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                      onClick={() => { setSelectedCustomer(c); setIsDetailsOpen(true); }}
                    >
                      تفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-400 bg-gray-50">
            <p>لا توجد نتائج تطابق بحثك.</p>
          </div>
        )}
      </div>

      {/* المودال المحسن */}
      {isDetailsOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => setIsDetailsOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">بطاقة زبون</h2>
              <button onClick={() => setIsDetailsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">الاسم الكامل</span>
                <span className="font-semibold text-gray-900">{selectedCustomer.name}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">رقم الهاتف</span>
                <span className="font-mono font-bold text-gray-700 dir-ltr">{selectedCustomer.phone}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">إجمالي الطلبات</span>
                <span className="font-bold text-blue-600">{selectedCustomer.totalOrders}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">عدد التحذيرات</span>
                <span className={`font-bold ${selectedCustomer.warnings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedCustomer.warnings}
                </span>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm block mb-1">العنوان</span>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedCustomer.address || "لا يوجد عنوان مسجل"}</p>
              </div>
            </div>

            <button 
              onClick={() => setIsDetailsOpen(false)}
              className="mt-6 w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-gray-200"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
