import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, ArrowRight, Share2, Navigation } from 'lucide-react';
import { useStore } from '../store/useStore';
import SEO from '../components/SEO';

export default function Location() {
  const siteConfig = useStore(state => state.siteConfig);

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      <SEO title="Registry Headquarters | Splendour" description="Find our architectural headquarters in the heart of Dhaka." />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Info Section */}
          <div className="w-full lg:w-1/3 space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full mb-4"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">Operational Base</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none mb-6"
              >
                Registry <br /> Headquarters
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-brand-muted text-lg font-medium leading-relaxed"
              >
                The central node for architectural streetwear and urban innovation. Visit our concept space.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div className="flex gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-brand-red/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">Location Terminal</h3>
                  <p className="text-brand-muted text-sm font-medium">{siteConfig.footer.address}</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-brand-red/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0 group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">Registry Hours</h3>
                  <p className="text-brand-muted text-sm font-medium">Saturday – Thursday: 10:00 – 21:00</p>
                  <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest mt-1 text-brand-red">Friday: CLOSED FOR PRODUCTION</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-brand-red/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0 group-hover:scale-110 transition-transform">
                  <Navigation size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">Quick Access</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a 
                      href={siteConfig.footer.mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-red hover:text-white transition-all flex items-center gap-2"
                    >
                      Open in Maps <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map Display Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full lg:w-2/3 aspect-video lg:aspect-square bg-brand-card rounded-[32px] md:rounded-[60px] overflow-hidden border border-white/5 relative group"
            >
            {/* Simulation of a professional map interface */}
            <div className="absolute inset-0 bg-[#121212] overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116833.83187895475!2d90.3372881!3d23.7808874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1713583200000!5m2!1sen!2sbd" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Map Overlay Controls */}
            <div className="absolute top-8 right-8 flex flex-col gap-3">
              <button className="p-4 bg-brand-bg/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-brand-red transition-all shadow-2xl">
                <Share2 size={20} />
              </button>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="p-8 bg-brand-bg/80 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-red flex items-center justify-center text-white">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tighter text-white">Splendour Operational Node</h4>
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{siteConfig.footer.address}</p>
                  </div>
                </div>
                <a 
                  href={siteConfig.footer.mapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-8 py-4 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Confirm Navigation <Navigation size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
