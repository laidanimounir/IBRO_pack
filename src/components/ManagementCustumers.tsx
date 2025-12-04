import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { Customer } from "../types/types";

// عميل خاص بهذا المكوّن فقط
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function ManagementCustumers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("Customers")
        .select(
          "id, name, phone, totalOrders, deliveredOrders, isReliable, warnings , address"
        );

      if (error) setError(error.message);
      else setCustomers(data as Customer[]);
      setLoading(false);
    };

    fetchCustomers();
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">قائمة الزبائن</h1>

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
          {customers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2">{c.totalOrders}</td>
              <td className="p-2">{c.deliveredOrders}</td>
              <td className="p-2">{c.isReliable ? "نعم" : "لا"}</td>
              <td className="p-2">{c.warnings}</td>
              <td className="p-2">{c.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
