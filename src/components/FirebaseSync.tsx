import { useEffect } from 'react';
import { onSnapshot, collection, doc, query, where, limit, orderBy, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { firebaseOps } from '../lib/firebaseOps';
import { useStore } from '../store/useStore';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { Product, Order, Review, SiteConfig, ContactMessage, Coupon, TrafficRecord } from '../types';

export default function FirebaseSync() {
  const setProducts = useStore(state => state.setProducts);
  const updateSiteConfig = useStore(state => state.updateSiteConfig);
  const setOrders = useStore(state => state.setOrders);
  const setCoupons = useStore(state => state.setCoupons);
  const setMessages = useStore(state => state.setMessages);
  const setSubscribers = useStore(state => state.setSubscribers);
  const setTraffic = useStore(state => state.setTraffic);
  const addComment = useStore(state => state.addComment);
  const faviconUrl = useStore(state => state.siteConfig?.faviconUrl);

  // Favicon Sync Effect
  useEffect(() => {
    if (faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = faviconUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = faviconUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [faviconUrl]);

  useEffect(() => {
    // 0. Log Traffic (Public)
    firebaseOps.logTraffic().catch(console.error);

    // 1. Sync Products (Public)
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ ...doc.data() as Product, id: doc.id }));
      setProducts(productsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    // 2. Sync Site Config (Public)
    const unsubscribeConfig = onSnapshot(doc(db, 'metadata', 'siteConfig'), (snapshot) => {
      if (snapshot.exists()) {
        updateSiteConfig(snapshot.data() as SiteConfig);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'metadata/siteConfig');
    });

    // 3. Sync Coupons (Public)
    const unsubscribeCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const couponsData = snapshot.docs.map(doc => ({ ...doc.data() as Coupon, id: doc.id }));
      setCoupons(couponsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'coupons');
    });

    // 4. Sync Reviews (Public)
    const unsubscribeComments = onSnapshot(collection(db, 'comments'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const comment = { ...change.doc.data() as Review, id: change.doc.id };
            useStore.getState().addComment(comment);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    });

    // 5. Sync Cart Activity (Public Notifications)
    const cartActivityQuery = query(collection(db, 'cart_activity'), orderBy('timestamp', 'desc'), limit(5));
    let initialCartLoad = true;
    const unsubscribeCartActivity = onSnapshot(cartActivityQuery, (snapshot) => {
      if (initialCartLoad) {
        initialCartLoad = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const timestamp = data.timestamp?.toDate ? data.timestamp.toDate().getTime() : Date.now();
          // Only notify if within last 30 seconds
          if (Date.now() - timestamp < 30000) {
            useStore.getState().addNotification(data.message, data.type === 'remove' ? 'info' : 'success');
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cart_activity');
    });

    let unsubscribeOrders: () => void = () => {};
    let unsubscribeMessages: () => void = () => {};
    let unsubscribeTraffic: () => void = () => {};
    let unsubscribeSubscribers: () => void = () => {};

    // 4. User Specific Sync (Orders & Messages)
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeOrders();
      unsubscribeMessages();
      unsubscribeTraffic();
      unsubscribeSubscribers();
      
      if (user) {
        const email = user.email?.toLowerCase();
        let isAdmin = email === 'saifysamit@gmail.com' || email === 'splendourstreetwear@gmail.com';
        
        if (!isAdmin) {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) isAdmin = true;
          } catch (e) {
            console.error("Admin check failed", e);
          }
        }

        let q;
        if (isAdmin) {
          q = query(collection(db, 'orders'));
          
          unsubscribeMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ ...doc.data() as ContactMessage, id: doc.id }));
            setMessages(messagesData);
          }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'messages');
          });

          const trafficQ = query(collection(db, 'traffic'), orderBy('timestamp', 'desc'), limit(50));
          unsubscribeTraffic = onSnapshot(trafficQ, (snapshot) => {
            const trafficData = snapshot.docs.map(doc => ({ ...doc.data() as TrafficRecord, id: doc.id }));
            setTraffic(trafficData);
          }, (error) => {
             console.error("Traffic sync error", error);
          });

          unsubscribeSubscribers = onSnapshot(collection(db, 'subscribers'), (snapshot) => {
            const subData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubscribers(subData);
          }, (error) => {
             console.error("Subscribers sync error", error);
          });
        } else {
          q = query(collection(db, 'orders'), where('userId', '==', user.uid));
          setMessages([]);
          setTraffic([]);
          setSubscribers([]);
        }

        unsubscribeOrders = onSnapshot(q, (snapshot) => {
           const ordersData = snapshot.docs.map(doc => {
             const data = doc.data();
             let createdAt = data.createdAt;
             
             // Handle Firestore Timestamp conversion
             if (createdAt?.toDate) {
               createdAt = createdAt.toDate().toISOString();
             } else if (!createdAt) {
               // If null (pending write), use current time as estimate
               createdAt = new Date().toISOString();
             }
             
             return {
               ...data,
               id: doc.id,
               createdAt: createdAt
             } as Order;
           }).sort((a, b) => {
             const dateA = new Date(a.createdAt).getTime();
             const dateB = new Date(b.createdAt).getTime();
             return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
           });
           setOrders(ordersData);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'orders');
        });
      } else {
        setOrders([]);
        setMessages([]);
        setTraffic([]);
        setSubscribers([]);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeConfig();
      unsubscribeCoupons();
      unsubscribeComments();
      unsubscribeAuth();
      unsubscribeOrders();
      unsubscribeMessages();
      unsubscribeTraffic();
      unsubscribeSubscribers();
      unsubscribeCartActivity();
    };
  }, [setProducts, updateSiteConfig, setOrders, setCoupons, setMessages, setSubscribers, setTraffic, addComment]);

  return null;
}
