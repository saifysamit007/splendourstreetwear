import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ShoppingBag, CreditCard, Ship, MapPin, 
  Phone, User, CheckCircle2, ChevronLeft, 
  ChevronRight, ArrowRight, ShieldCheck, 
  Smartphone, Wallet, Lock, AlertCircle, 
  FileText, Copy, Check
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, BKASH_NUMBER, SHIPPING_REGIONS } from '../constants';
import { auth, db } from '../firebase';
import { firebaseOps } from '../lib/firebaseOps';
import { cn } from '../lib/utils';
import { Order } from '../types';
import SEO from '../components/SEO';
import Invoice from '../components/Invoice';
import BKashModal from '../components/BKashModal';

type Step = 'shipping' | 'payment' | 'confirmation';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, addOrder, products, updateProduct, siteConfig } = useStore();
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    name: auth.currentUser?.displayName || '',
    phone: '',
    address: '',
    city: '',
    postCode: '',
    shippingRegion: 'INSIDE_DHAKA' as 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'INTERNATIONAL',
    billingSame: true,
    billingAddress: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bkash'>('bkash');
  const [bkashDetails, setBkashDetails] = useState({
    bkashNumber: '',
    transactionId: ''
  });

  const [isBKashModalOpen, setIsBKashModalOpen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = SHIPPING_REGIONS.find(r => r.id === shippingInfo.shippingRegion)?.rate || 0;
  const total = subtotal + deliveryCharge;

  useEffect(() => {
    if (cart.length === 0 && currentStep !== 'confirmation') {
      navigate('/');
    }
  }, [cart, navigate, currentStep]);

  const handleCopy = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'bkash' && !bkashDetails.transactionId) {
      setIsBKashModalOpen(true);
      return;
    }
    
    setLoading(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const user = auth.currentUser;
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const newOrder: Order = {
      id: orderId,
      userId: user?.uid || 'guest',
      customerName: shippingInfo.name,
      customerEmail: user?.email || 'guest@example.com',
      customerPhone: shippingInfo.phone,
      shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postCode}`,
      billingAddress: shippingInfo.billingSame ? `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postCode}` : shippingInfo.billingAddress,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: total,
      deliveryCharge: deliveryCharge,
      shippingRegion: shippingInfo.shippingRegion,
      status: 'pending',
      createdAt: new Date().toISOString(),
      invoiceId: `${siteConfig.invoice.prefix}${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod: paymentMethod,
      paymentDetails: paymentMethod === 'bkash' ? bkashDetails : undefined
    };

    // Update stock levels
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        updateProduct({ ...product, stock: Math.max(0, product.stock - item.quantity) });
      }
    });

    addOrder(newOrder);
    try {
      await firebaseOps.createOrder(newOrder);
    } catch (error) {
      console.error("Order sync failure", error);
    }
    
    setLastOrder(newOrder);
    clearCart();
    setLoading(false);
    setCurrentStep('confirmation');
  };

  if (currentStep === 'confirmation' && lastOrder) {
    return (
      <div className="flex-grow pb-24 px-6 overflow-x-hidden">
        <SEO title="Order Confirmed | Splendour" />
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-card border border-white/5 rounded-[32px] md:rounded-[60px] p-6 md:p-12 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black italic uppercase tracking-tighter mb-4">Transmission Successful</h1>
            <p className="text-brand-muted text-sm md:text-lg leading-relaxed mb-12 max-w-xl mx-auto">
              Your architectural order <span className="text-white font-mono font-bold">#{lastOrder.id}</span> has been logged in the collective registry.
            </p>

            <div className="bg-black/20 rounded-[32px] md:rounded-[40px] p-6 md:p-8 mb-12 text-left">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">Recipient Node</h4>
                    <p className="font-bold">{lastOrder.customerName}</p>
                    <p className="text-sm text-brand-muted">{lastOrder.shippingAddress}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">Protocol Stats</h4>
                    <p className="font-bold uppercase tracking-tighter italic">{lastOrder.paymentMethod === 'bkash' ? 'bKash Verified' : 'Cash on Delivery'}</p>
                    <div className="mt-1 space-y-0.5">
                       <p className="text-[10px] text-brand-muted flex justify-between">Market Subtotal: <span>{formatPrice(lastOrder.total - lastOrder.deliveryCharge)}</span></p>
                       <p className="text-[10px] text-brand-muted flex justify-between">Logistics Fee: <span>{formatPrice(lastOrder.deliveryCharge)}</span></p>
                       <p className="text-sm text-brand-red font-mono font-black flex justify-between border-t border-white/5 pt-1 mt-1">Valuation Total: <span>{formatPrice(lastOrder.total)}</span></p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <button 
                onClick={() => navigate('/profile')}
                className="px-12 py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-brand-red hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3"
               >
                 <User size={18} /> View Profile Log
               </button>
               <button 
                onClick={() => navigate('/')}
                className="px-12 py-5 bg-white/5 border border-white/10 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
               >
                 Return to Hub <ArrowRight size={18} />
               </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow pb-24 px-6 overflow-x-hidden">
      <SEO title="Checkout | Splendour Architecture" />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Checkout Flow */}
        <div className="flex-grow space-y-12">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
             {[
               { id: 'shipping', label: 'Logistics', icon: Ship },
               { id: 'payment', label: 'Transaction', icon: CreditCard }
             ].map((step, i) => (
               <React.Fragment key={step.id}>
                 <div className={cn(
                   "flex items-center gap-3 transition-colors",
                   currentStep === step.id ? "text-white" : "text-brand-muted"
                 )}>
                   <div className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border transition-all",
                     currentStep === step.id ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20" : "bg-white/5 border-white/10"
                   )}>
                     <step.icon size={14} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest">{step.label}</span>
                 </div>
                 {i === 0 && <div className="w-12 h-[1px] bg-white/10" />}
               </React.Fragment>
             ))}
          </div>

          <div className="bg-brand-card border border-white/5 rounded-[40px] p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {currentStep === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <header>
                    <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter mb-2">Shipping Details</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Provide your delivery information</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted px-2">Recipient Name</label>
                       <input 
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none focus:bg-white/10 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted px-2">Phone Number</label>
                       <input 
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        placeholder="+880"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none focus:bg-white/10 transition-all"
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted px-2">Delivery Region</label>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {SHIPPING_REGIONS.map((region) => (
                             <button
                               key={region.id}
                               type="button"
                               onClick={() => setShippingInfo({ ...shippingInfo, shippingRegion: region.id as any })}
                               className={cn(
                                 "p-4 rounded-2xl border text-center transition-all",
                                 shippingInfo.shippingRegion === region.id 
                                   ? "bg-white text-black border-white" 
                                   : "bg-white/5 border-white/10 text-brand-muted hover:border-white/30"
                               )}
                             >
                               <p className="text-[10px] font-black uppercase tracking-tighter mb-1">{region.name}</p>
                               <p className="text-[10px] font-mono font-bold opacity-60">+{formatPrice(region.rate)}</p>
                             </button>
                           ))}
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted px-2">Full Address</label>
                       <input 
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        placeholder="House, Road, Area"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none focus:bg-white/10 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted px-2">City</label>
                       <input 
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        placeholder="Dhaka, etc."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none focus:bg-white/10 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted px-2">Post Code</label>
                       <input 
                        value={shippingInfo.postCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postCode: e.target.value })}
                        placeholder="1200"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none focus:bg-white/10 transition-all"
                       />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => setCurrentStep('payment')}
                      disabled={!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone || !shippingInfo.city}
                      className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-red hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      Continue to Payment <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                   <header className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter mb-2">Payment Method</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Select your preferred payment method</p>
                    </div>
                    <button 
                      onClick={() => setCurrentStep('shipping')}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-white transition-colors mb-2"
                    >
                      <ChevronLeft size={16} /> Back to Shipping
                    </button>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <button 
                      onClick={() => setPaymentMethod('bkash')}
                      className={cn(
                        "p-8 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group",
                        paymentMethod === 'bkash' 
                          ? "bg-brand-red/5 border-brand-red" 
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                     >
                        <div className="relative z-10">
                          <header className="flex justify-between items-center mb-6">
                             <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                paymentMethod === 'bkash' ? "bg-brand-red text-white" : "bg-white/10 text-brand-muted"
                             )}>
                               <Wallet size={24} />
                             </div>
                             {paymentMethod === 'bkash' && <CheckCircle2 className="text-brand-red" size={24} />}
                          </header>
                          <h4 className="text-xl font-display font-black italic uppercase mb-1">bKash (Personal)</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Secure mobile payment</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                           <Smartphone size={100} />
                        </div>
                     </button>

                     <button 
                      onClick={() => setPaymentMethod('COD')}
                      className={cn(
                        "p-8 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group",
                        paymentMethod === 'COD' 
                          ? "bg-white text-black border-white shadow-2xl" 
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                     >
                        <div className="relative z-10">
                          <header className="flex justify-between items-center mb-6">
                             <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                paymentMethod === 'COD' ? "bg-black text-white" : "bg-white/10 text-brand-muted"
                             )}>
                               <Ship size={24} />
                             </div>
                             {paymentMethod === 'COD' && <CheckCircle2 className="text-black" size={24} />}
                          </header>
                          <h4 className="text-xl font-display font-black italic uppercase mb-1">Cash on Delivery</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted opacity-60">Pay when you receive</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                           <Wallet size={100} />
                        </div>
                     </button>
                  </div>

                  {paymentMethod === 'bkash' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/30 border border-brand-red/20 rounded-[40px] p-12 space-y-8 text-center"
                    >
                       <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-red/20 shadow-[0_0_50px_rgba(226,19,110,0.1)]">
                          <img 
                            src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" 
                            alt="bKash" 
                            className="h-10 object-contain brightness-0 invert"
                          />
                       </div>
                       
                       <div>
                          <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter mb-2">Automated Gateway</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted max-w-xs mx-auto">
                            The Splendour system is connected to a secure bKash direct API protocol. 
                          </p>
                       </div>

                       {bkashDetails.transactionId ? (
                         <div className="bg-brand-red/10 border border-brand-red/30 rounded-3xl p-6 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 text-green-500 font-black uppercase tracking-widest text-[10px]">
                               <CheckCircle2 size={14} /> Protocol Verified
                            </div>
                            <p className="text-lg font-mono font-black text-white">{bkashDetails.transactionId}</p>
                         </div>
                       ) : (
                         <button 
                           onClick={() => setIsBKashModalOpen(true)}
                           className="bg-brand-red text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all shadow-2xl flex items-center justify-center gap-3 mx-auto group"
                         >
                            <Smartphone size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                            Open Automated bKash Terminal
                         </button>
                       )}
                    </motion.div>
                  )}

                  <div className="pt-6">
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={loading || (paymentMethod === 'bkash' && (!bkashDetails.bkashNumber || !bkashDetails.transactionId))}
                      className="w-full bg-brand-red text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-accent-dark transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Logging Transaction...
                        </>
                      ) : (
                        <>Commit Architectural Purchase <ShieldCheck size={18} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-[450px]">
           <div className="bg-brand-card border border-white/5 rounded-[40px] p-8 lg:p-12 sticky top-32">
              <h3 className="text-xl font-display font-black italic uppercase tracking-tighter mb-8 pb-4 border-b border-white/5">Order Blueprint</h3>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar mb-8">
                 {cart.map((item) => (
                   <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-20 bg-white/5 rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                         <h4 className="text-sm font-bold line-clamp-1">{item.name}</h4>
                         <p className="text-[10px] text-brand-muted uppercase tracking-widest mt-1">{item.category} &bull; {item.quantity} Units</p>
                         <p className="text-xs font-mono font-black text-brand-red mt-2">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                 <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">Market Asset Total</span>
                    <span className="font-mono font-bold">{formatPrice(subtotal)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">Logistics Fee</span>
                    <span className="text-white font-mono font-bold tracking-widest text-xs">{formatPrice(deliveryCharge)}</span>
                 </div>
                 <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Total Valuation</span>
                    <span className="text-3xl font-display font-black italic text-brand-red">{formatPrice(total)}</span>
                 </div>
              </div>

              <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                 <div className="flex items-center gap-3">
                    <Lock size={16} className="text-brand-muted" />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-muted">
                      SSL Encryption active. All architectural transactions are end-to-end encrypted under Splendour protocol v3.1
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>
      {/* bKash Automated Gateway Modal */}
      <BKashModal 
        isOpen={isBKashModalOpen}
        onClose={() => setIsBKashModalOpen(false)}
        total={total}
        onSuccess={(details) => {
          setBkashDetails(details);
          setIsBKashModalOpen(false);
          // Wait a second for modal to close then place order
          setTimeout(() => handlePlaceOrder(), 500);
        }}
      />
    </div>
  );
}
