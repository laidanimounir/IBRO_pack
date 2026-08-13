export const DEFAULT_DELIVERY_PRICE = 500;

export interface DeliveryWilaya {
  name: string;
  home_price: number;
  office_price: number;
}

export function getDeliveryPrice(
  wilayas: DeliveryWilaya[] | undefined,
  wilaya: string,
  deliveryType: 'home' | 'office'
): number | null {
  if (!wilaya.trim()) return null;
  const selected = wilayas?.find(w => w.name === wilaya);
  if (!selected) return DEFAULT_DELIVERY_PRICE;
  return deliveryType === 'home' ? selected.home_price : selected.office_price;
}