import React, { useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ShoppingBag, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../constants';
import { cn } from '../lib/utils';

function ProductCard({ product }: { product: any }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex-shrink-0 w-[280px] md:w-[350px] snap-start group relative"
    >
      <div 
        style={{ transform: "translateZ(30px)" }}
        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-card mb-6 shadow-2xl"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
          referrerPolicy="no-referrer"
        />
        
        {/* Tag */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-20">
          <span className="text-[10px] font-bold uppercase tracking-wider">{product.tag}</span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 z-10 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex flex-col w-full gap-2">
            <button 
              onClick={() => product.stock > 0 && addToCart(product)}
              disabled={product.stock === 0}
              className={cn(
                "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300",
                product.stock > 0 
                  ? "bg-white text-black hover:bg-brand-red hover:text-white" 
                  : "bg-white/10 text-brand-muted cursor-not-allowed"
              )}
            >
              <ShoppingBag size={18} />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
            <button 
              onClick={() => navigate(`/product/${product.id}`)}
              className="w-full bg-black/50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 border border-white/20 hover:bg-white hover:text-black"
            >
              <Eye size={18} />
              View Details
            </button>
          </div>
        </div>
      </div>

      <div style={{ transform: "translateZ(30px)" }}>
        <h4 
          onClick={() => navigate(`/product/${product.id}`)}
          className="text-lg font-bold mb-1 group-hover:text-brand-red transition-colors cursor-pointer"
        >
          {product.name}
        </h4>
        <p className="text-brand-muted font-medium font-mono">{formatPrice(product.price)}</p>
      </div>
    </motion.div>
  );
}

export default function FeaturedCollection() {
  const { searchQuery, products } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const featuredProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      
      const dateA = isNaN(timeA) ? 0 : timeA;
      const dateB = isNaN(timeB) ? 0 : timeB;

      if (dateB !== dateA) {
        return dateB - dateA;
      }
      
      // Fallback: newer IDs (numeric strings from Date.now()) or alphabetical
      return b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' });
    });
    const base = sorted.slice(0, 10);
    if (!searchQuery) return base;
    return base.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, searchQuery]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.scrollSnapType = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      moveEvent.preventDefault();
      const x = moveEvent.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.5; // Adjusted speed
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const onMouseUp = () => {
      isDragging.current = false;
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab';
        scrollRef.current.style.scrollSnapType = 'x mandatory';
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (featuredProducts.length === 0 && searchQuery) {
    return null; // Hide section if no search results
  }

  return (
    <section className="pt-32 pb-24 bg-brand-bg relative" id="shop">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex items-end justify-between relative z-30">
        <div>
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-[0.3em] mb-4">Curated Selection</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold tracking-tight">FEATURED COLLECTION</h3>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md hover:bg-brand-red hover:border-brand-red transition-all duration-300 group"
          >
            <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md hover:bg-brand-red hover:border-brand-red transition-all duration-300 group"
          >
            <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          className="flex overflow-x-auto gap-8 md:gap-12 px-6 md:px-20 pb-12 no-scrollbar snap-x snap-mandatory perspective-1000 cursor-grab active:cursor-grabbing relative z-40"
          style={{ 
            perspective: "1000px",
            scrollPaddingLeft: '5rem'
          }}
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      
      {/* Background Decorative Text */}
      <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none overflow-hidden select-none opacity-[0.02] z-0">
        <span className="text-[20vw] font-black whitespace-nowrap leading-none tracking-tighter">
          SPLENDOUR SPLENDOUR SPLENDOUR
        </span>
      </div>
    </section>
  );
}
