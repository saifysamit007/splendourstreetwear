// Streetwear Fallback Image System
// Provides high-res streetwear aesthetic fallbacks when external CDNs (e.g. fbcdn) expire or fail

export const STREETWEAR_IMAGES: Record<string, string[]> = {
  tees: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
  ],
  hoodies: [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'
  ],
  jackets: [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80'
  ],
  pants: [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80'
  ],
  accessories: [
    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80'
  ]
};

export const DEFAULT_PRODUCT_IMAGE = STREETWEAR_IMAGES.tees[0];

export function getProductFallbackImage(name?: string, category?: string): string {
  const cat = (category || '').toLowerCase();
  let pool = STREETWEAR_IMAGES.tees;

  if (cat.includes('hoodie')) pool = STREETWEAR_IMAGES.hoodies;
  else if (cat.includes('jacket')) pool = STREETWEAR_IMAGES.jackets;
  else if (cat.includes('pant') || cat.includes('cargo')) pool = STREETWEAR_IMAGES.pants;
  else if (cat.includes('access') || cat.includes('beanie')) pool = STREETWEAR_IMAGES.accessories;

  if (!name) return pool[0];

  // Deterministic pick based on product name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback?: string
) {
  const target = e.currentTarget;
  if (!target) return;
  
  // Prevent infinite loop if fallback also fails
  if (target.dataset.hasFailed) return;
  target.dataset.hasFailed = 'true';

  const replacement = fallback || DEFAULT_PRODUCT_IMAGE;
  target.src = replacement;
}
