import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { siteConfig } = useStore();
  
  const config = siteConfig?.cookieConsent;

  useEffect(() => {
    if (!config?.enabled) return;
    
    const consent = localStorage.getItem('splendour-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [config]);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem('splendour-cookie-consent', accepted ? 'accepted' : 'declined');
    setIsVisible(false);
  };

  if (!config?.enabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[150] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-brand-card/95 border border-white/10 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/20 rounded-2xl flex items-center justify-center shrink-0">
              <Shield className="text-brand-red" size={24} />
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-1">{config.title}</h4>
              <p className="text-xs text-brand-muted leading-relaxed font-medium">
                {config.message}
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleConsent(false)}
                className="flex-grow md:flex-grow-0 px-6 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-white hover:bg-white/5 transition-all"
              >
                Decline
              </button>
              <button
                onClick={() => handleConsent(true)}
                className="flex-grow md:flex-grow-0 px-8 py-3 rounded-xl bg-brand-red text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent-dark transition-all shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2"
              >
                <Check size={14} /> {config.acceptText}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
