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
  serverTimestamp,
} from 'firebase/firestore';
import { Payment } from '@/types';

const COL = 'payments';

export async function createPayment(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<string> {
  const docRef = await addDoc(collection(db, COL), {
    ...paymentData,
    created_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function getAllPayments(): Promise<Payment[]> {
  const q = query(collection(db, COL), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  const q = query(collection(db, COL), where('user_id', '==', userId));
  const snap = await getDocs(q);
  const payments = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
  return payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Payment;
}

export async function updatePaymentStatus(id: string, status: Payment['status'], adminNote?: string): Promise<void> {
  const data: Partial<Payment> = { status };
  if (adminNote !== undefined) {
    data.admin_note = adminNote;
  }
  await updateDoc(doc(db, COL, id), data);
}
