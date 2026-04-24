import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function OfferPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const { siteConfig } = useStore();
  const navigate = useNavigate();
  
  const config = siteConfig?.offerPopup;

  useEffect(() => {
    if (!config?.enabled) return;
    
    // Timer to show popup every time the component mounts (on site enter)
    const timer = setTimeout(() => setIsVisible(true), (config.delay || 3) * 1000);
    return () => clearTimeout(timer);
  }, [config]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCTA = () => {
    handleClose();
    // Default to shop as requested
    navigate('/shop');
  };

  if (!config?.enabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-brand-card border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
          >
            {/* Background Media */}
            <div className="absolute inset-0 opacity-40">
              {config.mediaType === 'video' ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  src={config.mediaUrl}
                />
              ) : (
                <img
                  src={config.mediaUrl}
                  alt="Special Offer"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/50 to-transparent" />
            </div>

            <div className="relative p-12 text-center flex flex-col items-center">
              <button 
                onClick={handleClose}
                className="absolute top-8 right-8 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
              >
                <X size={20} />
              </button>

              <h2 className="text-4xl font-display font-black italic tracking-tighter mb-6 leading-none pt-10">
                {config.title}
              </h2>

              <p className="text-brand-muted text-sm mb-10 leading-relaxed font-medium">
                {config.message}
              </p>

              <button
                onClick={handleCTA}
                className="w-full py-5 bg-brand-red text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-accent-dark transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-red/20 flex items-center justify-center gap-3"
              >
                {config.buttonText} <ArrowRight size={18} />
              </button>

              <button
                onClick={handleClose}
                className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted hover:text-white transition-colors"
              >
                Maybe later, continue exploring
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
