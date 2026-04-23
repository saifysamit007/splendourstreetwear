import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { Suspense, lazy, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCollection from './components/FeaturedCollection';
import Categories from './components/Categories';
import Showcase from './components/Showcase';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import FirebaseSync from './components/FirebaseSync';
import CookieConsent from './components/CookieConsent';
import OfferPopup from './components/OfferPopup';
import NotificationToast from './components/NotificationToast';
import SEO from './components/SEO';
import { motion } from 'motion/react';
import { cn } from './lib/utils';

// Lazy load pages for performance
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const SizeGuide = lazy(() => import('./pages/SizeGuide'));
const Profile = lazy(() => import('./pages/Profile'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Location = lazy(() => import('./pages/Location'));

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen bg-brand-bg flex items-center justify-center">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
      className="text-4xl font-display font-black tracking-tighter text-white"
    >
      SPLENDOUR<span className="text-brand-red">.</span>
    </motion.div>
  </div>
);

function HomePage() {
  return (
    <>
      <SEO title="Premium Streetwear Architecture" />
      <Hero />
      <FeaturedCollection />
      <Categories />
      <Showcase />
      <CTA />
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
    >
      <Navbar />
      <FirebaseSync />
      <main className={cn("flex-grow", !isHome && "pt-24 lg:pt-32")}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/location" element={<Location />} />
            <Route path="/info/:slug" element={<InfoPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Chatbot />
      <CookieConsent />
      <OfferPopup />
      <NotificationToast />
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
