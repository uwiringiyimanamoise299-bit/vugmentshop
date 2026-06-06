export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  stock: number;
  category_id: string;
  brand?: string;
  image_urls: string[]; // First one is main image
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'Pending' | 'Pending Verification' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Rejected';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  verification_status: string;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
}

export interface Address {
  id: string;
  user_id: string;
  country: string;
  city: string;
  district: string;
  street: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  payment_method: string;
  transaction_id: string;
  screenshot_url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  admin_note?: string;
  created_at: string;
}
