import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Lock, X, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatPrice } from '../constants';

interface BKashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (details: { bkashNumber: string; transactionId: string }) => void;
  total: number;
}

export default function BKashModal({ isOpen, onClose, onSuccess, total }: BKashModalProps) {
  const [step, setStep] = useState<'number' | 'otp' | 'pin' | 'processing' | 'success'>('number');
  const [number, setNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);

    if (step === 'number') setStep('otp');
    else if (step === 'otp') setStep('pin');
    else if (step === 'pin') {
      setStep('processing');
      await new Promise(resolve => setTimeout(resolve, 2500));
      setStep('success');
      setTimeout(() => {
        onSuccess({
          bkashNumber: number,
          transactionId: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase()
        });
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[#e2136e] rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-white p-6 flex justify-between items-center border-b border-[#e2136e]/10">
          <img 
            src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" 
            alt="bKash" 
            className="h-10 object-contain"
          />
          <button onClick={onClose} className="p-2 text-[#e2136e] hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Amount bar */}
        <div className="bg-[#b31057] p-4 px-6 flex justify-between items-center text-white">
           <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="opacity-70" />
              <span className="text-xs font-bold uppercase tracking-wider">Splendour Collective</span>
           </div>
           <div className="text-right">
              <span className="text-[10px] block opacity-70 uppercase font-black">Amount</span>
              <span className="text-sm font-black">{formatPrice(total)}</span>
           </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            {step === 'number' && (
              <motion.div key="number" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-bold text-lg">bKash Account Number</h3>
                  <p className="text-white/70 text-xs">Enter your bKash account number to begin</p>
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input 
                    type="tel"
                    placeholder="e.g. 01XXXXXXXXX"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full bg-[#b31057] border-white/20 border-2 rounded-xl p-4 pl-12 text-white placeholder:text-white/30 text-lg font-bold focus:outline-none focus:border-white transition-all shadow-inner"
                  />
                </div>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-bold text-lg">Enter Verification Code</h3>
                  <p className="text-white/70 text-xs">We've sent a 6-digit OTP to {number}</p>
                </div>
                <div className="relative">
                   <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                   <input 
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#b31057] border-white/20 border-2 rounded-xl p-4 pl-12 text-white placeholder:text-white/30 text-lg font-bold tracking-[1em] focus:outline-none focus:border-white transition-all shadow-inner"
                  />
                </div>
                <p className="text-center text-[10px] text-white/50 uppercase font-black cursor-pointer hover:text-white transition-colors">Resend Verification Code</p>
              </motion.div>
            )}

            {step === 'pin' && (
              <motion.div key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-bold text-lg">Enter bKash PIN</h3>
                  <p className="text-white/70 text-xs">Finalize your transaction with your secure PIN</p>
                </div>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                   <input 
                    type="password"
                    maxLength={5}
                    placeholder="•••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-[#b31057] border-white/20 border-2 rounded-xl p-4 pl-12 text-white placeholder:text-white/30 text-2xl font-bold tracking-[1em] focus:outline-none focus:border-white transition-all shadow-inner"
                  />
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow flex flex-col items-center justify-center space-y-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
                />
                <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Verifying Gateway Access...</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-grow flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                   <CheckCircle2 size={48} className="text-[#e2136e]" />
                </div>
                <div className="text-center space-y-2 text-white">
                  <h3 className="font-display font-black uppercase italic text-2xl">Verified</h3>
                  <p className="text-xs opacity-70">Payment protocol established successfully</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(step === 'number' || step === 'otp' || step === 'pin') && (
            <div className="pt-4 mt-auto">
               <button 
                onClick={handleNext}
                disabled={loading || (step === 'number' && number.length < 11) || (step === 'otp' && otp.length < 6) || (step === 'pin' && pin.length < 5)}
                className="w-full bg-white text-[#e2136e] py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#b31057] hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Confirm Protocol'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#b31057] p-6 text-center space-y-2">
           <div className="flex items-center justify-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={12} /> SSL Secure Architecture
           </div>
        </div>
      </motion.div>
    </div>
  );
}

const ShoppingBag = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
