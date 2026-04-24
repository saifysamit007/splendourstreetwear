import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Heart, MessageCircle, AlertCircle } from 'lucide-react';
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
               {siteConfig.footer.social.filter(s => s.platform.toLowerCase() !== 'twitter' && s.platform.toLowerCase() !== 'discord').map((social) => (
                 <a 
                   key={social.platform} 
                   href={social.url} 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red transition-all transform hover:scale-110"
                   aria-label={social.platform}
                 >
                   {social.platform.toLowerCase() === 'instagram' && <Instagram size={18} />}
                   {social.platform.toLowerCase() === 'facebook' && <Facebook size={18} />}
                   {social.platform.toLowerCase() === 'youtube' && <Youtube size={18} />}
                   {social.platform.toLowerCase() === 'tiktok' && (
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                     </svg>
                   )}
                   {social.platform.toLowerCase() === 'whatsapp' && (
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.006L0 24l6.117-1.604a11.845 11.845 0 005.929 1.64h.005c6.634 0 12.032-5.396 12.035-12.031a11.808 11.808 0 00-3.58-8.502" />
                       </svg>
                    )}
                    {social.platform.toLowerCase() === 'discord' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.666 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057c2.42 1.782 4.763 2.863 7.057 3.57a.078.078 0 0 0 .084-.028c.541-.74 1.016-1.536 1.417-2.378a.077.077 0 0 0-.041-.106 13.107 13.107 0 0 1-1.887-.9.077.077 0 0 1-.008-.128c.125-.094.252-.192.372-.293a.074.074 0 0 1 .077-.01c4.61 2.12 9.611 2.12 14.17 0a.074.074 0 0 1 .077.01c.12.101.247.199.373.293a.077.077 0 0 1-.007.128 12.986 12.986 0 0 1-1.888.9.076.076 0 0 0-.041.107c.4.843.875 1.637 1.416 2.378a.079.079 0 0 0 .085.028c2.302-.707 4.646-1.788 7.067-3.57a.078.078 0 0 0 .031-.056c.5-5.174-.84-9.66-3.53-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
                      </svg>
                    )}
                 </a>
               ))}
               {siteConfig.footer.whatsapp && !siteConfig.footer.social.some(s => s.platform.toLowerCase() === 'whatsapp') && (
                 <a 
                   href={`https://wa.me/${siteConfig.footer.whatsapp}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red transition-all transform hover:scale-110"
                   aria-label="WhatsApp"
                 >
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.006L0 24l6.117-1.604a11.845 11.845 0 005.929 1.64h.005c6.634 0 12.032-5.396 12.035-12.031a11.808 11.808 0 00-3.58-8.502" />
                   </svg>
                 </a>
               )}
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
