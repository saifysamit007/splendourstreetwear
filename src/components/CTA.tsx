import { motion } from 'motion/react';
import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      // Check if already subscribed
      try {
        const q = query(collection(db, 'subscribers'), where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setStatus('success');
          setMessage('You are already synchronized with our collective.');
          return;
        }
      } catch (e) {
        // If we don't have permission to check (e.g. not admin), just proceed with adding
        console.warn('Duplicate check skipped due to permissions');
      }

      await addDoc(collection(db, 'subscribers'), {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
        status: 'active'
      });

      setStatus('success');
      setMessage('Synchronization successful. Welcome to the collective.');
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      setStatus('error');
      setMessage('Communication failure with the mainframe. Please try again.');
    }
  };

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0 text-white">
        <div className="absolute inset-0 bg-brand-red/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-brand-red)_0%,transparent_70%)] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-7xl font-display font-black mb-8 tracking-tighter"
        >
          JOIN THE SPLENDOUR <br /> MOVEMENT
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-brand-muted mb-12"
        >
          Be the first to know about limited drops, exclusive events, and the future of streetwear.
        </motion.p>
        
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-green-500/30 p-8 rounded-[40px] flex flex-col items-center gap-4"
          >
            <CheckCircle2 className="text-green-500" size={48} />
            <p className="font-bold uppercase tracking-widest text-sm text-green-500">{message}</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubscribe}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === 'loading'}
              className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-brand-red transition-colors disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-brand-red hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Synchronizing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </motion.form>
        )}
        
        {status === 'error' && (
          <p className="mt-4 text-brand-red text-[10px] font-black uppercase tracking-widest">{message}</p>
        )}
      </div>
    </section>
  );
}
