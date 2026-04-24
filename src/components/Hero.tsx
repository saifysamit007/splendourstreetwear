import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

const TYPING_TEXT = "NEW COLLECTION 2026";
const FONTS = [
  'font-display',
  'font-grotesk',
  'font-mono',
  'font-serif',
  'font-syne',
  'font-sans'
];

export default function Hero() {
  const { siteConfig } = useStore();
  const [displayText, setDisplayText] = useState('');
  const [fontIndex, setFontIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText.length < TYPING_TEXT.length) {
          setDisplayText(TYPING_TEXT.substring(0, displayText.length + 1));
          setTypingSpeed(150);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(TYPING_TEXT.substring(0, displayText.length - 1));
          setTypingSpeed(75);
        } else {
          setIsDeleting(false);
          setFontIndex((prev) => (prev + 1) % FONTS.length);
          setTypingSpeed(500);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, typingSpeed]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0">
        {siteConfig.storyVideos?.hero && (
          <video 
            key={siteConfig.storyVideos.hero}
            src={siteConfig.storyVideos.hero}
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-brand-bg/60"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 via-brand-bg/80 to-brand-accent-dark/20 opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-brand-red/10 to-transparent"></div>
      </div>

      {/* Background Glows */}
      <div className="absolute inset-0 z-3 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-red/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent-dark/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24 lg:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-6 px-6 py-2 border border-brand-red/30 rounded-full bg-brand-red/10 backdrop-blur-md"
        >
          <span className={`text-sm font-bold tracking-[0.2em] text-brand-red uppercase transition-all duration-300 ${FONTS[fontIndex]}`}>
            {displayText}
            <span className="inline-block w-1 h-4 bg-brand-red ml-1 animate-pulse" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-8xl font-display font-black leading-tight mb-8 tracking-tighter"
        >
          WHERE STREET CULTURE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-accent-dark">
            MEETS PREMIUM FASHION
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-brand-muted mb-12 leading-relaxed"
        >
          Experience the evolution of urban style. Splendour Streetwear combines raw street aesthetics with high-end craftsmanship for the modern icon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link to="/info/collections" className="group relative bg-brand-red text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:bg-brand-accent-dark flex items-center gap-2 overflow-hidden">
            <span className="relative z-10">Explore Collection</span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>
          <Link to="/info/lookbook" className="px-10 py-4 rounded-full font-bold text-lg border border-white/20 hover:bg-white/5 transition-all">
            View Lookbook
          </Link>
        </motion.div>
      </div>

      {/* Bottom Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Scroll to Explore</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-0.5 h-12 bg-gradient-to-b from-brand-red to-transparent"
        ></motion.div>
      </motion.div>
    </section>
  );
}
