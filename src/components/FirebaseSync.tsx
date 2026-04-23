import { useEffect } from 'react';
import { onSnapshot, collection, doc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useStore } from '../store/useStore';
import { Product, Order, Review, SiteConfig, ContactMessage } from '../types';

export default function FirebaseSync() {
  const setProducts = useStore(state => state.setProducts);
  const updateSiteConfig = useStore(state => state.updateSiteConfig);
  const setOrders = useStore(state => state.setOrders);
  const setMessages = useStore(state => state.setMessages);
  const addComment = useStore(state => state.addComment);

  useEffect(() => {
    // 1. Sync Products (Public)
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ ...doc.data() as Product, id: doc.id }));
      setProducts(productsData);
    });

    // 2. Sync Site Config (Public)
    const unsubscribeConfig = onSnapshot(doc(db, 'metadata', 'siteConfig'), (snapshot) => {
      if (snapshot.exists()) {
        updateSiteConfig(snapshot.data() as SiteConfig);
      }
    });

    // 3. Sync Reviews (Public)
    const unsubscribeComments = onSnapshot(collection(db, 'comments'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const comment = { ...change.doc.data() as Review, id: change.doc.id };
            useStore.getState().addComment(comment);
        }
      });
    });

    let unsubscribeOrders: () => void = () => {};
    let unsubscribeMessages: () => void = () => {};

    // 4. User Specific Sync (Orders & Messages)
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeOrders();
      unsubscribeMessages();
      if (user) {
        // Check if Admin to sync ALL orders and messages
        let q;
        const email = user.email?.toLowerCase();
        if (email === 'saifysamit@gmail.com' || email === 'splendourstreetwear@gmail.com') {
          q = collection(db, 'orders');
          
          unsubscribeMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ ...doc.data() as ContactMessage, id: doc.id }));
            setMessages(messagesData);
          });
        } else {
          q = query(collection(db, 'orders'), where('userId', '==', user.uid));
          setMessages([]);
        }

        unsubscribeOrders = onSnapshot(q, (snapshot) => {
           const ordersData = snapshot.docs.map(doc => ({ ...doc.data() as Order, id: doc.id }));
           setOrders(ordersData);
        });
      } else {
        setOrders([]);
        setMessages([]);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeConfig();
      unsubscribeComments();
      unsubscribeAuth();
      unsubscribeOrders();
      unsubscribeMessages();
    };
  }, [setProducts, updateSiteConfig, setOrders, setMessages, addComment]);

  return null;
}
