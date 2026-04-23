import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler } from 'lucide-react';

interface SizeGuidePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuidePopup({ isOpen, onClose }: SizeGuidePopupProps) {
  const sizes = [
    { size: 'S', chest: '36-38', length: '27', sleeve: '8.5' },
    { size: 'M', chest: '38-40', length: '28', sleeve: '9' },
    { size: 'L', chest: '40-42', length: '29', sleeve: '9.5' },
    { size: 'XL', chest: '42-44', length: '30', sleeve: '10' },
    { size: 'XXL', chest: '44-46', length: '31', sleeve: '10.5' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-brand-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Ruler className="text-brand-red" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Size Protocol</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted italic">Architectural Dimensions in Inches</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 italic">
                      <th className="py-4 text-[10px] uppercase font-black tracking-widest text-brand-muted">Architectural Size</th>
                      <th className="py-4 text-[10px] uppercase font-black tracking-widest text-brand-muted">Chest (Inches)</th>
                      <th className="py-4 text-[10px] uppercase font-black tracking-widest text-brand-muted">Full Length</th>
                      <th className="py-4 text-[10px] uppercase font-black tracking-widest text-brand-muted">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sizes.map((row) => (
                      <tr key={row.size} className="hover:bg-white/5 transition-colors group">
                        <td className="py-5 font-display font-black text-xl group-hover:text-brand-red transition-colors">{row.size}</td>
                        <td className="py-5 font-mono text-sm text-brand-muted">{row.chest}"</td>
                        <td className="py-5 font-mono text-sm text-brand-muted">{row.length}"</td>
                        <td className="py-5 font-mono text-sm text-brand-muted">{row.sleeve}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-10 p-6 bg-brand-red/5 border border-brand-red/10 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-red leading-relaxed italic">
                  * Note: All garments are engineered for an oversized architectural fit. For a standard fit, synchronize one size down.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
