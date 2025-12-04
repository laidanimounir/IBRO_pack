// src/components/ManagementCustumers.tsx
import React from "react";
import type { Customer } from "../types/types";

const mockCustomers: Customer[] = [
  {
    id: "1",
    phone: "0550000000",
    name: "أحمد بن يوسف",
    totalOrders: 5,
    deliveredOrders: 4,
    isReliable: true,
    warnings: 0,
  },
  {
    id: "2",
    phone: "0661000000",
    name: "خديجة علي",
    totalOrders: 2,
    deliveredOrders: 2,
    isReliable: true,
    warnings: 0,
  },
];
export function ManagementCustumers() {
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
          </tr>
        </thead>
        <tbody>
          {mockCustomers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2">{c.totalOrders}</td>
              <td className="p-2">{c.deliveredOrders}</td>
              <td className="p-2">{c.isReliable ? "نعم" : "لا"}</td>
              <td className="p-2">{c.warnings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
