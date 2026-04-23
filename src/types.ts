export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  tag: string;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number; // For backward compatibility or total
  sizeStock?: Record<string, number>; // Size-specific stock
  tags?: string[];
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  billingAddress?: string;
  items: OrderItem[];
  total: number;
  deliveryCharge: number;
  shippingRegion: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'INTERNATIONAL';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  invoiceId: string;
  paymentMethod: 'COD' | 'bkash';
  paymentDetails?: {
    bkashNumber?: string;
    transactionId?: string;
  };
}

export interface SiteConfig {
  logoText: string;
  navbarLinks: { name: string, href: string }[];
  footer: {
    about: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    mapUrl: string;
    instagramHandle: string;
    social: { platform: string, url: string }[];
  };
  categories: string[];
  availableTags: string[];
  invoice: {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    prefix: string;
    notes: string;
  };
  isChatbotEnabled: boolean;
  storyVideos?: {
    hero: string;
    crafting: string;
    modeling1: string;
    modeling2: string;
    modeling3: string;
    mission: string;
  };
  categoryMedia?: Record<string, { image: string, video?: string }>;
  showcaseMedia?: { image: string, video?: string }[];
  collections?: { name: string, tag: string, image: string, video?: string, desc: string, year: string, link: string }[];
  lookbooks?: { id: string, title: string, year: string, image: string, video?: string, type: string, desc: string, link: string }[];
  cookieConsent?: {
    enabled: boolean;
    title: string;
    message: string;
    acceptText: string;
    declineText: string;
  };
  offerPopup?: {
    enabled: boolean;
    title: string;
    message: string;
    buttonText: string;
    buttonLink: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    delay: number; // in seconds
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  text: string;
  rating: number;
  likes: number;
  dislikes: number;
  images?: string[];
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
}

export interface StoreState {
  products: Product[];
  setProducts: (products: Product[]) => void;
  cart: CartItem[];
  orders: Order[];
  comments: Review[];
  siteConfig: SiteConfig;
  favorites: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (productId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  updateOrder: (order: Order) => void;
  addComment: (comment: Review) => void;
  likeComment: (commentId: string) => void;
  dislikeComment: (commentId: string) => void;
  updateSiteConfig: (config: SiteConfig) => void;
  messages: ContactMessage[];
  setMessages: (messages: ContactMessage[]) => void;
  updateMessageStatus: (id: string, status: ContactMessage['status']) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  notifications: AppNotification[];
  addNotification: (message: string, type?: AppNotification['type']) => void;
  removeNotification: (id: string) => void;
}
