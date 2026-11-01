import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CookieConsent() {
  const { siteConfig } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  
  const config = siteConfig.cookieConsent;

  useEffect(() => {
    if (!config?.enabled) return;
    
    // Check if user has already accepted/declined
    const consent = localStorage.getItem('splendour_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [config?.enabled]);

  const handleAccept = () => {
    localStorage.setItem('splendour_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('splendour_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!config?.enabled || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-8 right-8 z-[200] max-w-lg"
      >
        <div className="bg-black/95 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
          {/* Radial Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-red/20 blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-1">
                  Security Protocol
                </h3>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                  {config.title || 'Cookie Infrastructure'}
                </h4>
              </div>
            </div>

            <p className="text-brand-muted text-[11px] leading-relaxed uppercase tracking-widest mb-8">
              {config.message || 'We utilize architectural tracking fragments to ensure your interface synchronization is optimized for peak efficiency.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleAccept}
                className="bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-red hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Check size={14} />
                {config.acceptText || 'Accept All'}
              </button>
              <button 
                onClick={handleDecline}
                className="bg-white/5 border border-white/10 text-brand-muted py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <X size={14} />
                Decline
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
