import React, { useState, useEffect } from 'react';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type?: string;
  thumbnail_url?: string;
  like_count?: number;
  comments_count?: number;
}

const fallbackPosts = [
  { id: '1', image: 'https://picsum.photos/seed/street1/600/600', likes: '1.2k', comments: '45' },
  { id: '2', image: 'https://picsum.photos/seed/urban2/600/600', likes: '890', comments: '32' },
  { id: '3', image: 'https://picsum.photos/seed/fashion3/600/600', likes: '2.1k', comments: '120' },
  { id: '4', image: 'https://picsum.photos/seed/architecture4/600/600', likes: '1.5k', comments: '64' },
  { id: '5', image: 'https://picsum.photos/seed/sneaker5/600/600', likes: '1.1k', comments: '38' },
  { id: '6', image: 'https://picsum.photos/seed/dhaka6/600/600', likes: '3.4k', comments: '210' },
];

export default function Footer() {
  const { siteConfig } = useStore();
  const location = useLocation();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstagram() {
      try {
        const res = await fetch('/api/instagram');
        const data = await res.json();
        
        if (res.ok && data.data) {
          setPosts(data.data.slice(0, 6));
        } else {
          setError(data.message || 'Config Pending');
        }
      } catch (err) {
        setError('Network Error');
      } finally {
        setLoading(false);
      }
    }
    fetchInstagram();
  }, []);

  return (
    <footer className="bg-brand-bg pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        {/* Instagram Feed Section */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-white">{siteConfig.footer.instagramHandle}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red flex items-center gap-2">
                Architecture of the Streets 
                {error && <span className="text-white/20 ml-2 border-l border-white/10 pl-2">ARCHIVE MODE</span>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {error && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <AlertCircle size={12} className="text-brand-muted" />
                  <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Connect API to Load Live Feed</span>
                </div>
              )}
              <a 
                href={siteConfig.footer.social.find(s => s.platform === 'Instagram')?.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all flex items-center gap-2 shadow-2xl"
              >
                <Instagram size={14} /> Follow Registry
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {posts.length > 0 ? (
              posts.map((post) => (
                <a 
                  key={post.id} 
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden bg-white/5 rounded-2xl"
                >
                  <img 
                    src={post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url} 
                    alt={post.caption || 'Instagram post'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-brand-red/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <div className="flex items-center gap-4 text-white mb-2">
                      <div className="flex flex-col items-center gap-1">
                        <Heart size={16} fill="white" />
                        <span className="text-[10px] font-black font-mono">{post.like_count || '0'}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <MessageCircle size={16} fill="white" />
                        <span className="text-[10px] font-black font-mono">{post.comments_count || '0'}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Instagram size={16} />
                        <span className="text-[10px] font-black font-mono">10+</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white px-3 py-1 border border-white/20 rounded-full">View Original</span>
                  </div>
                </a>
              ))
            ) : loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse border border-white/5" />
              ))
            ) : (
              // Fallback / Archive Mode
              fallbackPosts.map((post) => (
                <a 
                  key={post.id} 
                  href={siteConfig.footer.social.find(s => s.platform === 'Instagram')?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden bg-white/5 rounded-2xl"
                >
                  <img 
                    src={post.image} 
                    alt={`Archive post ${post.id}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2 opacity-40 group-hover:opacity-100 saturate-0 group-hover:saturate-100"
                  />
                  <div className="absolute inset-0 bg-brand-red/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <div className="flex items-center gap-4 text-white mb-2">
                       <div className="flex flex-col items-center gap-1">
                         <Heart size={16} fill="white" />
                         <span className="text-[10px] font-black font-mono">{post.likes}</span>
                       </div>
                       <div className="flex flex-col items-center gap-1">
                         <MessageCircle size={16} fill="white" />
                         <span className="text-[10px] font-black font-mono">{post.comments}</span>
                       </div>
                       <div className="flex flex-col items-center gap-1">
                         <Instagram size={16} />
                         <span className="text-[10px] font-black font-mono">15+</span>
                       </div>
                    </div>
                    <Instagram size={20} className="text-white mt-1" />
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-display font-black tracking-tighter text-white mb-6 block uppercase">
              SPLENDOUR<span className="text-brand-red ml-0.5">.</span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed mb-8">
              Splendour isn't just a brand; it's a statement. We believe in the power of the streets and the elegance of high fashion, creating architectural streetwear for the modern icon.
            </p>
            <div className="flex space-x-4">
               {siteConfig.footer.social.map((social) => (
                 <a 
                   key={social.platform} 
                   href={social.url} 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red transition-all transform hover:scale-110"
                   aria-label={social.platform}
                 >
                   {social.platform === 'Instagram' && <Instagram size={18} />}
                   {social.platform === 'Twitter' && <Twitter size={18} />}
                   {social.platform === 'Facebook' && <Facebook size={18} />}
                   {social.platform === 'Youtube' && <Youtube size={18} />}
                 </a>
               ))}
            </div>
          </div>

          <div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white border-b border-white/5 pb-4">Signal Hub</h4>
             <ul className="space-y-4 text-brand-muted text-sm font-medium">
               <li className="flex items-center gap-3">
                 <Mail size={14} className="text-brand-red" />
                 <a href={`mailto:${siteConfig.footer.email}`} className="hover:text-white transition-colors">{siteConfig.footer.email}</a>
               </li>
               <li className="flex items-center gap-3">
                 <Phone size={14} className="text-brand-red" />
                 <a 
                   href={`https://wa.me/${siteConfig.footer.whatsapp}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="hover:text-white transition-colors"
                 >
                   {siteConfig.footer.phone}
                 </a>
               </li>
               <li className="flex items-center gap-3">
                 <MapPin size={14} className="text-brand-red" />
                 <a 
                   href={siteConfig.footer.mapUrl} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="hover:text-white transition-colors"
                 >
                   {siteConfig.footer.address}
                 </a>
               </li>
             </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white border-b border-white/5 pb-4">Registry</h4>
            <ul className="space-y-4 text-brand-muted text-sm">
              <li><Link to="/info/shipping-info" className="hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]">Shipping Info</Link></li>
              <li><Link to="/info/returns-exchanges" className="hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]">Returns & Exchanges</Link></li>
              <li><Link to="/info/contact-us" className="hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white border-b border-white/5 pb-4">The Collective</h4>
            <ul className="space-y-4 text-brand-muted text-sm">
              {[
                { name: 'Lookbook', href: '/info/lookbook' },
                { name: 'Collections', href: '/info/collections' },
                { name: 'Our Story', href: '/info/our-story' },
                { name: 'Size Guide', href: '/size-guide' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest">
            © 2026 SPLENDOUR ARCHITECTURAL STREETWEAR. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-6 text-[10px] font-black uppercase tracking-widest text-brand-muted">
            <Link to="/info/terms-of-service" className="hover:text-white">Terms</Link>
            <Link to="/info/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link to="/info/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
