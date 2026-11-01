import React, { useState } from 'react';
import { motion } from 'motion/react';
import TShirtBlueprint from '../components/TShirtBlueprint';
import SEO from '../components/SEO';

const sizeData = [
  { size: 'S', length: 28, width: 22, sleeve: 9 },
  { size: 'M', length: 29.5, width: 23.5, sleeve: 9.5 },
  { size: 'L', length: 31, width: 25, sleeve: 10 },
  { size: 'XL', length: 32, width: 26.5, sleeve: 10.5 },
];

export default function SizeGuide() {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  const convert = (val: number) => {
    if (unit === 'cm') return (val * 2.54).toFixed(1);
    return val.toString();
  };

  return (
    <div className="pb-24 min-h-screen bg-brand-bg selection:bg-brand-red selection:text-white">
      <SEO 
        title="Size Guide" 
        description="Comprehensive sizing guide for SPLENDOUR's premium streetwear collections. Find your perfect oversized fit with detailed technical measurements."
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 pt-12 md:pt-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            <h2 className="text-sm font-bold text-brand-red uppercase tracking-[0.4em] mb-4">Master Specifications</h2>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter mb-8 uppercase leading-none">
              FIT <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-accent-dark">SYSTEMS.</span>
            </h1>
            <p className="text-brand-muted text-base md:text-lg max-w-xl leading-relaxed">
              Standardized sizing for the Splendour ecosystem. All measurements are taken flat. Our silhouettes are intentionally oversized for a heavy, structured drape.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-4 bg-brand-card p-2 rounded-2xl border border-white/5 self-start md:self-end"
          >
            <button 
              onClick={() => setUnit('in')}
              className={`px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${unit === 'in' ? 'bg-brand-red text-white' : 'text-brand-muted hover:text-white'}`}
            >
              Inches
            </button>
            <button 
              onClick={() => setUnit('cm')}
              className={`px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${unit === 'cm' ? 'bg-brand-red text-white' : 'text-brand-muted hover:text-white'}`}
            >
              Centimeters
            </button>
          </motion.div>
        </header>

        <div className="space-y-12">
          {/* Detailed T-shirt Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-card border border-white/5 rounded-[32px] md:rounded-[40px] lg:rounded-[48px] p-6 md:p-10 lg:p-16 relative overflow-hidden group shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 lg:mb-16 gap-6">
                <div>
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-2 uppercase italic">Drop Shoulder Silhouette</h3>
                  <div className="flex items-center gap-3">
                    <span className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-brand-red animate-pulse"></span>
                    <span className="text-[8px] md:text-xs font-mono uppercase tracking-[0.3em] text-brand-red font-black">Technical Blueprint 0.1v</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <div className="bg-white/5 px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                    <span className="text-[8px] md:text-[10px] font-mono text-brand-muted uppercase tracking-widest">Weight</span>
                    <span className="text-xs md:text-sm font-bold text-white">400 GSM</span>
                  </div>
                  <div className="bg-white/5 px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                    <span className="text-[8px] md:text-[10px] font-mono text-brand-muted uppercase tracking-widest">Material</span>
                    <span className="text-xs md:text-sm font-bold text-white">Premium Cotton</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="relative order-2 md:order-1">
                  <TShirtBlueprint className="border-none bg-transparent p-0 scale-90 md:scale-100" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] font-mono text-brand-muted uppercase tracking-widest opacity-40 whitespace-nowrap">
                    Symmetrically Balanced Cut
                  </div>
                </div>
                
                <div className="space-y-8 lg:space-y-10 order-1 md:order-2">
                  <div className="overflow-x-auto rounded-3xl border border-white/10 bg-brand-bg/50 backdrop-blur-sm no-scrollbar">
                    <table className="w-full text-left font-mono">
                      <thead>
                        <tr className="bg-white/10">
                          <th className="p-4 md:p-6 border-b border-white/10 text-brand-muted uppercase text-[8px] md:text-[10px] tracking-widest font-black">Tag</th>
                          <th className="p-4 md:p-6 border-b border-white/10 text-brand-muted uppercase text-[8px] md:text-[10px] tracking-widest font-black">Length ({unit})</th>
                          <th className="p-4 md:p-6 border-b border-white/10 text-brand-muted uppercase text-[8px] md:text-[10px] tracking-widest font-black">Width ({unit})</th>
                          <th className="p-4 md:p-6 border-b border-white/10 text-brand-muted uppercase text-[8px] md:text-[10px] tracking-widest font-black">Sleeve ({unit})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeData.map((item) => (
                          <tr key={item.size} className="hover:bg-brand-red/5 transition-colors group">
                            <td className="p-4 md:p-6 border-b border-white/5 font-black text-lg md:text-xl group-hover:text-brand-red transition-colors">{item.size}</td>
                            <td className="p-4 md:p-6 border-b border-white/5 text-xs md:text-sm text-white/80">{convert(item.length)}</td>
                            <td className="p-4 md:p-6 border-b border-white/5 text-xs md:text-sm text-white/80">{convert(item.width)}</td>
                            <td className="p-4 md:p-6 border-b border-white/5 text-xs md:text-sm text-white/80">{convert(item.sleeve)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 md:p-6 bg-brand-red/5 border border-brand-red/10 rounded-2xl">
                      <h4 className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-3">Model Fit Guide</h4>
                      <p className="text-[10px] text-brand-muted leading-relaxed">
                        For a standard oversized fit, take your normal size. <br className="hidden md:block" /> For a truly exaggerated streetwear look, size up.
                      </p>
                    </div>
                    <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Care Instructions</h4>
                      <p className="text-[10px] text-brand-muted leading-relaxed">
                        Wash cold. Hang dry. <br className="hidden md:block" /> Do not iron on prints to preserve technical integrity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Architectural Background Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none">
              <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>
            
            {/* Branding Accent */}
            <div className="absolute top-0 right-0 p-8 md:p-12 pointer-events-none opacity-[0.05]">
              <span className="text-6xl md:text-[120px] font-display font-black leading-none select-none">TS01</span>
            </div>
          </motion.div>

          {/* Footer Assistance */}
          <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 bg-brand-card/30 border border-white/5 rounded-3xl gap-6 italic">
            <p className="text-brand-muted text-xs md:text-sm text-center md:text-left">Note: Measurements are taken for the garment, not the body. Allow ±0.5in variance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
