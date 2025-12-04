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
    <span>{c.phone}</span>
    <button
      className="text-xs text-blue-500 hover:text-blue-700"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(c.phone);
          setCopyMessage(`تم نسخ رقم ${c.name}`);
          // إخفاء الرسالة بعد ثانيتين
          setTimeout(() => setCopyMessage(null), 2000);//copeir num witch toast
        } catch {
          setCopyMessage("تعذّر نسخ الرقم");
          setTimeout(() => setCopyMessage(null), 2000);
        }
      }}
    >
      نسخ
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
              <td className="p-2">{c.address}</td>

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
