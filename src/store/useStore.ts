import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState, Product, SiteConfig, Order, Review } from '../types';

const initialProducts: Product[] = [
  {
    id: '1',
    name: "Oversized 'Splendour' Hoodie",
    price: 3500,
    image: "https://picsum.photos/seed/hoodie1/600/800",
    images: [
      "https://picsum.photos/seed/hoodie1/600/800",
      "https://picsum.photos/seed/hoodie1-back/600/800",
      "https://picsum.photos/seed/hoodie1-detail/600/800"
    ],
    description: "Our signature heavyweight oversized hoodie. Crafted from 450GSM premium cotton fleece for ultimate comfort and durability. Featuring dropped shoulders and a double-lined hood.",
    tag: "Best Seller",
    category: "Hoodies",
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Midnight Black', 'Slate Grey'],
    stock: 50,
    sizeStock: { 'S': 10, 'M': 15, 'L': 15, 'XL': 10 },
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: '2',
    name: "Midnight Cargo Pants",
    price: 4200,
    image: "https://picsum.photos/seed/pants1/600/800",
    images: [
      "https://picsum.photos/seed/pants1/600/800",
      "https://picsum.photos/seed/pants1-side/600/800"
    ],
    description: "Technical cargo pants with 10 functional pockets. Durable ripstop construction with adjustable ankle toggles and a relaxed fit designed for high-mobility streetwear.",
    tag: "New",
    category: "Pants",
    sizes: ['M', 'L', 'XL'],
    colors: ['Midnight Black'],
    stock: 35,
    sizeStock: { 'M': 10, 'L': 15, 'XL': 10 },
    createdAt: "2024-01-02T00:00:00Z"
  },
  {
    id: '3',
    name: "Graphic 'Culture' Tee",
    price: 1800,
    image: "https://picsum.photos/seed/tee1/600/800",
    images: [
      "https://picsum.photos/seed/tee1/600/800",
      "https://picsum.photos/seed/tee1-print/600/800"
    ],
    description: "Premium heavyweight cotton tee featuring screen-printed graphics inspired by global subcultures. Boxy fit with a thick ribbed collar.",
    tag: "Limited",
    category: "Tees",
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Off-White', 'Black'],
    stock: 100,
    sizeStock: { 'S': 20, 'M': 20, 'L': 20, 'XL': 20, 'XXL': 20 },
    createdAt: "2024-01-03T00:00:00Z"
  },
  {
    id: '4',
    name: "Tech Utility Jacket",
    price: 7500,
    image: "https://picsum.photos/seed/jacket1/600/800",
    images: [
      "https://picsum.photos/seed/jacket1/600/800",
      "https://picsum.photos/seed/jacket1-open/600/800",
      "https://picsum.photos/seed/jacket1-hood/600/800"
    ],
    description: "Water-resistant tech jacket with articulated sleeves and bonded zippers. Lightweight yet incredibly resilient, perfect for layering in transition weather.",
    tag: "Premium",
    category: "Jackets",
    sizes: ['M', 'L', 'XL'],
    colors: ['Slate Grey', 'Deep Blue'],
    stock: 20,
    sizeStock: { 'M': 5, 'L': 10, 'XL': 5 },
    createdAt: "2024-01-04T00:00:00Z"
  },
  {
    id: '5',
    name: "Splendour Beanie - Red",
    price: 1200,
    image: "https://picsum.photos/seed/beanie1/600/800",
    images: ["https://picsum.photos/seed/beanie1/600/800"],
    description: "Soft acrylic rib-knit beanie with embroidered Splendour logo. One size fits all.",
    tag: "Essential",
    category: "Accessories",
    sizes: ['One Size'],
    colors: ['Crimson Red'],
    stock: 150,
    sizeStock: { 'One Size': 150 },
    createdAt: "2024-01-05T00:00:00Z"
  }
];

const initialSiteConfig: SiteConfig = {
  logoText: 'SPLENDOUR',
  navbarLinks: [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collection', href: '/info/collections' },
    { name: 'Lookbook', href: '/info/lookbook' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'About', href: '/info/our-story' },
  ],
  footer: {
    about: "Splendour isn't just a brand; it's a statement. We believe in the power of the streets and the elegance of high fashion.",
    email: "splendourstreetwear@gmail.com",
    phone: "+880 1889010834",
    whatsapp: "8801889010834",
    bkashNumber: "01889010834",
    address: "Dhaka, Bangladesh",
    mapUrl: "https://maps.app.goo.gl/a6TMysredsrmG6hi9",
    instagramHandle: "@splendourstreetwear",
    social: [
      { platform: 'Instagram', url: 'https://instagram.com/splendourstreetwear' },
      { platform: 'Facebook', url: 'https://facebook.com/splendourstreetwear' },
      { platform: 'Youtube', url: 'https://youtube.com/@splendourstreetwear' }
    ]
  },
  categories: ['Hoodies', 'Pants', 'Tees', 'Jackets', 'Accessories'],
  availableTags: ['New', 'Best Seller', 'Limited', 'Premium', 'Essential', 'Sale'],
  invoice: {
    companyName: "Splendour Architectural Streetwear",
    address: "Dhaka, Bangladesh",
    phone: "+880 1889010834",
    email: "splendourstreetwear@gmail.com",
    prefix: "SPL-INV-",
    notes: "Thank you for choosing Splendour. Join the collective."
  },
  isChatbotEnabled: true,
  storyVideos: {
    hero: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-setting-41793-large.mp4",
    crafting: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-sewing-machine-working-34444-large.mp4",
    modeling1: "https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-studio-under-colorful-lighting-41792-large.mp4",
    modeling2: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-on-the-street-under-the-neon-lights-41791-large.mp4",
    modeling3: "https://assets.mixkit.co/videos/preview/mixkit-woman-walking-through-the-streets-at-night-41790-large.mp4",
    mission: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-seamstress-working-in-a-sewing-machine-34443-large.mp4"
  },
  categoryMedia: {
    'Hoodies': { image: 'https://picsum.photos/seed/cat-hoodie/800/1000' },
    'T-Shirts': { image: 'https://picsum.photos/seed/cat-tee/800/1000' },
    'Jackets': { image: 'https://picsum.photos/seed/cat-jacket/800/1000' },
    'Accessories': { image: 'https://picsum.photos/seed/cat-acc/800/1000' },
    'Pants': { image: 'https://picsum.photos/seed/cat-pants/800/1000' }
  },
  showcaseMedia: [
    { image: 'https://picsum.photos/seed/show1/1200/1600' },
    { image: 'https://picsum.photos/seed/show2/1200/1600' },
    { image: 'https://picsum.photos/seed/show3/1200/1600' },
    { image: 'https://picsum.photos/seed/show4/1200/1600' }
  ],
  collections: [
    { name: "Essential Loop", tag: "CORE", image: "https://picsum.photos/seed/coll1/1200/800", desc: "Minimalist silhouettes for everyday utility. Engineered for efficiency.", year: "2026", link: "/shop?category=Accessories" },
    { name: "Cyber Drifter", tag: "LIMITED", image: "https://picsum.photos/seed/coll2/1200/800", desc: "Technical fabrics adapted for the chaos of the city. Industrial aesthetics.", year: "2026", link: "/shop?category=Jackets" },
    { name: "Splendour Origins", tag: "ARCHIVE", image: "https://picsum.photos/seed/coll3/1200/800", desc: "The foundational drop that started the culture. A study in raw form.", year: "2020", link: "/shop" },
    { name: "Dhaka Nights", tag: "NEW", image: "https://picsum.photos/seed/coll4/1200/800", desc: "Reflective detailing inspired by the city after dark. High visibility.", year: "2025", link: "/shop?category=Hoodies" }
  ],
  lookbooks: [
    { id: '01', title: "URBAN DISTORTION", year: "2026", image: "https://picsum.photos/seed/look1/1600/900", type: "Campaign", desc: "Exploring the intersection of architectural lines and movement.", link: "/info/collections" },
    { id: '02', title: "CONCRETE SILENCE", year: "2025", image: "https://picsum.photos/seed/look2/1600/900", type: "Editorial", desc: "A minimalist approach to volume and texture in neutral space.", link: "/info/collections" },
    { id: '03', title: "NEON PULSE", year: "2025", image: "https://picsum.photos/seed/look3/1600/900", type: "Street", desc: "Capturing the kinetic energy of the city through reflective surfaces.", link: "/info/collections" },
    { id: '04', title: "DHAKA EVOLUTION", year: "2024", image: "https://picsum.photos/seed/look4/1600/900", type: "Documentary", desc: "The foundational aesthetic shift. Raw, unfiltered, definitive.", link: "/info/collections" }
  ],
  cookieConsent: {
    enabled: true,
    title: "Privacy Protocol",
    message: "This node uses cookies to optimize your architectural experience inside the Splendour Collective infrastructure.",
    acceptText: "Accept Protocol",
    declineText: "Reject access"
  },
  offerPopup: {
    enabled: true,
    title: "ACCESS GRANTED: 10% OFF",
    message: "Join the collective and synchronize with our newsletter to receive your initial discount protocol code.",
    buttonText: "Join Collective",
    buttonLink: "/shop",
    mediaType: 'video',
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-setting-41793-large.mp4",
    delay: 3
  }
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: initialProducts,
      setProducts: (products) => set({ products }),
      cart: [],
      orders: [],
      coupons: [],
      setCoupons: (coupons) => set({ coupons }),
      addCoupon: (coupon) => set((state) => ({ coupons: [coupon, ...state.coupons] })),
      updateCoupon: (coupon) => set((state) => ({
        coupons: state.coupons.map((c) => (c.id === coupon.id ? coupon : c)),
      })),
      removeCoupon: (id) => set((state) => ({
        coupons: state.coupons.filter((c) => c.id !== id),
      })),
      comments: [],
      siteConfig: initialSiteConfig,
      messages: [],
      setMessages: (messages) => set({ messages }),
      updateMessageStatus: (id, status) => set((state) => ({
        messages: state.messages.map(m => m.id === id ? { ...m, status } : m)
      })),
      favorites: [],
      notifications: [],
      addNotification: (message, type = 'success') => set((state) => {
        const id = Date.now().toString();
        // Auto remove notification after 3 seconds
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        }, 3000);
        return {
          notifications: [...state.notifications, { id, message, type }]
        };
      }),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleFavorite: (productId) => set((state) => {
        const isFavorite = state.favorites.includes(productId);
        const product = state.products.find(p => p.id === productId);
        const productName = product?.name || 'Product';
        
        if (isFavorite) {
          state.addNotification(`${productName} removed from favorites`, 'info');
          return { favorites: state.favorites.filter(id => id !== productId) };
        }
        state.addNotification(`${productName} added to favorites`, 'success');
        return { favorites: [...state.favorites, productId] };
      }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (product) => set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? product : p)),
      })),
      removeProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      setOrders: (orders) => set({ orders }),
      updateOrder: (order) => set((state) => ({
        orders: state.orders.map((o) => (o.id === order.id ? order : o)),
      })),
      addComment: (comment) => set((state) => {
        if (state.comments.some(c => c.id === comment.id)) return state;
        return { comments: [comment, ...state.comments] };
      }),
      likeComment: (commentId) => set((state) => ({
        comments: state.comments.map((c) => 
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        ),
      })),
      dislikeComment: (commentId) => set((state) => ({
        comments: state.comments.map((c) => 
          c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c
        ),
      })),
      updateSiteConfig: (config) => set((state) => ({ 
        siteConfig: { ...state.siteConfig, ...config } 
      })),
      addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        state.addNotification(`${product.name} added to cart`, 'success');
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== id),
      })),
      updateCartQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
        ).filter(item => item.quantity > 0),
      })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'splendour-storage',
    }
  )
);
