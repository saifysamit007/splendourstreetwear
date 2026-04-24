import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, X, CheckCircle2, ShieldCheck, Loader2, Copy, Check } from 'lucide-react';
import { formatPrice } from '../constants';
import { useStore } from '../store/useStore';

interface BKashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (details: { bkashNumber: string; transactionId: string }) => void;
  total: number;
}

export default function BKashModal({ isOpen, onClose, onSuccess, total }: BKashModalProps) {
  const { siteConfig } = useStore();
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const bkashNumber = siteConfig.footer.bkashNumber || siteConfig.footer.whatsapp;

  const handleCopy = () => {
    navigator.clipboard.writeText(bkashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber || !transactionId) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);

    onSuccess({
      bkashNumber: senderNumber,
      transactionId: transactionId.toUpperCase()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 mt-16 lg:mt-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[#e2136e] rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-white/10"
      >
        {/* Header */}
        <div className="bg-white p-6 flex justify-between items-center">
          <img 
            src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" 
            alt="bKash" 
            className="h-10 object-contain"
          />
          <button onClick={onClose} className="p-2 text-[#e2136e] hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[#b31057] p-5 px-8 text-white space-y-4">
           <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Amount</span>
              <span className="text-xl font-display font-black">{formatPrice(total)}</span>
           </div>
           
           <div className="space-y-4">
              <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                Send <span className="font-black underline">Send Money</span> to the bKash Personal Number below:
              </p>
              
              <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between group border border-white/5">
                 <div>
                    <p className="text-[9px] uppercase font-black opacity-50 mb-1">bKash Personal Number</p>
                    <p className="text-xl font-mono font-bold tracking-tighter">{bkashNumber}</p>
                 </div>
                 <button 
                  onClick={handleCopy}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                 >
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                 </button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="p-1.5 bg-white/10 rounded-full mt-0.5">
                    <ShieldCheck size={12} />
                 </div>
                 <p className="text-[10px] leading-relaxed opacity-70">
                    Pay the exact amount and copy the <span className="font-black text-white italic">Transaction ID</span> from your bKash confirmation message or app.
                 </p>
              </div>
           </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/70 ml-2">Sender bKash Number</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                  required
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full bg-[#b31057] border-white/20 border-2 rounded-xl p-4 pl-12 text-white placeholder:text-white/30 font-bold focus:outline-none focus:border-white transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/70 ml-2">Transaction ID (TrxID)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                  required
                  type="text"
                  placeholder="8XJ42K9L..."
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-[#b31057] border-white/20 border-2 rounded-xl p-4 pl-12 text-white placeholder:text-white/30 font-bold focus:outline-none focus:border-white transition-all shadow-inner uppercase tracking-wider"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || senderNumber.length < 11 || transactionId.length < 8}
            className="w-full bg-white text-[#e2136e] py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-black/20 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Confirm Payment
                <CheckCircle2 size={18} className="group-hover:scale-125 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="bg-[#b31057] py-4 text-center">
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center justify-center gap-2">
              <ShieldCheck size={12} /> Encrypted Payment Channel
           </p>
        </div>
      </motion.div>
    </div>
  );
}
