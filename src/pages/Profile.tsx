import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Settings, Package, Heart, MapPin, 
  CreditCard, Bell, Shield, LogOut, Camera, 
  ChevronRight, Save, ShieldCheck, Mail, Phone,
  FileText, X
} from 'lucide-react';
import { auth } from '../firebase';
import { onAuthStateChanged, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { cn } from '../lib/utils';
import SEO from '../components/SEO';
import { useStore } from '../store/useStore';
import { formatPrice } from '../constants';
import { Order } from '../types';
import Invoice from '../components/Invoice';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings' | 'favorites'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const { orders, siteConfig, favorites, products } = useStore();
  const favoriteProducts = products.filter(p => favorites.includes(p.id));
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setName(currentUser.displayName || '');
        // For simplicity, we'll store metadata in localStorage for this demo
        // In a real app, you'd fetch this from Firestore/User Profile Doc
        const savedProfile = localStorage.getItem(`profile_${currentUser.uid}`);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setPhone(parsed.phone || '');
          setShippingAddress(parsed.shippingAddress || '');
          setBillingAddress(parsed.billingAddress || '');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const userOrders = orders.filter(o => o.userId === user?.uid || o.customerEmail === user?.email);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      
      const profileData = { phone, shippingAddress, billingAddress };
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profileData));
      
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-brand-red mb-4" />
          <p className="text-brand-muted uppercase tracking-[0.3em] text-[10px] font-black">Authenticating Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow pb-24 selection:bg-brand-red selection:text-white">
      <SEO title="Profile | Splendour" description="Manage your Splendour account and orders." />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-80">
            <div className="bg-brand-card border border-white/5 rounded-[40px] p-8 sticky top-32">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative group mb-6">
                  <div className="w-24 h-24 rounded-full bg-brand-red flex items-center justify-center text-3xl font-black italic shadow-2xl overflow-hidden border-4 border-white/5">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      user.displayName?.charAt(0) || user.email?.charAt(0)
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-xl hover:bg-brand-red hover:text-white transition-all transform scale-0 group-hover:scale-100">
                    <Camera size={14} />
                  </button>
                </div>
                <h2 className="text-2xl font-display font-black italic uppercase mb-1 tracking-tight">
                  {user.displayName || 'System User'}
                </h2>
                <div className="flex items-center gap-2 text-brand-muted text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-green-500" />
                  <span>Verified Identity</span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'profile', icon: User, label: 'Profile' },
                  { id: 'orders', icon: Package, label: 'Orders' },
                  { id: 'favorites', icon: Heart, label: 'Favorites' },
                  { id: 'settings', icon: Settings, label: 'Settings' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group",
                      activeTab === item.id 
                        ? "bg-brand-red text-white shadow-xl shadow-brand-red/20" 
                        : "text-brand-muted hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={18} />
                      <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className={cn("transition-transform", activeTab === item.id ? "rotate-90" : "group-hover:translate-x-1")} />
                  </button>
                ))}
                
                <div className="pt-4 mt-6 border-t border-white/5">
                  <button 
                    onClick={() => auth.signOut()}
                    className="w-full flex items-center gap-4 px-6 py-4 text-brand-red/60 hover:text-brand-red hover:bg-brand-red/5 rounded-2xl transition-all"
                  >
                    <LogOut size={18} />
                    <span className="font-black uppercase tracking-widest text-[10px]">Terminate Session</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Panel */}
          <main className="flex-grow">
            <div className="mb-12">
               <div className="flex items-center gap-2 text-brand-red font-bold uppercase tracking-widest text-[10px] mb-4">
                <Shield size={12} />
                <span>Security Protocol Active</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-none">
                {activeTab === 'profile' ? 'Profile' : activeTab === 'orders' ? 'Orders' : activeTab === 'favorites' ? 'Favorites' : 'Settings'}
              </h1>
            </div>

            <div className="bg-brand-card border border-white/5 rounded-[40px] overflow-hidden min-h-[600px]">
              {activeTab === 'profile' && (
                <div className="p-8 lg:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <section className="space-y-8">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted pb-4 border-b border-white/5">Identity Details</h3>
                       
                       <div className="space-y-6">
                         <div className="flex items-start gap-4">
                           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <User size={18} className="text-brand-red" />
                           </div>
                           <div className="flex-grow">
                             <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">Full Name</p>
                             {isEditing ? (
                               <input 
                                 value={name}
                                 onChange={(e) => setName(e.target.value)}
                                 className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-brand-red outline-none"
                               />
                             ) : (
                               <p className="text-lg font-bold">{user.displayName || 'Not Provided'}</p>
                             )}
                           </div>
                         </div>

                         <div className="flex items-start gap-4">
                           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <Mail size={18} className="text-brand-red" />
                           </div>
                           <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">Email</p>
                             <p className="text-lg font-bold">{user.email}</p>
                           </div>
                         </div>

                         <div className="flex items-start gap-4">
                           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <Phone size={18} className="text-brand-red" />
                           </div>
                           <div className="flex-grow">
                             <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">Phone Number</p>
                             {isEditing ? (
                               <input 
                                 value={phone}
                                 onChange={(e) => setPhone(e.target.value)}
                                 placeholder="+880..."
                                 className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-brand-red outline-none"
                               />
                             ) : (
                               <p className="text-lg font-bold">{phone || 'Not Logged'}</p>
                             )}
                           </div>
                         </div>

                         <div className="flex items-start gap-4">
                           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <MapPin size={18} className="text-brand-red" />
                           </div>
                           <div className="flex-grow">
                             <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">Shipping Address</p>
                             {isEditing ? (
                               <textarea 
                                 value={shippingAddress}
                                 onChange={(e) => setShippingAddress(e.target.value)}
                                 placeholder="House, Road, City..."
                                 className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-brand-red outline-none"
                               />
                             ) : (
                               <p className="text-lg font-bold">{shippingAddress || 'Address Missing'}</p>
                             )}
                           </div>
                         </div>

                         <div className="flex items-start gap-4">
                           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <CreditCard size={18} className="text-brand-red" />
                           </div>
                           <div className="flex-grow">
                             <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">Billing Address</p>
                             {isEditing ? (
                               <textarea 
                                 value={billingAddress}
                                 onChange={(e) => setBillingAddress(e.target.value)}
                                 placeholder="Same or different coordinate..."
                                 className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-brand-red outline-none"
                               />
                             ) : (
                               <p className="text-lg font-bold">{billingAddress || 'System Default'}</p>
                             )}
                           </div>
                         </div>

                         <div className="flex items-start gap-4">
                           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <ShieldCheck size={18} className="text-brand-red" />
                           </div>
                           <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">Member Level</p>
                             <p className="text-lg font-bold uppercase italic">{userOrders.length > 5 ? 'Elite Member' : 'Regular Member'}</p>
                           </div>
                         </div>
                       </div>

                       <div className="pt-8">
                         {isEditing ? (
                            <div className="flex gap-4">
                              <button 
                                onClick={handleUpdateProfile}
                                disabled={loading}
                                className="flex-grow bg-white text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-brand-red hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                {loading ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                              </button>
                              <button 
                                onClick={() => setIsEditing(false)}
                                className="px-6 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
                              >
                                Cancel
                              </button>
                            </div>
                         ) : (
                           <button 
                             onClick={() => setIsEditing(true)}
                             className="w-full bg-white/5 border border-white/10 hover:border-brand-red px-6 py-4 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
                           >
                             <Save size={16} />
                             Edit Profile
                           </button>
                         )}
                       </div>
                    </section>

                    <section className="space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted pb-4 border-b border-white/5">Account Stats</h3>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl text-center">
                            <Package className="mx-auto mb-3 text-brand-muted" size={20} />
                            <p className="text-2xl font-display font-black italic">{userOrders.length}</p>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-muted">Orders</p>
                         </div>
                         <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl text-center">
                            <Heart className="mx-auto mb-3 text-brand-muted" size={20} />
                            <p className="text-2xl font-display font-black italic">{favorites.length}</p>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-muted">Favorites</p>
                         </div>
                      </div>
                      
                      <div className="bg-brand-red/5 border border-brand-red/10 p-6 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10">
                          <h4 className="text-sm font-black uppercase tracking-widest mb-2 italic">Elite Member Status</h4>
                          <p className="text-xs text-brand-muted leading-relaxed">
                            You are a valued member of Splendour. Shop more to unlock exclusive rewards.
                          </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                           <Shield size={80} />
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="p-8 lg:p-12">
                   {favoriteProducts.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {favoriteProducts.map(product => (
                          <div key={product.id} className="flex gap-4 p-4 border border-white/5 rounded-2xl hover:border-brand-red transition-all group">
                             <div 
                               className="w-24 h-24 rounded-xl overflow-hidden cursor-pointer"
                               onClick={() => navigate(`/product/${product.id}`)}
                             >
                               <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             </div>
                             <div className="flex-grow flex flex-col justify-between">
                                <div>
                                   <Link to={`/product/${product.id}`} className="text-sm font-bold block mb-1 hover:text-brand-red transition-colors">{product.name}</Link>
                                   <p className="text-xs text-brand-muted uppercase tracking-widest">{product.category}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                   <p className="text-sm font-mono font-bold text-brand-red">{formatPrice(product.price)}</p>
                                   <button 
                                     onClick={() => useStore.getState().toggleFavorite(product.id)}
                                     className="text-brand-red hover:scale-110 transition-transform"
                                   >
                                     <Heart size={16} fill="currentColor" />
                                   </button>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="text-center py-24">
                        <Heart size={48} className="mx-auto text-brand-muted mb-6 opacity-20" />
                        <h3 className="text-2xl font-display font-black italic uppercase mb-2">No Favorites</h3>
                        <p className="text-brand-muted text-[10px] uppercase tracking-widest">You haven't saved any items yet.</p>
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="divide-y divide-white/5">
                  {userOrders.length > 0 ? (
                    userOrders.map((order) => (
                      <div key={order.id} className="p-8 hover:bg-white/[0.01] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black italic text-brand-red text-xl">
                            {order.items.length}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-sm font-mono font-bold">#{order.id.slice(0, 8)}</p>
                               <span className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[8px] font-black uppercase tracking-widest rounded-full">{order.status}</span>
                            </div>
                            <p className="text-xs text-brand-muted tracking-wide">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                           <p className="text-xl font-mono font-black italic text-brand-red">{formatPrice(order.total)}</p>
                           <button 
                             onClick={() => setSelectedOrder(order)}
                             className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                           >
                             <FileText size={14} /> Receipt
                           </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 lg:p-12 text-center py-32">
                       <Package size={48} className="mx-auto text-brand-muted mb-6 opacity-20" />
                       <h3 className="text-2xl font-display font-black italic uppercase mb-2">Registry Empty</h3>
                       <p className="text-brand-muted text-xs uppercase tracking-widest">No transaction logs detected in local history</p>
                       <Link 
                         to="/info/shop"
                         className="mt-8 inline-block bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-red hover:text-white transition-all shadow-2xl"
                       >
                         Initialize Acquisition
                       </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-8 lg:p-12">
                   <div className="space-y-8 max-w-xl">
                      <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted border-b border-white/5 pb-4">Communication Hub</h3>
                        <div className="flex items-center justify-between">
                           <div>
                             <p className="text-sm font-bold">New Asset Alerts</p>
                             <p className="text-[10px] text-brand-muted uppercase tracking-widest">Notification via mobile/email</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                           </label>
                        </div>
                      </div>

                      <div className="space-y-6 pt-8">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted border-b border-white/5 pb-4">Security Vectors</h3>
                         <button className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between group hover:border-brand-red transition-all">
                            <span>Update Encryption Key</span>
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                         </button>
                         <button className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between group hover:border-brand-red transition-all">
                            <span>Manage Two-Factor Protocol</span>
                             <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                         </button>
                      </div>

                      <div className="pt-12 text-center border-t border-white/5">
                         <p className="text-[8px] text-brand-muted uppercase tracking-[0.4em] font-black">Splendour Collective Security Alliance</p>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Invoice Overlay */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="relative max-h-full overflow-y-auto no-scrollbar"
              >
                <Invoice order={selectedOrder} config={siteConfig.invoice} />
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="absolute -top-12 right-0 p-3 bg-white/10 rounded-full hover:bg-brand-red transition-all text-white"
                >
                  <X size={24} />
                </button>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
