export interface Product {
  id: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  imageUrl: string;
  isFeatured: boolean;
  createAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId:string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'shipped' | 'delivered';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id:string;
  phone: string;
  name: string;
  totalOrders: number;
  deliveredOrders: number;
  isReliable: boolean;
  warnings: number;
}

export interface AdminUser {
  username: string;
  password: string;
}