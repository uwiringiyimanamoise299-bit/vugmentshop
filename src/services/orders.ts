import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { Order } from '@/types';

const COL = 'orders';

export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, COL), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(collection(db, COL), where('user_id', '==', userId));
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  await updateDoc(doc(db, COL, id), { status });
}

export async function createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<string> {
  const docRef = await addDoc(collection(db, COL), {
    ...orderData,
    created_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateOrderPaymentStatus(
  id: string,
  payment_status: Order['payment_status'],
  status?: Order['status']
): Promise<void> {
  const data: Partial<Order> = { payment_status };
  if (status) {
    data.status = status;
  }
  await updateDoc(doc(db, COL, id), data);
}

export async function updateOrderVerificationStatus(
  id: string,
  verification_status: Order['verification_status'],
  status?: Order['status']
): Promise<void> {
  const data: Partial<Order> = { verification_status };
  if (status) {
    data.status = status;
  }
  await updateDoc(doc(db, COL, id), data);
}
