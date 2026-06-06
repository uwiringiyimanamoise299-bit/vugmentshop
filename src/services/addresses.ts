import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { Address } from '@/types';

const COL = 'addresses';

export async function getAddresses(userId: string): Promise<Address[]> {
  const q = query(collection(db, COL), where('user_id', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Address));
}

export async function addAddress(address: Omit<Address, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COL), { ...address });
  return ref.id;
}

export async function updateAddress(id: string, data: Partial<Address>): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteAddress(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
