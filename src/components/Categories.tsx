import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

type CategoryItem = {
  name: string;
  image: string;
  video?: string;
  grid: string;
};

function CategoryCard({ cat, idx }: { cat: CategoryItem, idx: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link 
      to={`/shop?category=${cat.name}`}
      className={cn(cat.grid, "h-full")}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full rounded-3xl overflow-hidden group cursor-pointer shadow-xl"
      >
        <div className="w-full h-full relative" style={{ transform: "translateZ(20px)" }}>
          {cat.video ? (
            <video 
              src={cat.video}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          ) : (
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
            <h4 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ transform: "translateZ(40px)" }}>{cat.name}</h4>
            <p 
              className="text-sm text-brand-muted font-medium translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
              style={{ transform: "translateZ(30px)" }}
            >
              Explore Collection →
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Categories() {
  const { siteConfig } = useStore();
  
  const displayCategories = React.useMemo(() => {
    if (!siteConfig?.categories) return [];
    
    return siteConfig.categories.map((name, idx) => {
      const media = siteConfig.categoryMedia?.[name];
      // Define gridding logic
      const grid = idx === 0 ? 'md:col-span-2 md:row-span-2' : 
                   idx === 2 ? 'md:col-span-1 md:row-span-2' : 
                   'md:col-span-1 md:row-span-1';
                   
      return {
        name,
        image: media?.image || `https://picsum.photos/seed/cat-${name}/800/1000`,
        video: media?.video,
        grid
      };
    }).slice(0, 4); // Limit to 4 for grid layout
  }, [siteConfig]);

  if (!displayCategories || displayCategories.length === 0) return null;

  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-brand-red uppercase tracking-[0.3em] mb-4">The Essentials</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight">SHOP BY CATEGORY</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] perspective-1000" style={{ perspective: "1000px" }}>
          {displayCategories.map((cat, idx) => (
            <CategoryCard key={cat.name} cat={cat} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
