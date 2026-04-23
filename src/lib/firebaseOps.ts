import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { Product, Order, Review, SiteConfig } from '../types';

export const firebaseOps = {
  // ... existing methods (I'll replace the whole export to be safe and updated)
  
  // Products
  saveProduct: async (product: Product) => {
    await setDoc(doc(db, 'products', product.id), product);
  },
  deleteProduct: async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  },

  // Site Config
  saveSiteConfig: async (config: SiteConfig) => {
    await setDoc(doc(db, 'metadata', 'siteConfig'), config);
  },

  // Orders
  createOrder: async (order: Order) => {
    await setDoc(doc(db, 'orders', order.id), {
      ...order,
      createdAt: serverTimestamp()
    });
  },
  updateOrder: async (id: string, updates: Partial<Order>) => {
    await updateDoc(doc(db, 'orders', id), updates);
  },

  // Reviews
  addComment: async (review: Review) => {
    await setDoc(doc(db, 'comments', review.id), review);
  },
  updateComment: async (id: string, updates: Partial<Review>) => {
    await updateDoc(doc(db, 'comments', id), updates);
  },

  // Image Uploads for Reviews
  uploadReviewImages: async (commentId: string, files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file, index) => {
      const storageRef = ref(storage, `reviews/${commentId}/${index}_${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });
    return Promise.all(uploadPromises);
  },

  // Messages
  updateMessageStatus: async (id: string, status: string) => {
    await updateDoc(doc(db, 'messages', id), { status });
  },
  deleteMessage: async (id: string) => {
    await deleteDoc(doc(db, 'messages', id));
  }
};
