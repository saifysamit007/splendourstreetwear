import { motion } from 'motion/react';
import { useStore } from '../store/useStore';

export default function Showcase() {
  const { siteConfig } = useStore();
  
  const images = siteConfig.showcaseMedia || [
    { image: 'https://picsum.photos/seed/show1/1200/1600' },
    { image: 'https://picsum.photos/seed/show2/1200/1600' },
    { image: 'https://picsum.photos/seed/show3/1200/1600' },
    { image: 'https://picsum.photos/seed/show4/1200/1600' },
  ];

  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-sm font-bold text-brand-red uppercase tracking-[0.3em] mb-4">Visual Identity</h2>
            <h3 className="text-4xl md:text-6xl font-display font-bold tracking-tighter leading-tight">
              A NEW ERA OF <br /> STREET LUXURY
            </h3>
          </div>
          <p className="text-brand-muted text-lg leading-relaxed">
            Splendour isn't just a brand; it's a statement. We believe in the power of the streets and the elegance of high fashion. Every piece is designed to tell a story of ambition, culture, and uncompromising quality.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="aspect-[3/5] rounded-2xl overflow-hidden group"
            >
              {item.video ? (
                <video 
                  src={item.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0"
                />
              ) : (
                <img
                  src={item.image}
                  alt={`Showcase ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
