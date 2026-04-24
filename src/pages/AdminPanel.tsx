import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit2, Trash2, LayoutDashboard, Package, Settings, 
  Search, X, Save, Image as ImageIcon, DollarSign, Tag, 
  Folder, List, MousePointer2, AlertCircle, Info, CheckCircle2,
  Users, Zap, ShoppingBag, FileText, Layout, Globe, Facebook, 
  Instagram, PlusCircle, Trash, Menu, ArrowRight, Mail,
  Bot, Sparkles, Shield, Video, LogIn, ShieldAlert, LayoutGrid, Camera,
  RefreshCcw, Copy, Monitor
} from 'lucide-react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firebaseOps } from '../lib/firebaseOps';
import { useStore } from '../store/useStore';
import { Product, Order, SiteConfig } from '../types';
import { cn } from '../lib/utils';
import { formatPrice, categories as availableCategories, sizes as availableSizes, colors as availableColors } from '../constants';
import Invoice from '../components/Invoice';
import SEO from '../components/SEO';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Sub-components to keep Main Component lean ---

function StatCard({ label, value, icon: Icon, trend, color = "red" }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-card/50 border border-white/5 p-8 rounded-[40px] group hover:border-brand-red/30 transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-brand-red/10 group-hover:text-brand-red transition-all">
          <Icon size={24} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-green-500/10 text-green-500 rounded-lg">
          {trend}
        </span>
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mb-2">{label}</h4>
      <p className="text-4xl font-display font-black tracking-tighter">{value}</p>
    </motion.div>
  );
}

export default function AdminPanel() {
  const [user, setUser] = useState<any>(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'coupons' | 'orders' | 'media' | 'inquiries' | 'config'>('dashboard');
  const { 
    products, addProduct, updateProduct, removeProduct, 
    orders, updateOrder, siteConfig, updateSiteConfig, 
    messages, coupons, addCoupon, setCoupons, updateCoupon, removeCoupon
  } = useStore();

  const isMounted = useRef(true);
  const [tempSiteConfig, setTempSiteConfig] = useState<SiteConfig>(siteConfig);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Per-size stock state for the modal
  const [productSizeStock, setProductSizeStock] = useState<Record<string, number>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!isMounted.current) return;
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        return;
      }
      const email = u.email?.toLowerCase();
      if (email === 'saifysamit@gmail.com' || email === 'splendourstreetwear@gmail.com') {
        setIsAdmin(true);
      } else {
        const d = await getDoc(doc(db, 'admins', u.uid));
        setIsAdmin(d.exists());
      }
    });
    return () => { isMounted.current = false; unsub(); };
  }, []);

  useEffect(() => { if (siteConfig) setTempSiteConfig(siteConfig); }, [siteConfig]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (error) { console.error(error); }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Calculate total stock from sizeStock
    const totalStock = Object.values(productSizeStock).reduce((a, b) => a + b, 0);

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      discountPrice: formData.get('discountPrice') ? Number(formData.get('discountPrice')) : undefined,
      image: formData.get('image') as string,
      images: (formData.get('images') as string).split(',').map(s => s.trim()),
      description: formData.get('description') as string,
      tag: formData.get('tag') as string,
      category: formData.get('category') as string,
      sizes: Array.from(formData.getAll('sizes')) as string[],
      colors: Array.from(formData.getAll('colors')) as string[],
      sizeStock: productSizeStock,
      stock: totalStock,
      manufacturingCost: formData.get('manufacturingCost') ? Number(formData.get('manufacturingCost')) : undefined,
      tags: (formData.get('seo_tags') as string)?.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: editingProduct?.createdAt || new Date().toISOString()
    };

    try {
      await firebaseOps.saveProduct(newProduct);
      if (editingProduct) updateProduct(newProduct);
      else addProduct(newProduct);
      showNotification('success', 'Asset synchronized');
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      showNotification('error', 'Sync failure');
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedProducts = Array.from(formData.getAll('applicableProducts')) as string[];
    
    const newCoupon: any = {
      id: editingCoupon?.id || Date.now().toString(),
      code: (formData.get('code') as string).toUpperCase(),
      discountType: formData.get('discountType') as any,
      discountAmount: Number(formData.get('discountAmount')),
      minPurchase: Number(formData.get('minPurchase')) || 0,
      applicableProductIds: selectedProducts.length > 0 ? selectedProducts : undefined,
      expiryDate: formData.get('expiryDate') as string,
      usageLimit: Number(formData.get('usageLimit')) || undefined,
      usageCount: editingCoupon?.usageCount || 0,
      isActive: formData.get('isActive') === 'on',
      createdAt: editingCoupon?.createdAt || new Date().toISOString()
    };

    try {
      await firebaseOps.saveCoupon(newCoupon);
      if (editingCoupon) updateCoupon(newCoupon);
      else addCoupon(newCoupon);
      showNotification('success', 'Coupon protocol logged');
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
    } catch (error) {
      showNotification('error', 'Sync failure');
    }
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductSizeStock(p.sizeStock || {});
    setIsProductModalOpen(true);
  };

  const handleDuplicateProduct = (p: Product) => {
    const duplicated: Product = {
      ...p,
      id: Date.now().toString(),
      name: `${p.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setEditingProduct(duplicated);
    setProductSizeStock(p.sizeStock || {});
    setIsProductModalOpen(true);
  };

  const handleSaveSiteConfig = async () => {
    try {
      await firebaseOps.saveSiteConfig(tempSiteConfig);
      updateSiteConfig(tempSiteConfig);
      showNotification('success', 'Architecture updated');
    } catch (error) {
      showNotification('error', 'Update failure');
    }
  };

  // --- Auth Guards ---
  if (isAdmin === null) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Bot className="text-brand-red" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted">Decrypting Handshake...</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex-grow flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-brand-card border border-white/5 p-12 rounded-[40px]">
        <ShieldAlert className="mx-auto text-brand-red mb-8" size={64} />
        <h2 className="text-4xl font-display font-black uppercase mb-4">Access Denied</h2>
        <p className="text-brand-muted text-sm mb-8 italic">Your node identity is not authorized.</p>
        <button onClick={handleLogin} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-red hover:text-white transition-all">Authenticate Node</button>
      </div>
    </div>
  );

  return (
    <div className="flex-grow text-white flex">
      <SEO title="Control Station | Admin" description="Master administrative control." />
      
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 border-r border-white/5 flex-col bg-brand-card/30 h-[calc(100vh-80px)]">
        <nav className="flex-grow p-6 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
            { id: 'products', icon: Package, label: 'Inventory' },
            { id: 'coupons', icon: Tag, label: 'Coupons' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'media', icon: Video, label: 'Media' },
            { id: 'inquiries', icon: Mail, label: 'Inquiries' },
            { id: 'config', icon: Settings, label: 'System' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative text-left",
                activeTab === item.id ? "bg-brand-red text-white" : "text-brand-muted hover:bg-white/5"
              )}
            >
              <item.icon size={18} />
              <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="active" className="absolute left-0 w-1 h-2/3 bg-white rounded-full" />}
            </button>
          ))}
        </nav>
        <div className="p-8 opacity-20 text-[8px] font-black uppercase tracking-widest text-center">V.5.0 ARCHITECTURAL</div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-h-[calc(100vh-80px)] no-scrollbar">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
           <h2 className="text-3xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">
             {activeTab.toUpperCase()}
           </h2>
           <div className="flex gap-4 w-full md:w-auto">
             {activeTab === 'products' && (
               <button 
                  onClick={() => { setEditingProduct(null); setProductSizeStock({}); setIsProductModalOpen(true); }}
                  className="bg-white text-black px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all shadow-2xl"
               >
                 <Plus size={20} /> New Identity
               </button>
             )}
             {activeTab === 'coupons' && (
               <button 
                  onClick={() => { setEditingCoupon(null); setIsCouponModalOpen(true); }}
                  className="bg-white text-black px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all shadow-2xl"
               >
                 <Plus size={20} /> New Protocol
               </button>
             )}
             <div className="bg-brand-card/50 border border-white/10 p-4 rounded-3xl flex items-center gap-4 flex-grow md:flex-grow-0">
               <Search className="text-brand-muted" size={18} />
               <input 
                 placeholder="Search Registry..." 
                 className="bg-transparent border-none outline-none text-xs font-mono w-full md:w-48"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </div>
        </div>

        {/* --- TABS --- */}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
              <StatCard label="Revenue" value={formatPrice(orders.reduce((s, o) => s + o.total, 0))} icon={DollarSign} trend="+12%" />
              <StatCard label="Orders" value={orders.length} icon={ShoppingBag} trend="+5" />
              <StatCard label="Inventory" value={products.length} icon={Package} trend="Stable" />
              <StatCard label="Cost Analysis" value={formatPrice(products.reduce((s, p) => s + ((p.manufacturingCost || 0) * (p.stock || 0)), 0))} icon={Zap} trend="Live" />
              <StatCard label="Customers" value="1.5k" icon={Users} trend="+8%" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-brand-card/30 border border-white/5 rounded-[40px] p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-red mb-8">Recent Traffic</h3>
                  <div className="space-y-6">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm">{o.customerName}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{o.id.slice(0, 8)}</p>
                        </div>
                        <p className="font-mono font-bold text-brand-red">{formatPrice(o.total)}</p>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="bg-brand-card/30 border border-white/5 rounded-[40px] p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-red mb-8">Low Stock Alerts</h3>
                  <div className="space-y-6">
                    {products.filter(p => p.stock < 10).slice(0, 5).map(p => (
                      <div key={p.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                           <img src={p.image} className="w-10 h-10 rounded-xl object-cover" />
                           <p className="font-bold">{p.name}</p>
                        </div>
                        <span className="text-brand-red font-black font-mono">{p.stock} units</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Inventory */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
              <div key={p.id} className="bg-brand-card/50 border border-white/5 rounded-3xl overflow-hidden group">
                <div className="aspect-[3/4] relative overflow-hidden bg-brand-bg">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => openEditProduct(p)} className="p-3 bg-white/20 backdrop-blur-xl rounded-full hover:bg-brand-red text-white"><Edit2 size={16} /></button>
                    <button onClick={() => handleDuplicateProduct(p)} className="p-3 bg-white/20 backdrop-blur-xl rounded-full hover:bg-brand-red text-white"><Copy size={16} /></button>
                    <button 
                      onClick={() => confirm('Purge Asset?') && firebaseOps.deleteProduct(p.id).then(() => removeProduct(p.id))} 
                      className="p-3 bg-white/20 backdrop-blur-xl rounded-full hover:bg-brand-red text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-display font-black uppercase mb-1 truncate">{p.name}</h4>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted">
                    <span>{formatPrice(p.price)}</span>
                    <span>Total: {p.stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coupons */}
        {activeTab === 'coupons' && (
          <div className="bg-brand-card/30 border border-white/5 rounded-[32px] overflow-x-auto">
             <table className="w-full text-left">
               <thead className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-brand-muted bg-white/[0.02]">
                 <tr>
                   <th className="p-6">Code</th>
                   <th className="p-6">Discount</th>
                   <th className="p-6">Min Purchase</th>
                   <th className="p-6">Usage</th>
                   <th className="p-6">Status</th>
                   <th className="p-6">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                   <tr key={c.id} className="text-xs hover:bg-white/[0.01]">
                     <td className="p-6 font-mono font-bold text-brand-red">{c.code}</td>
                     <td className="p-6">
                        {c.discountType === 'percentage' ? `${c.discountAmount}%` : formatPrice(c.discountAmount)}
                     </td>
                     <td className="p-6 font-mono">{formatPrice(c.minPurchase || 0)}</td>
                     <td className="p-6 text-brand-muted">
                        {c.usageCount} / {c.usageLimit || '∞'}
                     </td>
                     <td className="p-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                          c.isActive ? "bg-green-500/10 text-green-500" : "bg-brand-red/10 text-brand-red"
                        )}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                     </td>
                     <td className="p-6">
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingCoupon(c); setIsCouponModalOpen(true); }} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                             <Edit2 size={14} className="text-brand-muted hover:text-white" />
                           </button>
                           <button onClick={() => confirm('Purge Protocol?') && firebaseOps.deleteCoupon(c.id).then(() => removeCoupon(c.id))} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                             <Trash2 size={14} className="text-brand-muted hover:text-brand-red" />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="bg-brand-card/30 border border-white/5 rounded-[32px] overflow-x-auto">
             <table className="w-full text-left">
               <thead className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-brand-muted bg-white/[0.02]">
                 <tr>
                   <th className="p-6">ID</th>
                   <th className="p-6">Node Name</th>
                   <th className="p-6">Value</th>
                   <th className="p-6">Status</th>
                   <th className="p-6">Receipt</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {orders.map(o => (
                   <tr key={o.id} className="text-xs hover:bg-white/[0.01]">
                     <td className="p-6 font-mono text-[10px] opacity-40">{o.id.slice(0, 8)}</td>
                     <td className="p-6 font-bold">{o.customerName}</td>
                     <td className="p-6 font-mono font-black text-brand-red">{formatPrice(o.total)}</td>
                     <td className="p-6">
                        <select 
                          value={o.status}
                          onChange={(e) => updateOrder({ ...o, status: e.target.value as any })}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                     </td>
                     <td className="p-6">
                       <button onClick={() => { setSelectedOrder(o); setIsInvoiceModalOpen(true); }} className="text-brand-muted hover:text-white flex items-center gap-2">
                         <FileText size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">View Receipt</span>
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {/* Media Architecture View */}
        {activeTab === 'media' && (
          <div className="max-w-5xl mx-auto space-y-12 pb-24">
            {/* Hero Section */}
            <div className="bg-brand-card/30 border border-white/5 rounded-[40px] p-12">
               <h3 className="text-sm font-black uppercase tracking-[0.5em] text-brand-red mb-12 flex items-center gap-4">
                  <Zap size={24} /> Hero Visual Engine
               </h3>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Main Hero Background Video/Image</label>
                  <input 
                     value={tempSiteConfig.storyVideos?.hero || ''}
                     onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, storyVideos: { ...tempSiteConfig.storyVideos, hero: e.target.value } as any })}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono"
                     placeholder="URL for the very first landing page banner"
                  />
               </div>
            </div>

            {/* Showcase Section (A NEW ERA OF STREET LUXURY) */}
            <div className="bg-brand-card/30 border border-white/5 rounded-[40px] p-12">
               <h3 className="text-sm font-black uppercase tracking-[0.5em] text-brand-red mb-12 flex items-center gap-4">
                  <Monitor size={24} /> Showcase Grid (A New Era of Street Luxury)
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-4">
                       <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest">Asset {idx + 1}</span>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Image URL</label>
                          <input 
                            value={tempSiteConfig.showcaseMedia?.[idx]?.image || ''} 
                            onChange={(e) => {
                              const newShowcase = [...(tempSiteConfig.showcaseMedia || [])];
                              if (!newShowcase[idx]) newShowcase[idx] = { image: '', video: '' };
                              newShowcase[idx] = { ...newShowcase[idx], image: e.target.value };
                              setTempSiteConfig({ ...tempSiteConfig, showcaseMedia: newShowcase });
                            }} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-mono" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Video URL (Optional)</label>
                          <input 
                            value={tempSiteConfig.showcaseMedia?.[idx]?.video || ''} 
                            onChange={(e) => {
                              const newShowcase = [...(tempSiteConfig.showcaseMedia || [])];
                              if (!newShowcase[idx]) newShowcase[idx] = { image: '', video: '' };
                              newShowcase[idx] = { ...newShowcase[idx], video: e.target.value };
                              setTempSiteConfig({ ...tempSiteConfig, showcaseMedia: newShowcase });
                            }} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-mono" 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Collections Section */}
            <div className="bg-brand-card/30 border border-white/5 rounded-[40px] p-12">
                <div className="flex items-center justify-between mb-12">
                   <h3 className="text-sm font-black uppercase tracking-[0.5em] text-brand-red flex items-center gap-4">
                      <LayoutGrid size={24} /> Collections Gallery Configuration
                   </h3>
                   <button 
                      onClick={() => {
                        const newCols = [...(tempSiteConfig.collections || [])];
                        newCols.push({ name: '', tag: '', image: '', video: '', desc: '', year: (new Date().getFullYear().toString()), link: '/shop' });
                        setTempSiteConfig({ ...tempSiteConfig, collections: newCols });
                      }}
                      className="bg-brand-red text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 hover:bg-brand-accent-dark transition-all"
                   >
                      <PlusCircle size={16} /> Add Collection
                   </button>
                </div>
               <div className="space-y-8">
                  {(tempSiteConfig.collections || []).map((col: any, idx: number) => (
                    <div key={idx} className="p-8 bg-black/20 rounded-[32px] border border-white/5 space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Collection Name</label>
                             <input value={col.name} onChange={(e) => {
                               const newCols = [...(tempSiteConfig.collections || [])];
                               newCols[idx] = { ...col, name: e.target.value };
                               setTempSiteConfig({ ...tempSiteConfig, collections: newCols });
                             }} className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-sm uppercase font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Tag (e.g. NEW, CORE)</label>
                             <input value={col.tag} onChange={(e) => {
                               const newCols = [...(tempSiteConfig.collections || [])];
                               newCols[idx] = { ...col, tag: e.target.value };
                               setTempSiteConfig({ ...tempSiteConfig, collections: newCols });
                             }} className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-sm uppercase font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Main Image URL</label>
                             <input value={col.image} onChange={(e) => {
                               const newCols = [...(tempSiteConfig.collections || [])];
                               newCols[idx] = { ...col, image: e.target.value };
                               setTempSiteConfig({ ...tempSiteConfig, collections: newCols });
                             }} className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-[10px] font-mono" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Video Asset (Optional)</label>
                             <input value={col.video || ''} onChange={(e) => {
                               const newCols = [...(tempSiteConfig.collections || [])];
                               newCols[idx] = { ...col, video: e.target.value };
                               setTempSiteConfig({ ...tempSiteConfig, collections: newCols });
                             }} className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-[10px] font-mono" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Release Year</label>
                             <input value={col.year} onChange={(e) => {
                               const newCols = [...(tempSiteConfig.collections || [])];
                               newCols[idx] = { ...col, year: e.target.value };
                               setTempSiteConfig({ ...tempSiteConfig, collections: newCols });
                             }} className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-[10px] font-mono" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Action Link</label>
                             <input value={col.link} onChange={(e) => {
                               const newCols = [...(tempSiteConfig.collections || [])];
                               newCols[idx] = { ...col, link: e.target.value };
                               setTempSiteConfig({ ...tempSiteConfig, collections: newCols });
                             }} className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-[10px] font-mono" />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Archive Narrative (Description)</label>
                             <textarea value={col.desc} onChange={(e) => {
                               const newCols = [...(tempSiteConfig.collections || [])];
                               newCols[idx] = { ...col, desc: e.target.value };
                               setTempSiteConfig({ ...tempSiteConfig, collections: newCols });
                             }} className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-sm leading-relaxed resize-none h-24" />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Lookbook Section */}
            <div className="bg-brand-card/30 border border-white/5 rounded-[40px] p-12">
                <div className="flex items-center justify-between mb-12">
                   <h3 className="text-sm font-black uppercase tracking-[0.5em] text-brand-red flex items-center gap-4">
                      <Camera size={24} /> Lookbook Content Hierarchy
                   </h3>
                   <button 
                      onClick={() => {
                        const newLbs = [...(tempSiteConfig.lookbooks || [])];
                        newLbs.push({ 
                          id: (newLbs.length + 1).toString().padStart(2, '0'), 
                          title: '', 
                          year: (new Date().getFullYear().toString()), 
                          image: '', 
                          video: '', 
                          type: 'Campaign', 
                          desc: '', 
                          link: '/info/collections' 
                        });
                        setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                      }}
                      className="bg-brand-red text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 hover:bg-brand-accent-dark transition-all"
                   >
                      <PlusCircle size={16} /> Add Lookbook
                   </button>
                </div>
               
               <div className="space-y-10">
                  {(tempSiteConfig.lookbooks || []).map((lb: any, idx: number) => (
                    <div key={idx} className="p-8 bg-black/20 rounded-[32px] border border-white/5 space-y-8 group transition-all hover:border-brand-red/30">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">ID Index</label>
                          <input value={lb.id} onChange={(e) => {
                            const newLbs = [...(tempSiteConfig.lookbooks || [])];
                            newLbs[idx] = { ...lb, id: e.target.value };
                            setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs font-mono" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Asset Title</label>
                          <input 
                            value={lb.title} 
                            onChange={(e) => {
                              const newLbs = [...(tempSiteConfig.lookbooks || [])];
                              newLbs[idx] = { ...lb, title: e.target.value };
                              setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                            }}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs uppercase font-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Release Year</label>
                          <input value={lb.year} onChange={(e) => {
                            const newLbs = [...(tempSiteConfig.lookbooks || [])];
                            newLbs[idx] = { ...lb, year: e.target.value };
                            setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs font-mono" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Visual Identity (Type)</label>
                          <input value={lb.type} onChange={(e) => {
                            const newLbs = [...(tempSiteConfig.lookbooks || [])];
                            newLbs[idx] = { ...lb, type: e.target.value };
                            setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs uppercase" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Action Link (Redirect Target)</label>
                          <input value={lb.link} onChange={(e) => {
                            const newLbs = [...(tempSiteConfig.lookbooks || [])];
                            newLbs[idx] = { ...lb, link: e.target.value };
                            setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs font-mono" placeholder="/shop" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Primary Image link</label>
                          <input value={lb.image} onChange={(e) => {
                            const newLbs = [...(tempSiteConfig.lookbooks || [])];
                            newLbs[idx] = { ...lb, image: e.target.value };
                            setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs font-mono" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Dynamic Video Loop (Optional)</label>
                          <input value={lb.video || ''} onChange={(e) => {
                            const newLbs = [...(tempSiteConfig.lookbooks || [])];
                            newLbs[idx] = { ...lb, video: e.target.value };
                            setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs font-mono" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Visual Narrative (Description)</label>
                          <textarea value={lb.desc} onChange={(e) => {
                            const newLbs = [...(tempSiteConfig.lookbooks || [])];
                            newLbs[idx] = { ...lb, desc: e.target.value };
                            setTempSiteConfig({ ...tempSiteConfig, lookbooks: newLbs });
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs leading-relaxed resize-none h-20" />
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Story Videos Section */}
            <div className="bg-brand-card/30 border border-white/5 rounded-[40px] p-12">
               <h3 className="text-sm font-black uppercase tracking-[0.5em] text-brand-red mb-12 flex items-center gap-4">
                  <FileText size={24} /> Brand Story Narrative Media
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Philosophy Video URL</label>
                     <input 
                        value={tempSiteConfig.storyVideos?.philosophy || ''}
                        onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, storyVideos: { ...tempSiteConfig.storyVideos, philosophy: e.target.value } as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Craftsmanship Video URL</label>
                     <input 
                        value={tempSiteConfig.storyVideos?.crafting || ''}
                        onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, storyVideos: { ...tempSiteConfig.storyVideos, crafting: e.target.value } as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Mission Video URL</label>
                     <input 
                        value={tempSiteConfig.storyVideos?.mission || ''}
                        onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, storyVideos: { ...tempSiteConfig.storyVideos, mission: e.target.value } as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Modeling Video 01</label>
                     <input 
                        value={tempSiteConfig.storyVideos?.modeling1 || ''}
                        onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, storyVideos: { ...tempSiteConfig.storyVideos, modeling1: e.target.value } as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Modeling Video 02</label>
                     <input 
                        value={tempSiteConfig.storyVideos?.modeling2 || ''}
                        onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, storyVideos: { ...tempSiteConfig.storyVideos, modeling2: e.target.value } as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Modeling Video 03</label>
                     <input 
                        value={tempSiteConfig.storyVideos?.modeling3 || ''}
                        onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, storyVideos: { ...tempSiteConfig.storyVideos, modeling3: e.target.value } as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono"
                     />
                  </div>
               </div>
            </div>

            <button 
              onClick={handleSaveSiteConfig}
              className="w-full mt-12 bg-brand-red text-white py-6 rounded-[40px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all shadow-2xl"
            >
              <Save size={24} /> Deploy Media Architecture
            </button>
          </div>
        )}

        {/* Inquiry Logs View */}
        {activeTab === 'inquiries' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layoutId={msg.id}
                  className={cn(
                    "bg-brand-card/30 border p-8 rounded-[40px] group transition-all",
                    msg.status === 'new' ? "border-brand-red/30 bg-brand-red/5" : "border-white/5"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-brand-red/10 transition-all">
                      <Mail size={24} className={msg.status === 'new' ? "text-brand-red" : "text-brand-muted"} />
                    </div>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                      msg.status === 'new' ? "bg-brand-red text-white border-brand-red/20" : "bg-white/5 text-brand-muted border-white/10"
                    )}>
                      {msg.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold truncate">{msg.subject || 'Incoming Transmission'}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mt-1">{msg.name}</p>
                    </div>
                    
                    <p className="text-xs text-brand-muted leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                      {msg.message}
                    </p>
                    
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                       <a href={`mailto:${msg.email}`} className="text-[10px] font-black text-brand-red uppercase tracking-widest hover:underline flex items-center gap-2">
                         <ArrowRight size={10} /> Respond via Node
                       </a>
                       <p className="text-[9px] font-mono text-brand-muted opacity-30">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Awaiting sync...'}</p>
                    </div>

                    <div className="flex gap-2">
                      {msg.status !== 'read' && (
                        <button 
                          onClick={() => firebaseOps.updateMessageStatus(msg.id, 'read')}
                          className="flex-grow p-3 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                        >
                          Mark Viewed
                        </button>
                      )}
                      <button 
                        onClick={async () => {
                          if (confirm('Permanently purge this entry log?')) {
                            await firebaseOps.deleteMessage(msg.id);
                          }
                        }}
                        className="p-3 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-xl hover:bg-brand-red hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {messages.length === 0 && (
                <div className="col-span-full py-32 text-center opacity-30">
                  <Mail size={64} className="mx-auto mb-6" />
                  <p className="text-xs font-black uppercase tracking-[0.4em]">No Narrative Inquiries Logged</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Configuration View */}
        {activeTab === 'config' && (
           <div className="max-w-4xl mx-auto space-y-12 pb-24">
              {/* AI Assistant Config */}
              <div className="bg-brand-card/40 border border-white/5 rounded-[40px] p-12">
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-4 rounded-2xl transition-all",
                        tempSiteConfig.isChatbotEnabled ? "bg-brand-red/10 text-brand-red" : "bg-white/5 text-brand-muted"
                      )}>
                        <Bot size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-black uppercase tracking-tighter">AI Architectural Assistant</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Configure the Gemini-powered customer guide interface</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setTempSiteConfig({ ...tempSiteConfig, isChatbotEnabled: !tempSiteConfig.isChatbotEnabled })}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                      tempSiteConfig.isChatbotEnabled 
                        ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                        : "bg-white/5 text-brand-muted border border-white/10"
                    )}
                   >
                     {tempSiteConfig.isChatbotEnabled ? 'Active' : 'Offline'}
                   </button>
                 </div>
              </div>

              {/* Footer & Social Config */}
              <div className="bg-brand-card/40 border border-white/5 rounded-[40px] p-12">
                 <h3 className="text-sm font-black uppercase tracking-[0.5em] text-brand-red mb-12 flex items-center gap-4">
                    <Globe size={24} /> Footer & Social Configuration
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Instagram Handle</label>
                          <input 
                             value={tempSiteConfig.footer?.instagramHandle || ''}
                             onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, footer: { ...tempSiteConfig.footer, instagramHandle: e.target.value } })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Facebook URL</label>
                          <input 
                             value={tempSiteConfig.footer?.social?.find((s: any) => s.platform === 'Facebook')?.url || ''}
                             onChange={(e) => {
                               const newSocial = [...(tempSiteConfig.footer?.social || [])];
                               const idx = newSocial.findIndex((s: any) => s.platform === 'Facebook');
                               if (idx > -1) newSocial[idx].url = e.target.value;
                               else newSocial.push({ platform: 'Facebook', url: e.target.value });
                               setTempSiteConfig({ ...tempSiteConfig, footer: { ...tempSiteConfig.footer, social: newSocial } });
                             }}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none"
                             placeholder="https://facebook.com/..."
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">YouTube URL</label>
                          <input 
                             value={tempSiteConfig.footer?.social?.find((s: any) => s.platform === 'Youtube')?.url || ''}
                             onChange={(e) => {
                               const newSocial = [...(tempSiteConfig.footer?.social || [])];
                               const idx = newSocial.findIndex((s: any) => s.platform === 'Youtube');
                               if (idx > -1) newSocial[idx].url = e.target.value;
                               else newSocial.push({ platform: 'Youtube', url: e.target.value });
                               setTempSiteConfig({ ...tempSiteConfig, footer: { ...tempSiteConfig.footer, social: newSocial } });
                             }}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none"
                             placeholder="https://youtube.com/@..."
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">TikTok URL</label>
                          <input 
                             value={tempSiteConfig.footer?.social?.find((s: any) => s.platform === 'TikTok')?.url || ''}
                             onChange={(e) => {
                               const newSocial = [...(tempSiteConfig.footer?.social || [])];
                               const idx = newSocial.findIndex((s: any) => s.platform === 'TikTok');
                               if (idx > -1) newSocial[idx].url = e.target.value;
                               else newSocial.push({ platform: 'TikTok', url: e.target.value });
                               setTempSiteConfig({ ...tempSiteConfig, footer: { ...tempSiteConfig.footer, social: newSocial } });
                             }}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none"
                             placeholder="https://tiktok.com/@..."
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">WhatsApp Number</label>
                          <input 
                             value={tempSiteConfig.footer?.whatsapp || ''}
                             onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, footer: { ...tempSiteConfig.footer, whatsapp: e.target.value } })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none"
                             placeholder="88017..."
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">bKash Manual Number</label>
                          <input 
                             value={tempSiteConfig.footer?.bkashNumber || ''}
                             onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, footer: { ...tempSiteConfig.footer, bkashNumber: e.target.value } })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none"
                             placeholder="01XXXXXXXXX"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Email (Contact)</label>
                          <input 
                             value={tempSiteConfig.footer?.email || ''}
                             onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, footer: { ...tempSiteConfig.footer, email: e.target.value } })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none"
                          />
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Address (Display)</label>
                          <input 
                             value={tempSiteConfig.footer?.address || ''}
                             onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, footer: { ...tempSiteConfig.footer, address: e.target.value } })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-brand-red outline-none"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Offer Popup Config */}
              <div className="bg-brand-card/40 border border-white/5 rounded-[40px] p-12">
                 <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "p-4 rounded-2xl transition-all",
                         tempSiteConfig.offerPopup?.enabled ? "bg-brand-red/10 text-brand-red" : "bg-white/5 text-brand-muted"
                       )}>
                         <Sparkles size={32} />
                       </div>
                       <div>
                         <h3 className="text-xl font-display font-black uppercase tracking-tighter">Offer Popup Protocol</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Special marketing engagement interface</p>
                       </div>
                    </div>
                    <button 
                     onClick={() => setTempSiteConfig({ 
                       ...tempSiteConfig, 
                       offerPopup: { ...tempSiteConfig.offerPopup, enabled: !tempSiteConfig.offerPopup?.enabled } as any
                     })}
                     className={cn(
                       "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                       tempSiteConfig.offerPopup?.enabled ? "bg-brand-red text-white" : "bg-white/5 text-brand-muted"
                     )}
                    >
                      {tempSiteConfig.offerPopup?.enabled ? 'Active' : 'Offline'}
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Media URL</label>
                       <input 
                          value={tempSiteConfig.offerPopup?.mediaUrl || ''}
                          onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, offerPopup: { ...tempSiteConfig.offerPopup, mediaUrl: e.target.value } as any })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Media Type</label>
                       <select 
                          value={tempSiteConfig.offerPopup?.mediaType}
                          onChange={(e) => setTempSiteConfig({ ...tempSiteConfig, offerPopup: { ...tempSiteConfig.offerPopup, mediaType: e.target.value as any } as any })}
                          className="w-full bg-brand-bg border border-white/10 rounded-2xl p-5 text-xs text-white appearance-none"
                       >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                       </select>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleSaveSiteConfig}
                className="w-full mt-12 bg-white text-black py-6 rounded-[40px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-brand-red hover:text-white transition-all shadow-2xl"
              >
                <Save size={24} /> Update System Architecture
              </button>
           </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Product Modal with per-size stock */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-4xl bg-brand-card border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
               <form onSubmit={handleSaveProduct} className="flex flex-col md:flex-row w-full overflow-y-auto no-scrollbar">
                  <div className="w-full md:w-1/2 p-10 space-y-6 bg-black/20">
                     <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter">Asset Identity</h3>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Name</label>
                           <input name="name" required defaultValue={editingProduct?.name} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-brand-red" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Valuation</label>
                              <input name="price" type="number" required defaultValue={editingProduct?.price} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Mfg Cost</label>
                              <input name="manufacturingCost" type="number" defaultValue={editingProduct?.manufacturingCost} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono" />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Offer Price (Optional)</label>
                           <input name="discountPrice" type="number" defaultValue={editingProduct?.discountPrice} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Architectural Morphology (Size-Wise Stock)</label>
                           <div className="grid grid-cols-2 gap-3">
                              {availableSizes.map(size => (
                                <div key={size} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                   <span className="text-[10px] font-black w-4">{size}</span>
                                   <input 
                                     type="number" 
                                     min="0"
                                     value={productSizeStock[size] || 0}
                                     onChange={(e) => setProductSizeStock({ ...productSizeStock, [size]: Number(e.target.value) })}
                                     className="w-full bg-transparent border-none outline-none text-right font-mono text-xs"
                                     placeholder="0"
                                   />
                                   <label className="flex items-center cursor-pointer">
                                      <input type="checkbox" name="sizes" value={size} defaultChecked={editingProduct?.sizes.includes(size)} className="hidden" />
                                   </label>
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <div className="flex justify-between items-end mb-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Technical Brief (Markdown)</label>
                              <button 
                                type="button"
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className="text-[8px] bg-white/5 px-2 py-1 rounded-lg border border-white/10 hover:bg-white hover:text-black transition-all"
                              >
                                {isPreviewMode ? 'Exit Preview' : 'Preview Identity'}
                              </button>
                           </div>
                           {isPreviewMode ? (
                              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] markdown-body text-[10px] prose prose-invert max-h-[300px] overflow-y-auto">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {(document.getElementsByName('description')[0] as HTMLTextAreaElement)?.value || editingProduct?.description || ''}
                                </Markdown>
                              </div>
                           ) : (
                              <textarea name="description" rows={5} defaultValue={editingProduct?.description} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs italic leading-relaxed outline-none focus:border-brand-red" />
                           )}
                           <div className="flex gap-4 mt-2">
                              <span className="text-[8px] opacity-30 italic">**Bold**, *Italic*, ~~Strike~~</span>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Identity Tag (e.g. HOT, ARCHIVE)</label>
                           <input name="tag" defaultValue={editingProduct?.tag} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs" />
                        </div>
                     </div>
                  </div>
                  <div className="w-full md:w-1/2 p-10 space-y-6">
                     <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter text-brand-red">Visuals</h3>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Identity Asset (Main Image)</label>
                           <input name="image" required defaultValue={editingProduct?.image} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Asset Array (Comma Separated)</label>
                           <textarea name="images" rows={3} required defaultValue={editingProduct?.images.join(', ')} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-mono" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Classification Matrix</label>
                           <select name="category" defaultValue={editingProduct?.category} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black uppercase tracking-widest outline-none appearance-none">
                              {availableCategories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Chromatic Vectors (Colors)</p>
                           <div className="flex flex-wrap gap-2">
                             {availableColors.map(color => (
                               <label key={color} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:border-brand-red">
                                 <input type="checkbox" name="colors" value={color} defaultChecked={editingProduct?.colors.includes(color)} className="accent-brand-red" />
                                 <span className="text-[8px] font-black uppercase">{color}</span>
                               </label>
                             ))}
                           </div>
                        </div>
                     </div>
                     <button type="submit" className="w-full bg-white text-black py-5 rounded-[40px] font-black uppercase tracking-widest text-xs hover:bg-brand-red hover:text-white transition-all">Synchronize Asset</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Viewer */}
      <AnimatePresence>
        {isInvoiceModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsInvoiceModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
            <div className="relative overflow-y-auto no-scrollbar max-h-[90vh]">
               <Invoice order={selectedOrder} config={siteConfig.invoice} />
               <button onClick={() => setIsInvoiceModalOpen(false)} className="absolute -top-12 right-0 p-3 bg-white/10 rounded-full text-white"><X size={24} /></button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupon Modal */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCouponModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-brand-card border border-white/10 rounded-[32px] overflow-hidden">
               <form onSubmit={handleSaveCoupon} className="p-10 space-y-8 overflow-y-auto max-h-[90vh] no-scrollbar">
                  <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter">Coupon Protocol</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Coupon Code</label>
                        <input name="code" required defaultValue={editingCoupon?.code} placeholder="SUMMER25" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono uppercase focus:border-brand-red outline-none" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Status</label>
                        <div className="flex items-center gap-4 h-[52px]">
                           <input type="checkbox" name="isActive" defaultChecked={editingCoupon?.isActive !== false} className="w-5 h-5 accent-brand-red" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Discount Type</label>
                        <select name="discountType" defaultValue={editingCoupon?.discountType || 'percentage'} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black uppercase tracking-widest outline-none appearance-none">
                           <option value="percentage">Percentage (%)</option>
                           <option value="fixed">Fixed Amount</option>
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Discount Value</label>
                        <input name="discountAmount" type="number" required defaultValue={editingCoupon?.discountAmount} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Min Purchase</label>
                        <input name="minPurchase" type="number" defaultValue={editingCoupon?.minPurchase || 0} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Expiry Date</label>
                        <input name="expiryDate" type="date" defaultValue={editingCoupon?.expiryDate} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Usage Limit</label>
                        <input name="usageLimit" type="number" defaultValue={editingCoupon?.usageLimit} placeholder="Unlimited" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Usage Count (Readonly)</label>
                        <input value={editingCoupon?.usageCount || 0} readOnly className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono opacity-50" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Applicable Products (Optional - Apply to ALL if empty)</label>
                     <div className="max-h-48 overflow-y-auto no-scrollbar grid grid-cols-1 gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl">
                        {products.map(p => (
                          <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                             <input 
                                type="checkbox" 
                                name="applicableProducts" 
                                value={p.id}
                                defaultChecked={editingCoupon?.applicableProductIds?.includes(p.id)}
                                className="w-4 h-4 accent-brand-red" 
                             />
                             <img src={p.image} className="w-8 h-8 object-cover rounded" />
                             <span className="text-[10px] font-black uppercase truncate">{p.name}</span>
                          </label>
                        ))}
                     </div>
                  </div>

                  <button type="submit" className="w-full bg-brand-red text-white py-5 rounded-[40px] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all shadow-2xl">
                    Log Coupon Protocol
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }} className={cn("fixed bottom-12 right-12 px-8 py-5 rounded-3xl shadow-2xl z-[200]", notification.type === 'success' ? "bg-white text-black" : "bg-brand-red text-white")}>
             <p className="text-[10px] font-black uppercase tracking-widest">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
