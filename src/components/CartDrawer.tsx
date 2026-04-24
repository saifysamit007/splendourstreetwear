import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Download, ExternalLink, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { formatPrice } from '../constants';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { Order } from '../types';
import Invoice from './Invoice';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, clearCart, addOrder, siteConfig, updateProduct, products } = useStore();
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutStatus('processing');

    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    const user = auth.currentUser;
    const order: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: user?.uid || 'guest',
      customerName: user?.displayName || 'Guest User',
      customerEmail: user?.email || 'guest@example.com',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.price,
        quantity: item.quantity
      })),
      subtotal: total,
      total: total,
      deliveryCharge: 0,
      shippingRegion: 'INSIDE_DHAKA',
      status: 'pending',
      createdAt: new Date().toISOString(),
      invoiceId: `${siteConfig.invoice.prefix}${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod: 'COD'
    };

    // Update stock levels
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        updateProduct({ ...product, stock: Math.max(0, product.stock - item.quantity) });
      }
    });

    addOrder(order);
    setLastOrder(order);
    clearCart();
    setCheckoutStatus('success');
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setCheckoutStatus('idle');
      setLastOrder(null);
      setShowInvoice(false);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAndReset}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-card border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-brand-red" size={24} />
                <h2 className="text-2xl font-display font-bold tracking-tight">
                  {checkoutStatus === 'success' ? 'Protocol Success' : 'Your Cart'}
                </h2>
                {checkoutStatus !== 'success' && (
                  <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                )}
              </div>
              <button onClick={closeAndReset} className="text-brand-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar relative">
              {checkoutStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8">
                     <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                  <h3 className="text-3xl font-display font-black italic uppercase italic mb-4">Transfer Complete</h3>
                  <p className="text-brand-muted text-sm leading-relaxed mb-10 max-w-xs">
                    Your acquisition has been logged in the collective registry. An architectural receipt has been generated.
                  </p>
                  
                  <div className="w-full space-y-4">
                     <button 
                       onClick={() => setShowInvoice(true)}
                       className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
                     >
                       <FileText size={16} /> View Digital Receipt
                     </button>
                     <button 
                       onClick={closeAndReset}
                       className="w-full py-4 bg-brand-red text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-accent-dark transition-all shadow-xl shadow-brand-red/20"
                     >
                       Return to Hub
                     </button>
                  </div>
                </motion.div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <ShoppingBag size={32} className="text-brand-muted" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
                    <p className="text-brand-muted text-sm">Looks like you haven't added anything yet.</p>
                  </div>
                  <Link 
                    to="/shop"
                    onClick={onClose}
                    className="bg-brand-red hover:bg-brand-accent-dark text-white px-8 py-3 rounded-xl font-bold transition-all inline-block"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-brand-bg flex-shrink-0 border border-white/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm group-hover:text-brand-red transition-colors">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-brand-muted hover:text-brand-red transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-brand-muted uppercase tracking-widest mb-2">{item.category}</p>
                        <p className="font-bold text-brand-red font-mono">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-white/5 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-white/5 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && checkoutStatus !== 'success' && (
              <div className="p-6 border-t border-white/10 bg-brand-bg/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-brand-muted font-medium">Subtotal</span>
                  <span className="text-2xl font-display font-bold font-mono">{formatPrice(total)}</span>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  disabled={checkoutStatus === 'processing'}
                  className="w-full bg-brand-red hover:bg-brand-accent-dark disabled:opacity-50 disabled:cursor-wait text-white py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-red/20 flex justify-center items-center gap-3"
                >
                  Finalize Acquisition
                </button>
                <p className="text-center text-[10px] text-brand-muted mt-4 uppercase tracking-[0.2em]">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>

          {/* Expanded Invoice Overlay */}
          <AnimatePresence>
            {showInvoice && lastOrder && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
                 <motion.div
                   initial={{ opacity: 0, y: 50 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 50 }}
                   className="relative max-h-full overflow-y-auto no-scrollbar"
                 >
                    <Invoice order={lastOrder} config={siteConfig.invoice} />
                    <button 
                      onClick={() => setShowInvoice(false)}
                      className="absolute -top-12 right-0 p-3 bg-white/10 rounded-full hover:bg-brand-red transition-all text-white"
                    >
                      <X size={24} />
                    </button>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
