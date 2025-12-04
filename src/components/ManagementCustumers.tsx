import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { Customer } from "../types/types";

// عميل خاص بهذا المكوّن فقط
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getReliabilityClasses(isReliable: boolean, warnings: number) {
  if (!isReliable || warnings >= 3) {
    return "bg-red-100 text-red-800";
  }
  if (warnings > 0) {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-green-100 text-green-800";
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
  const [searchTerm, setSearchTerm] = useState("");
  
const [statusFilter, setStatusFilter] =
  useState<"all" | "reliable" | "warning" | "unreliable">("all");

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

  // فلترة الزبائن (الحالة + البحث)
 const filteredCustomers = customers.filter((c) => {
  // فلتر الحالة
  if (statusFilter === "reliable") {
    // موثوق تمامًا
    if (!c.isReliable || c.warnings > 0) return false;
  }

  if (statusFilter === "warning") {
    // أي زبون لديه تحذيرات
    if (c.warnings === 0) return false;
  }

  if (statusFilter === "unreliable") {
    // غير موثوق: إمّا isReliable=false أو تحذيرات كثيرة
    if (c.isReliable && c.warnings === 0) return false;
  }

  // فلتر البحث
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
      <h1 className="text-xl font-bold">قائمة الزبائن</h1>

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
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2">{c.totalOrders}</td>
              <td className="p-2">{c.deliveredOrders}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
