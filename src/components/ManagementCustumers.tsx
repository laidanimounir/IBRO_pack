import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { Customer } from "../types/types";

// إنشاء عميل Supabase مرة واحدة خارج المكوّن
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// دوال مساعدة لتحديد ألوان ونص شارة الموثوقية
function getReliabilityClasses(isReliable: boolean, warnings: number) {
  if (!isReliable || warnings >= 3) {
    return "bg-red-100 text-red-800";     // غير موثوق / تحذيرات كثيرة
  }
  if (warnings > 0) {
    return "bg-amber-100 text-amber-800"; // موثوق لكن لديه تحذيرات
  }
  return "bg-green-100 text-green-800";   // موثوق تمامًا
}

function getReliabilityLabel(isReliable: boolean, warnings: number) {
  if (!isReliable || warnings >= 3) return "غير موثوق";
  if (warnings > 0) return `تحذير (${warnings})`;
  return "موثوق";
}

export function ManagementCustumers() {
  // حالة البيانات القادمة من Supabase
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [copyMessage, setCopyMessage] = useState<string | null>(null);
  // حالة البحث
  const [searchTerm, setSearchTerm] = useState("");

  // حالة الفيلتر (الكل / موثوق / تحذيرات / غير موثوق)
  const [statusFilter, setStatusFilter] =
    useState<"all" | "reliable" | "warning" | "unreliable">("all");

  // حالات المودال: الزبون المختار + مفتوح/مغلق
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // جلب الزبائن من Supabase مرة واحدة عند تحميل المكوّن
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("Customers")
        .select(
          "id, name, phone, totalOrders, deliveredOrders, isReliable, warnings, address"
        );

      if (error) setError(error.message);
      else setCustomers(data as Customer[]);
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  // تطبيق الفيلتر (الحالة + البحث) على القائمة الأصلية
  const filteredCustomers = customers.filter((c) => {
    // فلتر الحالة
    if (statusFilter === "reliable") {
      if (!c.isReliable || c.warnings > 0) return false;
    }
    if (statusFilter === "warning") {
      if (c.warnings === 0) return false;
    }
    if (statusFilter === "unreliable") {
      // غير موثوق: إما isReliable = false أو لديه تحذيرات
      if (c.isReliable && c.warnings === 0) return false;
    }

    // فلتر البحث بالاسم أو الهاتف
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term)
    );
  });

  if (loading) return <p>جاري تحميل الزبائن...</p>;
  if (error) return <p>حدث خطأ: {error}</p>;

  return (
    <div className="space-y-4">
        {copyMessage && (
  <div className="rounded bg-green-100 px-3 py-1 text-sm text-green-800">
    {copyMessage}
  </div>
)}
      <h1 className="text-xl font-bold">قائمة الزبائن</h1>

      {/* شريط الفيلتر + البحث */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm">فلتر الحالة:</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | "reliable" | "warning" | "unreliable"
              )
            }
          >
            <option value="all">كل الزبائن</option>
            <option value="reliable">الموثوقون فقط</option>
            <option value="warning">بهم تحذيرات</option>
            <option value="unreliable">غير موثوقين</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          className="mb-2 rounded border px-3 py-1 text-sm focus:outline-none focus:ring"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* جدول الزبائن */}
      <table className="min-w-full text-right text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">الاسم</th>
            <th className="p-2">الهاتف</th>
            <th className="p-2">عدد الطلبات</th>
            <th className="p-2">الطلبات المسلّمة</th>
            <th className="p-2">موثوق</th>
            <th className="p-2">تحذيرات</th>
            <th className="p-2">العنوان</th>
            <th className="p-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.name}</td>
      <td className="p-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-gray-600">{c.phone}</span>

{/* زر واتساب */}
        <a
          href={`https://wa.me/213${c.phone.replace(/^0/, '')}`} // تعديل الرقم للصيغة الدولية للجزائر
          target="_blank"
          rel="noreferrer"
          className="text-green-500 hover:text-green-700"
          title="مراسلة عبر واتساب"
        >
          {/* أيقونة واتساب بسيطة */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592z"/>
          </svg>
        </a>


   {/* زر النسخ القديم */}
        <button
          className="text-gray-400 hover:text-blue-600"
          title="نسخ الرقم"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(c.phone);
              setCopyMessage(`تم نسخ: ${c.phone}`);
              setTimeout(() => setCopyMessage(null), 2000);
            } catch {
              setCopyMessage("فشل النسخ");
            }
          }}
        >
          📋
        </button>
  </div>
</td>

              <td className="p-2">{c.totalOrders}</td>
              <td className="p-2">{c.deliveredOrders}</td>

              {/* شارة الموثوقية الملونة */}
              <td className="p-2">
                <span
                  className={
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
                    getReliabilityClasses(c.isReliable, c.warnings)
                  }
                >
                  {getReliabilityLabel(c.isReliable, c.warnings)}
                </span>
              </td>

              <td className="p-2">{c.warnings}</td>

              
                 <td className="p-2 max-w-[200px]">
      <div className="truncate text-gray-600" title={c.address}>
        {c.address || "---"}
      </div>
    </td>

              {/* زر يفتح نافذة التفاصيل لهذا الزبون */}
              <td className="p-2 text-center">
                <button
                  className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                  onClick={() => {
                    setSelectedCustomer(c);   // نخزن الزبون المختار
                    setIsDetailsOpen(true);   // نفتح المودال
                  }}
                >
                  تفاصيل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* مودال تفاصيل الزبون – يظهر فقط إذا كان isDetailsOpen = true ويوجد selectedCustomer */}
      {isDetailsOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          {/* صندوق المودال نفسه */}
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            {/* العنوان + زر الإغلاق */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">تفاصيل الزبون</h2>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setIsDetailsOpen(false)} // إغلاق المودال
              >
                إغلاق ✕
              </button>
            </div>

            {/* محتوى المعلومات */}
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold">الاسم:</span>{" "}
                {selectedCustomer.name}
              </p>
              <p>
                <span className="font-semibold">الهاتف:</span>{" "}
                {selectedCustomer.phone}
              </p>
              <p>
                <span className="font-semibold">العنوان:</span>{" "}
                {selectedCustomer.address}
              </p>
              <p>
                <span className="font-semibold">عدد الطلبات:</span>{" "}
                {selectedCustomer.totalOrders}
              </p>
              <p>
                <span className="font-semibold">الطلبات المسلّمة:</span>{" "}
                {selectedCustomer.deliveredOrders}
              </p>
              <p>
                <span className="font-semibold">موثوقية:</span>{" "}
                {getReliabilityLabel(
                  selectedCustomer.isReliable,
                  selectedCustomer.warnings
                )}
              </p>
              <p>
                <span className="font-semibold">تحذيرات:</span>{" "}
                {selectedCustomer.warnings}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
