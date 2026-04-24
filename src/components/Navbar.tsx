import { ShoppingCart, User, Menu, X, LogOut, Settings, Search, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { cart, searchQuery, setSearchQuery, siteConfig, products } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = useMemo(() => {
    if (!user || !user.email) return false;
    const adminEmails = ['saifysamit@gmail.com', 'splendourstreetwear@gmail.com'];
    return adminEmails.includes(user.email.toLowerCase());
  }, [user]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !isSearchOpen && !mobileMenuOpen) return [];
    const query = searchQuery.toLowerCase().trim();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.tag?.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags?.some(t => t.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchQuery, products, isSearchOpen, mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'glass-nav py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-display font-black tracking-tighter text-white uppercase">
              SPLENDOUR<span className="text-brand-red ml-0.5">.</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { name: 'Home', href: '/' },
              { name: 'Shop', href: '/shop' },
              { name: 'Collections', href: '/info/collections' },
              { name: 'Lookbook', href: '/info/lookbook' },
              { name: 'About', href: '/info/our-story' }
            ].map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="group relative overflow-hidden h-4"
              >
                <motion.div
                  whileHover={{ y: -16 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col"
                >
                  <span className="text-sm font-black text-brand-muted uppercase tracking-widest text-[10px] h-4 flex items-center">
                    {link.name}
                  </span>
                  <span className="text-sm font-black text-brand-red uppercase tracking-widest text-[10px] h-4 flex items-center">
                    {link.name}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/shop');
                        setIsSearchOpen(false);
                      }
                    }}
                    className="bg-white/5 border border-white/10 rounded-full px-4 py-1 text-sm focus:outline-none focus:border-brand-red mr-2"
                  />
                )}
              </AnimatePresence>

              {/* Desktop Suggestions */}
              <AnimatePresence>
                {isSearchOpen && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-4 w-72 bg-brand-card border border-white/10 rounded-2xl p-2 shadow-2xl z-[110]"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted p-3 border-b border-white/5 mb-1">
                      Matched Pieces
                    </div>
                    {searchSuggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all group"
                      >
                        <div className="w-12 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/5">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{product.name}</p>
                          <p className="text-[10px] text-brand-muted uppercase tracking-widest">{product.category}</p>
                          <p className="text-[10px] font-mono text-brand-red mt-1">TK {product.price}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        navigate(`/shop`);
                        setIsSearchOpen(false);
                      }}
                      className="w-full mt-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted hover:text-white border-t border-white/5 transition-colors"
                    >
                      View All Results →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-white hover:text-brand-red transition-colors"
              >
                <Search size={20} />
              </button>
            </div>

            <button 
              onClick={() => setCartOpen(true)}
              className="text-white hover:text-brand-red transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-red text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-full transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      user.displayName?.charAt(0) || user.email?.charAt(0)
                    )}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.displayName || 'User'}</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 bg-brand-card border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]"
                    >
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                          <LayoutDashboard size={16} /> Admin Panel
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        <Settings size={16} /> Settings
                      </Link>
                      <div className="h-[1px] bg-white/10 my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => openAuth('login')}
                  className="text-sm font-medium hover:text-brand-red transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => openAuth('signup')}
                  className="bg-brand-red hover:bg-brand-accent-dark text-white px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setCartOpen(true)} className="text-white relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-red text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] md:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 bg-brand-bg md:hidden"
              >
              <div className="flex flex-col p-6 space-y-4">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/shop');
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-red"
                  />
                </div>

                {/* Mobile Suggestions */}
                <AnimatePresence>
                  {searchSuggestions.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2 mb-4 bg-white/5 rounded-2xl p-2"
                    >
                      {searchSuggestions.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            setMobileMenuOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-4 p-2 hover:bg-white/5 rounded-xl transition-all"
                        >
                          <div className="w-10 h-14 bg-white/10 rounded-lg overflow-hidden shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{product.name}</p>
                            <p className="text-[10px] font-mono text-brand-red">TK {product.price}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Shop', href: '/shop' },
                  { name: 'Collections', href: '/info/collections' },
                  { name: 'Lookbook', href: '/info/lookbook' },
                  { name: 'About', href: '/info/our-story' }
                ].map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-black text-brand-muted hover:text-white transition-colors uppercase tracking-[0.2em]"
                  >
                    {link.name}
                  </Link>
                ))}
                
                {user ? (
                  <div className="pt-4 flex flex-col space-y-4">
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl"
                      >
                        <LayoutDashboard size={18} />
                        <span className="font-bold">Admin Panel</span>
                      </Link>
                    )}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center font-bold">
                        {user.displayName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{user.displayName}</p>
                        <p className="text-xs text-brand-muted">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-center py-3 bg-brand-red/10 text-brand-red rounded-lg font-bold"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 flex flex-col space-y-4">
                    <button 
                      onClick={() => openAuth('login')}
                      className="text-center py-3 border border-white/10 rounded-lg"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => openAuth('signup')}
                      className="text-center py-3 bg-brand-red rounded-lg font-bold"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </nav>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode} 
      />
      <CartDrawer 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}
