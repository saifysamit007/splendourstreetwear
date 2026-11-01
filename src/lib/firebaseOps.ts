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
import { Product, Order, Review, SiteConfig, Coupon } from '../types';
import { handleFirestoreError, OperationType } from './utils';

function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefined) as unknown as T;
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanUndefined(value);
    }
  }
  return result;
}

export const firebaseOps = {
  // Products
  saveProduct: async (product: Product) => {
    try {
      const sanitized = cleanUndefined(product);
      await setDoc(doc(db, 'products', product.id), sanitized);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `products/${product.id}`);
    }
  },
  deleteProduct: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
    }
  },

  // Site Config
  saveSiteConfig: async (config: SiteConfig) => {
    try {
      const sanitized = cleanUndefined(config);
      await setDoc(doc(db, 'metadata', 'siteConfig'), sanitized);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'metadata/siteConfig');
    }
  },

  // Orders
  createOrder: async (order: Order) => {
    try {
      await setDoc(doc(db, 'orders', order.id), {
        ...order,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `orders/${order.id}`);
    }
  },
  updateOrder: async (id: string, updates: Partial<Order>) => {
    try {
      await updateDoc(doc(db, 'orders', id), cleanUndefined(updates));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${id}`);
    }
  },

  // Coupons
  saveCoupon: async (coupon: Coupon) => {
    try {
      await setDoc(doc(db, 'coupons', coupon.id), cleanUndefined(coupon));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `coupons/${coupon.id}`);
    }
  },
  deleteCoupon: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `coupons/${id}`);
    }
  },

  // Reviews
  addComment: async (review: Review) => {
    try {
      await setDoc(doc(db, 'comments', review.id), review);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `comments/${review.id}`);
    }
  },
  updateComment: async (id: string, updates: Partial<Review>) => {
    try {
      await updateDoc(doc(db, 'comments', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `comments/${id}`);
    }
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
    try {
      await updateDoc(doc(db, 'messages', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `messages/${id}`);
    }
  },
  deleteMessage: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `messages/${id}`);
    }
  },
  
  // Traffic
  logTraffic: async () => {
    try {
      const id = Date.now().toString() + Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'traffic', id), {
        id,
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent
      });
    } catch (e) {
      // Don't throw for traffic logs to avoid disrupting user experience
      console.error("Traffic log failed", e);
    }
  },

  // Cart Activity (Global Notifications)
  logCartActivity: async (message: string, type: 'add' | 'remove') => {
    try {
      const activityId = Date.now().toString() + Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'cart_activity', activityId), {
        id: activityId,
        message,
        type,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Cart activity log failed", e);
    }
  }
};
