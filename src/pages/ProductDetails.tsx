import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ArrowLeft, Heart, Share2, 
  ChevronRight, ChevronLeft, Truck, RotateCcw, 
  ShieldCheck, Star, Info, MessageSquare, ThumbsUp, ThumbsDown, Send, User,
  Copy, Check
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../constants';
import SEO from '../components/SEO';
import { cn } from '../lib/utils';
import ProductReviews from '../components/ProductReviews';
import SizeGuidePopup from '../components/SizeGuidePopup';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const products = useStore(state => state.products);
  const addToCart = useStore(state => state.addToCart);
  const { toggleFavorite, favorites, addNotification } = useStore();
  const isFavorite = useMemo(() => favorites.includes(id || ''), [favorites, id]);
  
  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!product) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <button 
          onClick={() => navigate('/info/shop')}
          className="bg-brand-red text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const nextImage = () => setActiveImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    addNotification('Link copied to clipboard', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareOptions = [
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, icon: 'FB' },
    { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`, icon: 'WA' },
    { name: 'Twitter', url: `https://twitter.com/intent/tweet?url=${window.location.href}&text=${product.name}`, icon: 'TW' },
  ];

  // Use size-specific stock if available
  const currentStock = selectedSize && product.sizeStock?.[selectedSize] !== undefined 
    ? product.sizeStock[selectedSize] 
    : product.stock;

  return (
    <div className="flex-grow pb-24">
      <SEO title={`${product.name} | Splendour`} description={product.description} />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* ... existing breadcrumbs ... */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/5 border border-white/10 rounded-full text-white hover:bg-brand-red transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-muted">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <ChevronRight size={14} />
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/info/shop')}>Shop</span>
            <ChevronRight size={14} />
            <span className="text-white">{product.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] bg-brand-card rounded-[24px] md:rounded-[40px] overflow-hidden border border-white/5 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={product.images[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              {product.tag && (
                <div className="absolute top-8 left-8">
                  <span className="bg-brand-red text-white text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-full shadow-2xl">
                    {product.tag}
                  </span>
                </div>
              )}

              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-red"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-red"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "aspect-square rounded-2xl overflow-hidden border transition-all duration-300",
                      activeImage === idx ? "border-brand-red scale-105 shadow-lg shadow-brand-red/20" : "border-white/5 hover:border-white/20"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-brand-red font-bold uppercase tracking-widest text-[10px] mb-2">
                <Star size={12} fill="currentColor" />
                <span>Premium Quality Streetwear</span>
              </div>
              <h1 className="text-3xl md:text-6xl font-display font-black tracking-tighter mb-4 leading-none uppercase">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-mono font-bold text-white">{formatPrice(product.price)}</span>
                <span className="text-xs text-brand-muted uppercase tracking-widest font-bold">Tax Included</span>
              </div>
            </div>

            <div className="markdown-body text-brand-muted text-lg leading-relaxed mb-10 pb-10 border-b border-white/5 overflow-hidden">
              <Markdown remarkPlugins={[remarkGfm]}>{product.description}</Markdown>
            </div>

            <div className="space-y-10">
              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Select Size {selectedSize && `(${selectedSize})`}</span>
                    <button 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-[10px] text-brand-red font-bold underline hover:no-underline"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(size => {
                      const sizeStock = product.sizeStock?.[size];
                      const isOutOfStock = sizeStock !== undefined ? sizeStock === 0 : product.stock === 0;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={isOutOfStock}
                          className={cn(
                            "group relative w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition-all",
                            selectedSize === size 
                              ? "bg-brand-red text-white border-brand-red" 
                              : "bg-transparent border-white/10 text-brand-muted hover:border-white/30",
                            isOutOfStock && "opacity-30 cursor-not-allowed grayscale"
                          )}
                        >
                          <span className="text-sm font-black uppercase">{size}</span>
                          {sizeStock !== undefined && sizeStock > 0 && sizeStock < 5 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-red rounded-full border-2 border-brand-bg md:hidden" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status for selected size */}
              <div className="flex items-center gap-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                  currentStock > 10 
                    ? "bg-green-500/10 border-green-500/20 text-green-500" 
                    : currentStock > 0 
                      ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                      : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                    currentStock > 10 ? "bg-green-500" : currentStock > 0 ? "bg-yellow-500" : "bg-red-500"
                  )} />
                  {currentStock > 10 
                    ? "In Stock" 
                    : currentStock > 0 
                      ? `${currentStock} Units Left`
                      : "Sold Out"}
                </div>
                {selectedSize ? (
                   <span className="text-[10px] font-bold text-brand-muted uppercase tracking-tighter">Stock for size {selectedSize}: {currentStock}</span>
                ) : (
                   <span className="text-[10px] font-bold text-brand-muted uppercase tracking-tighter">Total Stock: {product.stock}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  onClick={() => addToCart(product)}
                  disabled={currentStock === 0 || (product.sizes?.length > 0 && !selectedSize)}
                  className={cn(
                    "flex-grow font-black py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-2xl",
                    currentStock > 0 
                      ? "bg-white text-black hover:bg-brand-red hover:text-white" 
                      : "bg-white/5 text-brand-muted border border-white/10 cursor-not-allowed"
                  )}
                >
                  <ShoppingBag size={20} className={cn("transition-transform", currentStock > 0 && "group-hover:rotate-12")} />
                  <span className="uppercase tracking-widest text-sm">
                    {currentStock > 0 
                      ? (product.sizes?.length > 0 && !selectedSize)
                        ? "Select Architectural Size"
                        : "Add to Cart"
                      : "Protocol Unavailable"}
                  </span>
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => toggleFavorite(product.id)}
                    className={cn(
                      "p-5 border border-white/10 rounded-2xl transition-all active:scale-95",
                      isFavorite ? "bg-brand-red text-white border-brand-red" : "bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-95"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Features ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <Truck className="text-brand-red mt-1" size={20} />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-1">Standard Delivery</h4>
                    <p className="text-[10px] text-brand-muted">Ships within 2-5 days across Bangladesh.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <RotateCcw className="text-brand-red mt-1" size={20} />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-1">3-Day Replacement</h4>
                    <p className="text-[10px] text-brand-muted">3 days product replacement if defect found.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      <SizeGuidePopup isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-brand-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8"
            >
              <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-6">Dispatch Product</h3>
              
              <div className="space-y-3 mb-8">
                {shareOptions.map(option => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-brand-red transition-all group"
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{option.name}</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                ))}
              </div>

              <div className="relative">
                <input 
                  readOnly 
                  value={window.location.href}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pr-12 text-[10px] font-mono text-brand-muted outline-none"
                />
                <button 
                  onClick={handleCopyLink}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-brand-red transition-colors"
                >
                  {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>

              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted hover:text-white"
              >
                Cancel Protocol
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
