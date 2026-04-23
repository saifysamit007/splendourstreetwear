import { motion } from 'motion/react';

export default function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-brand-red/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-brand-red)_0%,transparent_70%)] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-brand-red transition-colors"
          />
          <button className="w-full sm:w-auto bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-300">
            Subscribe Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}
