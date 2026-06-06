import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { Wishlist } from '@/types';

const COL = 'wishlists';

export async function getWishlist(userId: string): Promise<Wishlist[]> {
  const q = query(collection(db, COL), where('user_id', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Wishlist));
}

export async function addToWishlist(userId: string, productId: string): Promise<string> {
  const ref = await addDoc(collection(db, COL), { user_id: userId, product_id: productId });
  return ref.id;
}

export async function removeFromWishlist(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
