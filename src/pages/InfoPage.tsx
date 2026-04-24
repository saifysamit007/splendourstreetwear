import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useParams, Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, RotateCcw, ShieldCheck, Heart, Globe, Users, Mail, MapPin, Phone, 
  Sparkles as SparklesIcon, Zap, ShoppingBag, ArrowRight, Camera, Eye, Cookie,
  Filter, X, ArrowUpDown, Search
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';
import SEO from '../components/SEO';
import { formatPrice } from '../constants';
import { cn } from '../lib/utils';

interface FilterBarProps {
  activeCategory: string;
  setCategory: (c: string) => void;
  categories: string[];
  sortBy: string;
  setSortBy: (s: string) => void;
}

function FilterBar({ activeCategory, setCategory, categories, sortBy, setSortBy }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-white/40 mr-2">
          <Filter size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filter</span>
        </div>
        <button 
          onClick={() => setCategory('All')}
          className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${activeCategory === 'All' ? 'bg-brand-red border-brand-red text-white' : 'bg-transparent border-white/10 text-brand-muted hover:border-white/30'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-brand-red border-brand-red text-white' : 'bg-transparent border-white/10 text-brand-muted hover:border-white/30'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-white/40">
           <ArrowUpDown size={14} />
           <span className="text-[10px] font-bold uppercase tracking-widest">Sort</span>
        </div>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-brand-red text-white transition-all appearance-none cursor-pointer hover:bg-white/10"
        >
          <option value="newest" className="bg-brand-bg text-white">New Added</option>
          <option value="price-low" className="bg-brand-bg text-white">Price: Low to High</option>
          <option value="price-high" className="bg-brand-bg text-white">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const addToCart = useStore(state => state.addToCart);
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative aspect-[3/4] bg-brand-card rounded-2xl md:rounded-[32px] overflow-hidden border border-white/5 mb-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
          referrerPolicy="no-referrer"
        />
        {product.tag && (
          <div className="absolute top-4 left-4 md:top-6 md:left-6">
            <span className="bg-brand-red text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-lg">
              {product.tag}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => addToCart(product)}
              className="bg-white text-black font-bold py-3 px-8 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-red hover:text-white"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-black/50 text-white font-bold py-3 px-8 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:text-black border border-white/20"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
      <div>
        <h3 
          onClick={() => navigate(`/product/${product.id}`)}
          className="text-white font-bold mb-1 group-hover:text-brand-red transition-colors cursor-pointer"
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          {product.discountPrice ? (
            <>
              <p className="text-brand-red font-black font-mono text-sm">{formatPrice(product.discountPrice)}</p>
              <p className="text-brand-muted font-medium font-mono text-[10px] line-through opacity-50">{formatPrice(product.price)}</p>
            </>
          ) : (
            <p className="text-brand-muted font-mono text-sm">{formatPrice(product.price)}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const ProductSection = ({ title, products, description }: { title: string, products: Product[], description?: string }) => (
  <div className="space-y-12">
    {description && <p className="text-xl text-brand-muted max-w-2xl">{description}</p>}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
);

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', orderId: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    
    setIsSubmitting(true);
    try {
      // Save message to Firestore
      await addDoc(collection(db, 'messages'), {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'new'
      });
      
      if (isMounted.current) {
        setIsSuccess(true);
        setFormData({ name: '', orderId: '', message: '' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-card p-12 rounded-[32px] border border-brand-red/30 text-center space-y-4"
      >
        <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
          <SparklesIcon className="text-white" size={32} />
        </div>
        <h3 className="text-2xl font-display font-black uppercase">Message Received</h3>
        <p className="text-brand-muted">Our architecture team will study your request and respond within 24-48 hours.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="text-brand-red font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-brand-card p-8 rounded-[32px] border border-white/5">
      <div className="space-y-2">
         <label className="text-xs font-bold uppercase tracking-widest text-brand-muted">Your Name</label>
         <input 
          required
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-brand-red text-sm" 
          placeholder="Name" 
        />
      </div>
      <div className="space-y-2">
         <label className="text-xs font-bold uppercase tracking-widest text-brand-muted">Order Number (Optional)</label>
         <input 
          type="text" 
          value={formData.orderId}
          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-brand-red text-sm" 
          placeholder="#10234" 
        />
      </div>
      <div className="space-y-2">
         <label className="text-xs font-bold uppercase tracking-widest text-brand-muted">Your Message</label>
         <textarea 
          required
          rows={4} 
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-brand-red resize-none text-sm" 
          placeholder="How can we help?"
        ></textarea>
      </div>
      <button 
        disabled={isSubmitting}
        className="w-full bg-brand-red text-white font-bold py-4 rounded-xl hover:bg-brand-accent-dark transition-all shadow-xl shadow-brand-red/20 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isSubmitting ? 'Sending Architecture...' : 'Submit Message'}
      </button>
    </form>
  );
}

export default function InfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = paramSlug || (location.pathname === '/shop' ? 'shop' : '');
  const [searchParams] = useSearchParams();
  const { products, siteConfig, searchQuery } = useStore();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const categories = useMemo(() => {
    const cats = products.map(p => p.category);
    return Array.from(new Set(cats));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      // Sort by ID descending (assuming newer products have higher IDs)
      result.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
    }

    return result;
  }, [products, activeCategory, sortBy, searchQuery]);
  
  const contentMap: Record<string, React.ReactNode> = {
    'shop': (
      <div className="space-y-12">
        <FilterBar 
          activeCategory={activeCategory} 
          setCategory={setActiveCategory} 
          categories={categories} 
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-24 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-brand-muted">
                  <Search size={24} />
                </div>
                <p className="text-brand-muted font-medium italic">No architectural pieces found for "{searchQuery}"</p>
                <button 
                  onClick={() => useStore.getState().setSearchQuery('')}
                  className="text-brand-red font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                >
                  Clear Exploration
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    ),
    'new-arrivals': (
      <div className="space-y-12">
        <FilterBar 
          activeCategory={activeCategory} 
          setCategory={setActiveCategory} 
          categories={categories} 
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.filter(p => p.tag?.toLowerCase().includes('new')).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    ),
    'best-sellers': (
      <div className="space-y-12">
        <FilterBar 
          activeCategory={activeCategory} 
          setCategory={setActiveCategory} 
          categories={categories} 
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.filter(p => p.tag?.toLowerCase().includes('best') || p.id === '1' || p.id === '4').map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    ),
    'collections': (
      <div className="space-y-24">
        <div className="max-w-2xl">
          <p className="text-sm font-black text-brand-red uppercase tracking-[0.4em] mb-6">Archive Registry</p>
          <p className="text-2xl text-white font-medium leading-relaxed">
            Curated narratives in high-density fabric. Each collection is a chapter in our ongoing exploration of urban identity, distilled for the streets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {(siteConfig.collections || [
            { name: "Essential Loop", tag: "CORE", image: "https://picsum.photos/seed/coll1/1200/800", desc: "Minimalist silhouettes for everyday utility. Engineered for efficiency.", year: "2026", link: "/shop" },
            { name: "Cyber Drifter", tag: "LIMITED", image: "https://picsum.photos/seed/coll2/1200/800", desc: "Technical fabrics adapted for the chaos of the city. Industrial aesthetics.", year: "2026", link: "/shop" },
            { name: "Splendour Origins", tag: "ARCHIVE", image: "https://picsum.photos/seed/coll3/1200/800", desc: "The foundational drop that started the culture. A study in raw form.", year: "2020", link: "/shop" },
            { name: "Dhaka Nights", tag: "NEW", image: "https://picsum.photos/seed/coll4/1200/800", desc: "Reflective detailing inspired by the city after dark. High visibility.", year: "2025", link: "/shop" }
          ]).map((col, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "group cursor-pointer flex flex-col",
                i % 2 === 1 ? "md:mt-24" : ""
              )}
              onClick={() => navigate(col.link || '/shop')}
            >
              <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden bg-brand-card mb-8 border border-white/5">
                {col.video ? (
                  <video 
                    src={col.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                ) : (
                  <img 
                    src={col.image} 
                    alt={col.name} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700" />
                <div className="absolute top-8 right-8">
                  <span className="text-[10px] font-mono text-white/40 tracking-[0.3em] font-bold uppercase">{col.year} REG</span>
                </div>
              </div>
              
              <div className="px-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em] px-3 py-1 bg-brand-red/10 rounded-full border border-brand-red/20">
                    {col.tag}
                  </span>
                </div>
                <h3 className="text-4xl font-display font-black text-white uppercase tracking-tighter mb-4 group-hover:text-brand-red transition-colors">
                  {col.name}
                </h3>
                <p className="text-brand-muted leading-relaxed mb-8 max-w-sm">
                  {col.desc}
                </p>
                <div className="flex items-center gap-2 text-white font-bold uppercase tracking-[0.2em] text-[10px] opacity-40 group-hover:opacity-100 transition-all">
                  VIEW FULL ARCHIVE <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    'accessories': (
      <ProductSection 
        title="Accessories" 
        description="The finishing details for the Splendour look. From beanies to utility totes."
        products={products.filter(p => p.category === 'Accessories')} 
      />
    ),
    'lookbook': (
      <div className="space-y-40">
        <header className="max-w-3xl">
          <p className="text-brand-red font-display font-black uppercase tracking-[0.5em] mb-6">Visual Narratives</p>
          <p className="text-2xl md:text-3xl font-display font-black text-white tracking-tighter leading-none mb-8 uppercase">
            STUDY OF FORM <br /> AND CONCRETE.
          </p>
          <p className="text-xl text-brand-muted leading-relaxed max-w-2xl">
            Captured moments of high-density culture. A pure documentation of fabric and form in the urban landscape of Dhaka.
          </p>
        </header>

        <div className="space-y-32">
          {(siteConfig.lookbooks || [
            { id: '01', title: "URBAN DISTORTION", year: "2026", image: "https://picsum.photos/seed/look1/1600/900", type: "Campaign", desc: "Exploring the intersection of architectural lines and movement.", link: "/info/collections" },
            { id: '02', title: "CONCRETE SILENCE", year: "2025", image: "https://picsum.photos/seed/look2/1600/900", type: "Editorial", desc: "A minimalist approach to volume and texture in neutral space.", link: "/info/collections" },
            { id: '03', title: "NEON PULSE", year: "2025", image: "https://picsum.photos/seed/look3/1600/900", type: "Street", desc: "Capturing the kinetic energy of the city through reflective surfaces.", link: "/info/collections" },
            { id: '04', title: "DHAKA EVOLUTION", year: "2024", image: "https://picsum.photos/seed/look4/1600/900", type: "Documentary", desc: "The foundational aesthetic shift. Raw, unfiltered, definitive.", link: "/info/collections" }
          ]).map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-pointer"
              onClick={() => navigate(item.link || '/info/collections')}
            >
              <div className="relative aspect-video overflow-hidden rounded-[32px] md:rounded-[60px] bg-brand-card mb-12 shadow-2xl">
                {item.video ? (
                  <video 
                    src={item.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-105"
                  />
                ) : (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-1000" />
                
                <div className="absolute top-12 left-12 flex items-center gap-4">
                  <span className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center font-mono font-black text-sm">
                    {item.id}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">{item.type}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-8 px-8">
                <div className="max-w-xl">
                  <h3 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter mb-4 group-hover:text-brand-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-brand-muted leading-relaxed text-lg italic opacity-0">Hidden</p> {/* Just to match structure if needed */}
                  <p className="text-brand-muted leading-relaxed text-lg">
                    {item.desc}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-2xl font-display font-black text-white mb-2">{item.year} SS</span>
                  <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-red hover:text-white transition-all">
                    ENTER ARCHIVE <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-32 border-t border-white/10 flex flex-col items-center text-center group"
        >
          <div className="max-w-2xl space-y-8">
             <Camera className="text-brand-red mx-auto mb-4" size={48} />
             <h3 className="text-3xl md:text-7xl font-display font-black text-white tracking-tighter uppercase mb-6">
               SUBMIT YOUR <br /> STYLING.
             </h3>
             <p className="text-brand-muted text-xl leading-relaxed">
               We are constantly curating the community's vision. Tag <span className="text-white font-bold">@splendour.cc</span> for a chance to be featured in our seasonal documentary collections.
             </p>
             <button className="bg-white text-black px-12 py-5 rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-brand-red hover:text-white transition-all transform hover:scale-105 shadow-2xl">
                OPEN SUBMISSION PORTAL
             </button>
          </div>
        </motion.div>
      </div>
    ),
    'cookies': (
      <div className="space-y-16">
        <header className="p-12 bg-white/5 border border-white/5 rounded-[48px] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <Cookie className="text-brand-red mb-6" size={40} />
            <h3 className="text-4xl font-display font-bold text-white mb-4 uppercase tracking-tight">Cookie Systems</h3>
            <p className="text-brand-muted text-lg">We use cookies to optimize your workflow within the Splendour ecosystem. No invasive tracking, just technical precision.</p>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <SparklesIcon size={240} />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="space-y-6">
            <h4 className="text-sm font-black text-brand-red uppercase tracking-[0.4em]">Necessary</h4>
            <p className="text-sm leading-relaxed text-brand-muted">Essential for the shop's runtime. Used for authentication, cart persistence, and security verification. These cannot be disabled for the ecosystem to function.</p>
            <div className="p-4 bg-brand-card rounded-xl border border-white/5 text-[10px] font-mono uppercase tracking-widest opacity-50">
               ID: SPL_SESSION_AUTH / PERSISTENT
            </div>
          </section>
          
          <section className="space-y-6">
            <h4 className="text-sm font-black text-brand-red uppercase tracking-[0.4em]">Preferences</h4>
            <p className="text-sm leading-relaxed text-brand-muted">We store your visual preferences—like dark mode state and regional settings—to ensure your next entry to the vault is seamless.</p>
             <div className="p-4 bg-brand-card rounded-xl border border-white/5 text-[10px] font-mono uppercase tracking-widest opacity-50">
               ID: SPL_UI_STATE / 365 DAYS
            </div>
          </section>

          <section className="space-y-6 lg:col-span-2">
            <h4 className="text-sm font-black text-brand-red uppercase tracking-[0.4em]">Performance Vault</h4>
            <p className="text-sm leading-relaxed text-brand-muted">Anonymous diagnostic data helps us optimize the visual engine of Splendour. This information is strictly technical and never linked to your identity.</p>
            <div className="flex flex-wrap gap-4 mt-6">
              <button className="bg-brand-red text-white text-xs font-bold px-8 py-3 rounded-full hover:bg-brand-accent-dark transition-all">Accept All</button>
              <button className="border border-white/20 text-white text-xs font-bold px-8 py-3 rounded-full hover:bg-white/5 transition-all">Functional Only</button>
            </div>
          </section>
        </div>
      </div>
    ),
    'returns-exchanges': (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Return Policy</h2>
        <p>If you're not 100% satisfied with your purchase, we're here to help. At SPLENDOUR, we pride ourselves on quality, but we understand that sometimes things don't fit the vibe.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-brand-card border border-white/5 rounded-2xl">
            <h3 className="text-white font-bold mb-2">14-Day Window</h3>
            <p className="text-sm">Items must be returned within 14 days of delivery. No exceptions for the culture.</p>
          </div>
          <div className="p-6 bg-brand-card border border-white/5 rounded-2xl">
            <h3 className="text-white font-bold mb-2">Original State</h3>
            <p className="text-sm">Products must be unworn, unwashed, and in their original packaging with all tags attached.</p>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">How to Exchange</h2>
        <p>Need a different size? We offer one-time free exchanges (within Bangladesh) to ensure you get that perfect oversized fit.</p>
        <ul className="list-disc pl-6 space-y-3">
          <li>Reach out to our support team via Instagram DM or Email.</li>
          <li>Provide your order number and the reason for exchange.</li>
          <li>Once approved, our courier will pick up the item and drop off the new one.</li>
        </ul>
      </section>
    </div>
  ),
  'shipping-info': (
    <div className="space-y-12">
      <section className="space-y-8">
        <div className="p-8 bg-brand-card border border-white/5 rounded-[32px] overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight mb-6">Domestic Shipping (Bangladesh)</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold flex items-center gap-2 text-white"><MapPin size={18} className="text-brand-red" /> Inside Dhaka</span>
                <span className="text-brand-red font-display font-bold">৳ 80.00</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold flex items-center gap-2 text-white"><Globe size={18} className="text-brand-red" /> Outside Dhaka</span>
                <span className="text-brand-red font-display font-bold">৳ 140.00</span>
              </div>
            </div>
            <p className="text-sm mt-6 opacity-70">Delivery time: 2-3 business days within Dhaka, 3-5 days outside.</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Truck size={120} />
          </div>
        </div>
      </section>
      <section className="space-y-6 p-8 border border-white/10 rounded-[32px] bg-gradient-to-br from-brand-card to-transparent">
        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Worldwide Shipping</h2>
        <p className="text-lg">We take the Splendour aesthetic global. International orders are handled exclusively by <span className="text-white font-bold">DHL Express</span>.</p>
        <div className="p-6 bg-brand-red/10 border border-brand-red/20 rounded-2xl flex items-start gap-4">
           <ShieldCheck className="text-brand-red shrink-0" size={24} />
           <div>
             <h4 className="text-brand-red font-bold mb-1 uppercase tracking-wider text-xs">Security Note</h4>
             <p className="text-sm">For all international orders (DHL), we require <span className="text-white">full payment in advance</span>. Cash on delivery is not available for orders outside Bangladesh.</p>
           </div>
        </div>
      </section>
    </div>
  ),
  'our-story': (
    <div className="space-y-40">
      {/* Cinematic Hero Video */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative h-[60vh] md:h-[80vh] rounded-[32px] md:rounded-[60px] overflow-hidden border border-white/5 bg-brand-card shadow-2xl"
      >
        <video 
          key={siteConfig.storyVideos?.hero}
          src={siteConfig.storyVideos?.hero || "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-setting-41793-large.mp4"}
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-brand-bg/40"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-brand-red font-mono text-xs uppercase tracking-[0.5em] mb-6 block"
          >
            Digital Archive v2.0
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-3xl md:text-8xl font-display font-black text-white leading-tight tracking-tighter uppercase max-w-5xl"
          >
            "NOT JUST CLOTH. <br /> A <span className="text-brand-red">MOVEMENT</span> DEFINED."
          </motion.h2>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Scroll to Explore</span>
           <motion.div 
             animate={{ y: [0, 10, 0] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="w-0.5 h-12 bg-gradient-to-b from-brand-red to-transparent"
           />
        </div>
      </motion.section>

      {/* Craftsmanship Section (Sewing/Detailing) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12 order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 text-brand-red mb-2">
              <Zap size={20} />
              <span className="text-sm font-black uppercase tracking-widest">Engineering Phase</span>
            </div>
            <h3 className="text-5xl font-display font-black text-white uppercase tracking-tighter">Precision Craft.</h3>
            <p className="text-xl text-brand-muted leading-relaxed">
              Every seam, every stitch is a calculation. We treat streetwear as architecture for the body, sourcing high-density fabrics that withstand the urban environment while maintaining a sharp silhouette.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-8"
          >
            <div>
              <span className="block text-3xl font-display font-black text-white italic">450GSM</span>
              <span className="text-[10px] uppercase font-bold text-brand-muted tracking-widest leading-none">Min. Weight</span>
            </div>
            <div>
              <span className="block text-3xl font-display font-black text-white italic">12-PLY</span>
              <span className="text-[10px] uppercase font-bold text-brand-muted tracking-widest leading-none">Reinforcement</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          className="relative aspect-square rounded-[32px] md:rounded-[64px] overflow-hidden group shadow-2xl order-1 lg:order-2"
        >
          <video 
            key={siteConfig.storyVideos?.crafting}
            src={siteConfig.storyVideos?.crafting || "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-sewing-machine-working-34444-large.mp4"}
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-brand-red/10 group-hover:bg-transparent transition-colors"></div>
          <div className="absolute top-12 right-12">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/20">
              <SparklesIcon className="text-white" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modelling / Aesthetic Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-16"
      >
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="max-w-2xl">
             <h3 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter mb-6">LIT BY THE <br />CITY LIGHTS.</h3>
             <p className="text-brand-muted text-lg">Documentation of the Splendour Collective in motion. Across the concrete landscapes of Dhaka, our pieces are tested for the future.</p>
           </div>
           <Link to="/info/lookbook" className="flex items-center gap-4 px-8 py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-red hover:text-white transition-all shadow-xl">
             Explore Lookbook <ArrowRight size={16} />
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { vid: siteConfig.storyVideos?.modeling1 || "https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-studio-under-colorful-lighting-41792-large.mp4", label: "01 / VISION" },
             { vid: siteConfig.storyVideos?.modeling2 || "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-on-the-street-under-the-neon-lights-41791-large.mp4", label: "02 / MOTION" },
             { vid: siteConfig.storyVideos?.modeling3 || "https://assets.mixkit.co/videos/preview/mixkit-woman-walking-through-the-streets-at-night-41790-large.mp4", label: "03 / PULSE" }
           ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="relative aspect-[3/4] rounded-[48px] overflow-hidden bg-brand-card group border border-white/5 shadow-2xl"
             >
               <video 
                 key={item.vid}
                 src={item.vid}
                 autoPlay 
                 muted 
                 loop 
                 playsInline
                 className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
               <div className="absolute bottom-8 left-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{item.label}</span>
               </div>
             </motion.div>
           ))}
        </div>
      </motion.section>

      {/* The Mission Refined */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative p-12 md:p-32 bg-brand-card border border-white/5 rounded-[80px] text-center overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-brand-red/10 to-transparent pointer-events-none"></div>
        <video 
          key={siteConfig.storyVideos?.mission}
          src={siteConfig.storyVideos?.mission || "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-seamstress-working-in-a-sewing-machine-34443-large.mp4"}
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none"
        />
        <div className="relative z-10 space-y-12">
          <div className="w-20 h-20 bg-brand-red/20 rounded-3xl flex items-center justify-center mx-auto mb-12 border border-brand-red/20">
            <Globe className="text-brand-red" size={32} />
          </div>
          <h2 className="text-3xl md:text-8xl font-display font-black text-white uppercase tracking-tighter leading-none">DHAKA TO <br /><span className="text-brand-red">THE WORLD.</span></h2>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-brand-muted leading-relaxed font-medium">
            Representing the streets of Bangladesh on a global scale. We don't just export fabric; we export our <span className="text-white font-bold tracking-tight">Identity</span>, our <span className="text-white font-bold tracking-tight">Ambition</span>, and our <span className="text-white font-bold tracking-tight">Future</span>.
          </p>
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-4xl mx-auto">
             <div className="space-y-2">
                <span className="block text-5xl font-display font-black text-white tracking-widest">14</span>
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-muted">Drop Cycle</span>
             </div>
             <div className="space-y-2">
                <span className="block text-5xl font-display font-black text-white tracking-widest">20K</span>
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-muted">Active Node</span>
             </div>
             <div className="space-y-2">
                <span className="block text-5xl font-display font-black text-white tracking-widest">100%</span>
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-muted">End-to-End</span>
             </div>
          </div>
        </div>
      </motion.section>
    </div>
  ),
  'about': (
    <div className="space-y-32">
       {/* Redirect or duplicate story content for clarity */}
       <div className="animate-in fade-in duration-1000">
          <Link to="/info/our-story" className="text-brand-red flex items-center gap-2 font-bold mb-12">
             <ArrowRight size={20} className="rotate-180" /> Back to Collective Story
          </Link>
          {/* Reuse the Story Layout dynamically if needed, but for simplicity we keep separate sections */}
       </div>
    </div>
  ),
  'sustainability': (
    <div className="space-y-16">
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-tight mb-8">Responsibility over Profit</h2>
        <p className="max-w-2xl mx-auto text-lg leading-relaxed">
          At SPLENDOUR, we believe that the clothes that represent our culture should not hurt our future. Since 2020, we have been constantly pivoting towards more ethical production.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <Heart />, title: "Fair Wages", desc: "Every artisan in our supply chain is paid significantly above the national minimum wage." },
          { icon: <RotateCcw />, title: "Zero Waste", desc: "We repurpose fabric scraps into limited edition accessories and tags." },
          { icon: <ShieldCheck />, title: "Organic Only", desc: "We are moving towards 100% GOTS certified organic cotton for all core collections." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-brand-card border border-white/5 rounded-3xl hover:border-brand-red/50 transition-all group"
          >
            <div className="text-brand-red mb-4 transform group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="text-white font-bold mb-2 uppercase tracking-widest text-sm">{item.title}</h3>
            <p className="text-sm opacity-70">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  ),
  'careers': (
    <div className="space-y-16">
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex flex-col md:flex-row gap-12 items-center"
      >
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-display font-bold text-white uppercase leading-none">JOIN THE <br /> <span className="text-brand-red">VANGUARD.</span></h2>
          <p>We aren't looking for employees. We're looking for disruptors. If you're passionate about the intersection of design, technology, and culture, you belong with us.</p>
        </div>
        <div className="flex-1 w-full bg-brand-card border border-white/10 rounded-[40px] p-8 aspect-video flex items-center justify-center">
           <Users size={64} className="text-white/20" />
        </div>
      </motion.section>

      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-brand-red">Open Roles</h3>
        {[
          { role: "Visual Designer", type: "Full-time / Remote", field: "Creative" },
          { role: "Supply Chain Manager", type: "Full-time / Dhaka", field: "Ops" },
          { role: "Community Lead", type: "Part-time / Hybrid", field: "Marketing" }
        ].map((job, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col md:flex-row justify-between items-center p-8 bg-brand-card/50 border border-white/5 rounded-2xl hover:bg-white/5 cursor-pointer group"
          >
            <div>
              <span className="text-[10px] font-mono text-brand-muted uppercase tracking-[0.2em] mb-1 block">{job.field}</span>
              <h4 className="text-xl font-bold text-white group-hover:text-brand-red transition-colors">{job.role}</h4>
              <p className="text-xs opacity-60">{job.type}</p>
            </div>
            <button className="mt-4 md:mt-0 text-xs font-bold uppercase tracking-widest py-3 px-6 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all">
              Apply Now
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  ),
  'privacy-policy': (
    <div className="space-y-12 text-sm leading-relaxed">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Information We Collect</h2>
        <p>When you join the SPLENDOUR database (our mailing list) or place an order, we collect essential data like your name, email, shipping address, and phone number. This is for order fulfillment and ensuring you stay updated on drops.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Security</h2>
        <p>We do not store credit card details. All transactions are handled via secure, third-party payment gateways. Your personal data is encrypted and kept in our vault—never sold or traded for the sake of profit.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Cookies</h2>
        <p>We use functional cookies to remember your cart status and site preferences. No invasive tracking, just a smoother workflow through the shop.</p>
      </section>
    </div>
  ),
  'contact-us': (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-8">
        <p className="text-lg">Need support or just want to connect? Reach out through any of our official channels.</p>
        <div className="space-y-6">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-red transition-all">
              <Mail className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-brand-muted tracking-widest">Email</p>
              <a href={`mailto:${siteConfig.footer.email}`} className="font-bold text-white hover:text-brand-red transition-colors">{siteConfig.footer.email}</a>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-red transition-all">
              <Phone className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-brand-muted tracking-widest">WhatsApp</p>
              <a 
                href={`https://wa.me/${siteConfig.footer.whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-white hover:text-brand-red transition-colors"
              >
                {siteConfig.footer.phone}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-red transition-all">
              <MapPin className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-brand-muted tracking-widest">HQ Location</p>
              <a 
                href={siteConfig.footer.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-white hover:text-brand-red transition-colors"
              >
                {siteConfig.footer.address}
              </a>
            </div>
          </div>
        </div>
      </div>
      <ContactForm />
    </div>
  )
};

const title = slug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Info';
const content = slug && contentMap[slug] ? contentMap[slug] : (
  <div className="prose prose-invert max-w-none space-y-8 text-brand-muted leading-relaxed">
    <p className="text-xl text-white font-medium">
      Welcome to our {title} page. We are currently updating our content to provide you with the most accurate and detailed information.
    </p>
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Overview</h2>
      <p>
        At SPLENDOUR, we believe in transparency and providing our customers with all the necessary information to make their shopping experience seamless.
      </p>
    </section>
  </div>
);

return (
    <div className="min-h-screen bg-brand-bg pb-24 selection:bg-brand-red selection:text-white">
      <SEO 
        title={activeCategory !== 'All' ? `${activeCategory} | Shop` : title} 
        description={`Explore our ${activeCategory !== 'All' ? activeCategory : title} collection at SPLENDOUR. Premium streetwear distilled for the streets of Dhaka.`}
      />
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          key={slug}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-16">
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-none mb-6">
              {title.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-brand-red block md:inline" : ""}>
                   {word} {i === 0 && <br className="md:hidden" />}
                </span>
              ))}
              <span className="text-brand-red">.</span>
            </h1>
            <div className="h-1 w-24 bg-brand-red rounded-full" />
          </div>
          
          <div className="text-brand-muted leading-relaxed">
            {content}

            <div className="p-8 md:p-12 bg-white/5 border border-white/5 rounded-[48px] mt-24 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Still have questions?</h3>
                  <p className="text-brand-muted max-w-md">Our collective is here to assist you with any inquiries regarding the Splendour ecosystem.</p>
                </div>
                <Link 
                  to="/info/contact-us"
                  className="bg-brand-red hover:bg-brand-accent-dark text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-brand-red/30 transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <Mail size={18} /> Connect Now
                </Link>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <SparklesIcon size={200} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
