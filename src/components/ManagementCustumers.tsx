import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, useRef } from "react";
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

function getStatusDotColor(isReliable: boolean, warnings: number) {
  if (!isReliable || warnings >= 3) return "bg-red-500";
  if (warnings > 0) return "bg-amber-500";
  return "bg-emerald-500";
}

// مكون القائمة المنسدلة للسهم
function CustomerDropdown({ customer, onDetailsClick }: { customer: Customer, onDetailsClick: (c: Customer) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-right mr-2" ref={dropdownRef}>
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors text-right" onClick={() => alert(`تعديل بيانات: ${customer.name} (قريباً)`)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              تعديل البيانات
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors text-right" onClick={() => { onDetailsClick(customer); setIsOpen(false); }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              عرض التفاصيل
            </button>
            <div className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-default border-t border-gray-50 text-right">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="text-xs">آخر طلب: --/--/----</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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

  // المتغيرات الجديدة للصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredCustomers.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, rowsPerPage]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(`تم نسخ ${label}`);
    setTimeout(() => setCopyMessage(null), 2000);
  };

  // ✅ دالة التمرير السلس لقسم الحذف
  const scrollToDelete = () => {
    const element = document.getElementById('delete-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) return <div className="flex justify-center p-10 text-gray-500">جاري تحميل الزبائن...</div>;
  if (error) return <div className="p-6 text-center text-red-500 bg-red-50 border border-red-200 rounded m-4">{error}</div>;

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
      
      {copyMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-gray-800 text-white px-6 py-3 rounded-full text-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {copyMessage}
        </div>
      )}

      {/* الرأس والعداد */}
      <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">قائمة الزبائن</h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full">
                   <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                   <span className="text-xs font-bold text-orange-700">
                      عدد الزبائن الكلي: {filteredCustomers.length}
                   </span>
                </div>
             </div>
             
             {/* ✅ زر الانتقال السريع للحذف */}
             <button 
                onClick={scrollToDelete}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors shadow-sm text-sm font-medium"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                حذف زبون
             </button>
          </div>

          {/* شريط الفلتر والتحكم في الصفوف */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 w-full md:w-auto">
               <span className="text-sm text-gray-500 whitespace-nowrap">عرض:</span>
               <select 
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2 outline-none"
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
               >
                  <option value={10}>10 زبائن</option>
                  <option value={20}>20 زبون</option>
                  <option value={50}>50 زبون</option>
                  <option value={100}>100 زبون</option>
               </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-500 whitespace-nowrap">فلتر:</span>
                <select
                  className="w-full sm:w-auto rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 py-2 px-3 outline-none transition-all"
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
                  className="w-full rounded-lg border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
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
              {currentData.map((c) => (
                <tr 
                  key={c.id} 
                  className={`transition-colors group/row ${selectedCustomer?.id === c.id ? "bg-orange-50" : "hover:bg-gray-50"}`}
                >
                  <td className="p-4 font-medium text-gray-900">
                    <div className="flex items-center justify-between w-full max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(c.isReliable, c.warnings)}`}></span>
                        <span className="truncate block" title={c.name}>{c.name}</span>
                      </div>
                      <div className="shrink-0">
                         <CustomerDropdown customer={c} onDetailsClick={(cust) => { setSelectedCustomer(cust); setIsDetailsOpen(true); }} />
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-mono font-semibold text-gray-600 dir-ltr tracking-wide">{c.phone}</span>
                      <div className="flex items-center gap-2">
                        <a href={`https://wa.me/213${c.phone.replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="p-1 rounded-md hover:bg-green-50 transition-all duration-200 group/icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#25D366" className="grayscale group-hover/icon:grayscale-0 opacity-60 group-hover/icon:opacity-100 transition-all duration-200">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        </a>
                        <button onClick={() => copyToClipboard(c.phone, "الرقم")} className="p-1 rounded-md hover:bg-gray-100 transition-all duration-200 group/icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover/icon:text-blue-600 transition-colors duration-200">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium text-gray-700">{c.totalOrders}</td>
                  <td className="p-4 text-center text-gray-500">{c.deliveredOrders}</td>
                  <td className="p-4 text-center"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReliabilityClasses(c.isReliable, c.warnings)}`}>{getReliabilityLabel(c.isReliable, c.warnings)}</span></td>
                  <td className="p-4 text-center">{c.warnings > 0 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">{c.warnings}</span> : <span className="text-gray-300">-</span>}</td>
                  <td className="p-4 max-w-[200px]"><div className="truncate text-gray-500 text-xs" title={c.address}>{c.address || "---"}</div></td>
                  <td className="p-4 text-center"><button className="text-xs font-medium text-gray-500 hover:text-orange-600 px-3 py-1.5 rounded-lg transition-colors" onClick={() => { setSelectedCustomer(c); setIsDetailsOpen(true); }}>عرض التفاصيل</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && !loading && <div className="p-12 text-center text-gray-400 bg-gray-50"><p>لا توجد نتائج تطابق بحثك.</p></div>}
        
        {filteredCustomers.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 p-4 flex flex-col sm:flex-row items-center justify-center gap-8">
                <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                    عرض <b>{startIndex + 1}</b> - <b>{Math.min(startIndex + rowsPerPage, filteredCustomers.length)}</b> من إجمالي <b>{filteredCustomers.length}</b>
                </span>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    
                    <span className="text-sm font-medium text-gray-700 px-2">صفحة {currentPage} من {totalPages}</span>

                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* ✅ فاصل أنيق (Divider) */}
      <div className="flex items-center gap-4 py-8">
          <div className="h-px flex-1 bg-gray-200"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">منطقة الإدارة</span>
          <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      {/* ✅ منطقة الحذف (تصميم مركز ومكثف) مع ID */}
      <div id="delete-section" className="mb-16 max-w-lg mx-auto scroll-mt-10">
        <div className="bg-white border border-red-100 rounded-3xl p-8 shadow-xl shadow-red-50/50 text-center relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-400"></div>

            <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4 text-red-500 transform rotate-3 transition-transform hover:rotate-0 duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">حذف زبون</h3>
                <p className="text-sm text-gray-400">أدخل رقم الهاتف للبحث والحذف</p>
            </div>
            
            <div className="space-y-4">
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="0770..." 
                        className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-red-400 focus:ring-0 outline-none transition-all text-center font-mono text-lg placeholder:text-gray-300"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-red-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <span>بحث وحذف</span>
                </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>انتبه: الحذف نهائي</span>
                </p>
            </div>
        </div>
      </div>

      {/* المودال (نفسه لم يتغير) */}
      {isDetailsOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 transition-opacity" onClick={() => setIsDetailsOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 border border-gray-100" onClick={(e) => e.stopPropagation()}>
            
            <div className="absolute top-3 left-3 z-10">
              <button onClick={() => setIsDetailsOpen(false)} className="p-2 bg-white/80 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shadow-sm border border-gray-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="bg-gray-50 pt-8 pb-6 px-6 border-b border-gray-100">
              <div className="flex flex-col mb-3">
                 <p className="text-xs text-gray-400 mb-1 font-medium">اسم الزبون</p>
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedCustomer.warnings >= 3 || !selectedCustomer.isReliable ? 'bg-red-100 text-red-600' : selectedCustomer.warnings > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                        {getReliabilityLabel(selectedCustomer.isReliable, selectedCustomer.warnings)}
                    </span>
                 </div>
              </div>
              
              <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <p className="text-sm font-medium text-gray-700 leading-tight">
                  {selectedCustomer.address || "لا يوجد عنوان مسجل"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{selectedCustomer.totalOrders}</p>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">إجمالي الطلبات</p>
                </div>
                <div className="text-center border-r border-gray-100">
                  <p className={`text-2xl font-bold ${selectedCustomer.totalOrders > 0 && (selectedCustomer.deliveredOrders / selectedCustomer.totalOrders) < 0.5 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {selectedCustomer.totalOrders > 0 
                      ? Math.round((selectedCustomer.deliveredOrders / selectedCustomer.totalOrders) * 100) 
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">نسبة الاستلام</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">رقم الهاتف</p>
                    <p className="font-mono font-bold text-xl text-gray-800 dir-ltr">{selectedCustomer.phone}</p>
                  </div>
                  <button onClick={() => copyToClipboard(selectedCustomer.phone, "الرقم")} className="text-sm text-orange-600 font-bold hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-orange-100">
                    نسخ
                  </button>
                </div>

                <a href={`https://wa.me/213${selectedCustomer.phone.replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 transform active:scale-[0.98]">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                   مراسلة عبر واتساب
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
