export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  specs: {
    material: string;
    weight: string;
    comfort: string;
  };
  sizes: number[];
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Brown-boy',
    brand: 'MP4',
    price: 245,
    originalPrice: 280,
    rating: 4.8,
    reviews: 342,
    category: 'Performance',
    image: '/products/brown-boy.jpeg',
    images: ['/products/brown-boy.jpeg', '/products/brown-boy.jpeg'],
    description: 'The ultimate performance palms designed for maximum comfort and style. Engineered with advanced cushioning technology for all-day wear.',
    specs: {
      material: 'Premium Mesh & Suede',
      weight: '285g',
      comfort: 'Ultra-responsive cushioning'
    },
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    inStock: true,
  },
  {
    id: '2',
    name: 'Choco Sandal',
    brand: 'MP4',
    price: 189,
    rating: 4.7,
    reviews: 218,
    category: 'Classic',
    image: '/products/choco-sandal.jpeg',
    images: ['/products/choco-sandal.jpeg', '/products/choco-sandal.jpeg'],
    description: 'Timeless design meets modern comfort. A versatile palms that works with any wardrobe.',
    specs: {
      material: 'Full Grain Leather',
      weight: '310g',
      comfort: 'Padded insole technology'
    },
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    inStock: true,
  },
  {
    id: '3',
    name: 'Pushing-p',
    brand: 'MP4',
    price: 215,
    originalPrice: 260,
    rating: 4.9,
    reviews: 487,
    category: 'Running',
    image: '/products/pushing-p.jpeg',
    images: ['/products/pushing-p.jpeg', '/products/pushgin-p.jpeg'],
    description: 'Lightning-fast responsiveness with minimal weight. Perfect for runners who demand performance.',
    specs: {
      material: 'Knit Mesh & Carbon Fiber',
      weight: '245g',
      comfort: 'Responsive gel cushioning'
    },
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    inStock: true,
  },
  {
    id: '4',
    name: 'Dimkpa',
    brand: 'MP4',
    price: 275,
    rating: 4.6,
    reviews: 156,
    category: 'Performance',
    image: '/products/Dimkpa.jpeg',
    images: ['/products/Dimkpa.jpeg', '/products/Dimkpa.jpeg'],
    description: 'Maximum speed, maximum style. The choice of professional athletes.',
    specs: {
      material: 'Advanced Knit Weave',
      weight: '268g',
      comfort: 'Adaptive cushioning system'
    },
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    inStock: true,
  },
  {
    id: '5',
    name: 'Attention',
    brand: 'MP4',
    price: 165,
    rating: 4.5,
    reviews: 89,
    category: 'Casual',
    image: '/products/summit-peak.png',
    images: ['/products/summit-peak.png', '/products/summit-peak.png'],
    description: 'Elevated casual style with premium comfort. Your new favorite everyday palms.',
    specs: {
      material: 'Canvas & Suede Blend',
      weight: '295g',
      comfort: 'Memory foam insole'
    },
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    inStock: true,
  },
  {
    id: '6',
    name: 'Horizon Air',
    brand: 'MP4',
    price: 229,
    rating: 4.7,
    reviews: 312,
    category: 'Casual',
    image: '/products/horizon-air.png',
    images: ['/products/horizon-air.png', '/products/horizon-air.png'],
    description: 'Breathable and lightweight. Perfect for warm weather adventures.',
    specs: {
      material: 'Breathable Mesh',
      weight: '260g',
      comfort: 'Air-flow technology'
    },
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    inStock: true,
  },
  {
    id: '7',
    name: 'Urban Edge',
    brand: 'MP4',
    price: 199,
    originalPrice: 220,
    rating: 4.8,
    reviews: 425,
    category: 'Urban',
    image: '/products/urban-edge.png',
    images: ['/products/urban-edge.png', '/products/urban-edge.png'],
    description: 'Street-ready style with streetwear credibility. Made for the modern urbanite.',
    specs: {
      material: 'Mixed Materials',
      weight: '305g',
      comfort: 'Street-optimized sole'
    },
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    inStock: true,
  },
  {
    id: '8',
    name: 'Legacy Pro',
    brand: 'MP4',
    price: 249,
    rating: 4.9,
    reviews: 534,
    category: 'Performance',
    image: '/products/legacy-pro.png',
    images: ['/products/legacy-pro.png', '/products/legacy-pro.png'],
    description: 'Where heritage meets innovation. The legacy of excellence continues.',
    specs: {
      material: 'Premium Leather',
      weight: '320g',
      comfort: 'Ergonomic arch support'
    },
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    inStock: true,
  },
];

export const categories = [
  'All',
  'Performance',
  'Running',
  'Casual',
  'Urban',
  'Classic',
];

export const testimonials = [
  {
    id: '1',
    author: 'Alex Johnson',
    role: 'Professional Athlete',
    content: 'MP4 KICKS transformed my training routine. The comfort and performance are unmatched.',
    avatar: '👟',
  },
  {
    id: '2',
    author: 'Sarah Chen',
    role: 'palms Enthusiast',
    content: 'Finally found palmss that look as good as they feel. Absolute game changer.',
    avatar: '✨',
  },
  {
    id: '3',
    author: 'Marcus Williams',
    role: 'Urban Designer',
    content: 'The attention to detail in every pair is incredible. These are works of art.',
    avatar: '🎨',
  },
];
