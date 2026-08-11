import { Product, Category, Brand, BlogArticle, PublicSettings, Banner } from '../types/storefront';

export const MOCK_PUBLIC_SETTINGS: PublicSettings = {
  branding: {
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    logoDarkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    faviconUrl: '/favicon.ico',
    primaryColor: '#e11d48',
    secondaryColor: '#0f172a',
  },
  seo: {
    metaTitle: 'Vyzobd | Premium Next-Gen Electronics & Audio',
    metaDescription: 'Shop the future of minimalist hardware. High-fidelity spatial audio, active noise cancelling headphones, and aerospace-grade smartwatches.',
    ogImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    twitterHandle: '@vyzobd',
  },
  shipping: {
    freeShippingThreshold: 99,
    flatRateShippingFee: 12,
    estimatedDeliveryDays: '2-5 Business Days',
  },
  tax: {
    taxEnabled: true,
    taxRate: 0.08,
    pricesIncludeTax: false,
  },
  general: {
    siteName: 'Vyzobd Storefront',
    siteTitle: 'Vyzobd | Precision Engineering. Minimalist Soul.',
    currency: 'USD',
    currencySymbol: '$',
    storePhone: '+1 (800) 555-2872',
    storeEmail: 'support@vyzobd.com',
    storeAddress: '100 Market Street, San Francisco, CA 94105',
  },
  siteName: 'Vyzobd Storefront',
  siteTitle: 'Vyzobd | Premium Next-Gen Electronics & Audio',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
  faviconUrl: '/favicon.ico',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 99,
  supportEmail: 'support@vyzobd.com',
  supportPhone: '+1 (800) 555-2872',
  announcementBanner: {
    enabled: true,
    text: '⚡ FLASH SALE: Save up to 35% on Flagship ANC Headphones & Smart Audio Gear!',
    linkText: 'Shop Deals Now',
    linkUrl: '#deals',
  },
  socialLinks: {
    twitter: 'https://twitter.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
  },
};

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'audio-headphones',
    name: 'Audio & Headphones',
    description: 'High-fidelity spatial audio, active noise cancelling, and audiophile gear.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    itemCount: 14,
    iconName: 'Headphones',
    subcategories: [
      { id: 'sub-1', name: 'Wireless Over-Ear', slug: 'wireless-over-ear' },
      { id: 'sub-2', name: 'True Wireless Earbuds', slug: 'true-wireless-earbuds' },
      { id: 'sub-3', name: 'DAC & Amplifiers', slug: 'dac-amplifiers' },
    ],
  },
  {
    id: 'cat-2',
    slug: 'smart-wearables',
    name: 'Smart Wearables',
    description: 'Advanced fitness trackers, health monitors, and AMOLED smartwatches.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    itemCount: 9,
    iconName: 'Watch',
    subcategories: [
      { id: 'sub-4', name: 'Fitness Watches', slug: 'fitness-watches' },
      { id: 'sub-5', name: 'Smart Rings', slug: 'smart-rings' },
    ],
  },
  {
    id: 'cat-3',
    slug: 'laptops-computing',
    name: 'Laptops & Workstations',
    description: 'Ultra-thin notebooks, creator workstations, and mechanical keyboards.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    itemCount: 12,
    iconName: 'Laptop',
    subcategories: [
      { id: 'sub-6', name: 'Ultra-Portables', slug: 'ultra-portables' },
      { id: 'sub-7', name: 'Mechanical Keyboards', slug: 'mechanical-keyboards' },
      { id: 'sub-8', name: 'USB-C Docks & Hubs', slug: 'docks-hubs' },
    ],
  },
  {
    id: 'cat-4',
    slug: 'mobile-accessories',
    name: 'Power & Charging',
    description: 'GaN fast chargers, Qi2 magnetic power banks, and braided cables.',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
    itemCount: 18,
    iconName: 'Zap',
    subcategories: [
      { id: 'sub-9', name: 'MagSafe & Qi2 Chargers', slug: 'magsafe-chargers' },
      { id: 'sub-10', name: 'High Capacity Power Banks', slug: 'power-banks' },
    ],
  },
  {
    id: 'cat-5',
    slug: 'gaming-streaming',
    name: 'Gaming & Studio Gear',
    description: '4K webcams, condenser studio microphones, and precision gaming mice.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    itemCount: 11,
    iconName: 'Gamepad2',
    subcategories: [
      { id: 'sub-11', name: 'Studio Microphones', slug: 'studio-microphones' },
      { id: 'sub-12', name: 'Gaming Mice & Pads', slug: 'gaming-mice' },
    ],
  },
];

export const MOCK_BRANDS: Brand[] = [
  {
    id: 'b-1',
    slug: 'vyzobd',
    name: 'Vyzobd Studio',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    description: 'Engineering cutting-edge acoustics, wireless charging, and ergonomic peripherals.',
    featuredProductCount: 18,
  },
  {
    id: 'b-2',
    slug: 'soundcore',
    name: 'Soundcore Acoustics',
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    description: 'Precision hybrid active noise cancellation audio drivers.',
    featuredProductCount: 12,
  },
  {
    id: 'b-3',
    slug: 'anker-charge',
    name: 'Anker Power',
    logo: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80',
    description: 'World-leading Gallium Nitride (GaN) fast charging technology.',
    featuredProductCount: 15,
  },
  {
    id: 'b-4',
    slug: 'razer-gear',
    name: 'Keychron Pro',
    logo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80',
    description: 'Custom mechanical keyboards with hot-swappable tactile switches.',
    featuredProductCount: 8,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'aura-studio-pro-wireless-anc-headphones',
    name: 'Aura Studio Pro ANC Wireless Headphones',
    subtitle: 'Spatial Audio with Head Tracking & 65-Hour Battery',
    brand: 'Vyzobd Studio',
    brandId: 'b-1',
    category: 'Audio & Headphones',
    categoryId: 'cat-1',
    price: 299.99,
    compareAtPrice: 379.99,
    discountPercent: 21,
    rating: 4.9,
    reviewCount: 342,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'The Aura Studio Pro combines custom 45mm titanium diaphragms with ultra-deep 48dB active noise cancellation. Featuring loss-less LDAC bluetooth 5.4, spatial audio with real-time head tracking, and ultra-plush memory foam ear cups for all-day listening comfort.',
    features: [
      '48dB Hybrid Active Noise Cancellation (Adaptive ANC 3.0)',
      'Custom 45mm Titanium Driver for crystal clear trebles & deep sub-bass',
      'Lossless Hi-Res Audio certification over LDAC and USB-C digital audio',
      'Up to 65 Hours of continuous playback (45h with ANC enabled)',
      '5-minute Ultra-Fast Charge delivers 6 hours of playtime',
      'Multipoint Bluetooth 5.4 connection for seamless laptop & phone switching',
    ],
    specifications: [
      { key: 'Driver Size', value: '45mm Custom Titanium Diaphragm' },
      { key: 'Frequency Response', value: '10 Hz - 40,000 Hz' },
      { key: 'Active Noise Reduction', value: 'Up to -48dB Adaptive Hybrid ANC' },
      { key: 'Bluetooth Version', value: 'Bluetooth 5.4 Multipoint' },
      { key: 'Battery Life', value: '65 Hours (ANC off) / 45 Hours (ANC on)' },
      { key: 'Weight', value: '254 grams' },
      { key: 'Warranty', value: '2 Years Official AuraCare Warranty' },
    ],
    stock: 24,
    isFeatured: true,
    isBestSeller: true,
    isDealOfDay: true,
    dealEndTime: new Date(Date.now() + 86400000 * 2.5).toISOString(),
    variants: [
      { id: 'v1-black', name: 'Midnight Black', sku: 'AURA-ANC-BLK', price: 299.99, compareAtPrice: 379.99, stock: 14, colorHex: '#1e293b' },
      { id: 'v1-silver', name: 'Lunar Silver', sku: 'AURA-ANC-SLV', price: 299.99, compareAtPrice: 379.99, stock: 6, colorHex: '#e2e8f0' },
      { id: 'v1-rose', name: 'Rose Quartz', sku: 'AURA-ANC-ROS', price: 309.99, compareAtPrice: 389.99, stock: 4, colorHex: '#f43f5e' },
    ],
    reviews: [
      {
        id: 'rev-1',
        author: 'Marcus Vance',
        rating: 5,
        date: '2026-07-28',
        title: 'Outperforms my Sony XM5s in both ANC and build quality!',
        comment: 'The noise cancellation during transatlantic flights was miraculous. Crisp highs and punchy bass without overpowering the mids. The rose pink detail trim looks stunning in person.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-2',
        author: 'Elena Rostova',
        rating: 5,
        date: '2026-08-02',
        title: 'Battery lasts for entire work week on single charge.',
        comment: 'Used it for 8 hours a day with multipoint connected to my Mac and iPhone. Zero dropouts and plush headband eliminates top-head fatigue completely.',
        verifiedPurchase: true,
      },
    ],
    tags: ['Noise Cancelling', 'Wireless', 'Audiophile', 'Spatial Audio'],
  },
  {
    id: 'prod-2',
    slug: 'aura-pulse-ultra-titanium-smartwatch',
    name: 'Aura Pulse Ultra Titanium Smartwatch',
    subtitle: '1.95" Dual-Layer AMOLED, Multi-Band GPS & ECG Tracking',
    brand: 'Vyzobd Studio',
    brandId: 'b-1',
    category: 'Smart Wearables',
    categoryId: 'cat-2',
    price: 349.00,
    compareAtPrice: 429.00,
    discountPercent: 18,
    rating: 4.8,
    reviewCount: 215,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Forged from aerospace-grade Grade 5 Titanium with sapphire crystal glass, the Aura Pulse Ultra is engineered for outdoor endurance and health tracking. Features dual-frequency L1+L5 GPS, medical-grade ECG sensor, VO2 Max metrics, and 100m water resistance.',
    features: [
      'Grade 5 Titanium bezel & scratch-proof Sapphire Crystal display',
      '1.95-inch Ultra-Bright LTPO AMOLED display (2000 nits peak brightness)',
      'Dual-Band Multi-Constellation GPS for exact route accuracy',
      'Continuous SpO2, Continuous Heart Rate, Stress Level & ECG Sensor',
      '100 Meter Water Resistance (10 ATM & EN13319 Scuba certified)',
      'Up to 14 Days Battery Life in smartwatch mode / 48h Full GPS mode',
    ],
    specifications: [
      { key: 'Case Material', value: 'Aerospace Grade 5 Titanium' },
      { key: 'Display', value: '1.95" LTPO Sapphire AMOLED (480x480)' },
      { key: 'Water Rating', value: '10 ATM (100 Meters Diving Approved)' },
      { key: 'Sensors', value: 'ECG, Optical HR, SpO2, Skin Temp, Barometer, Altimeter' },
      { key: 'Battery Life', value: '14 Days Standard / 48 Hours GPS' },
      { key: 'Connectivity', value: 'Bluetooth 5.3, Wi-Fi, NFC Contactless Payment' },
    ],
    stock: 18,
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    variants: [
      { id: 'v2-titanium', name: 'Raw Titanium / Alpine Loop', sku: 'AURA-PULSE-TIT', price: 349.00, compareAtPrice: 429.00, stock: 12, colorHex: '#94a3b8' },
      { id: 'v2-obsidian', name: 'Obsidian Black / Milanese Strap', sku: 'AURA-PULSE-OBS', price: 369.00, compareAtPrice: 449.00, stock: 6, colorHex: '#0f172a' },
    ],
    reviews: [
      {
        id: 'rev-3',
        author: 'David Kim',
        rating: 5,
        date: '2026-07-20',
        title: 'GPS precision is unbeatable on mountain trail runs.',
        comment: 'Tracked a 30km trail run through heavy pine canopy without losing lock once. The AMOLED display is readable even in intense direct sunlight.',
        verifiedPurchase: true,
      },
    ],
    tags: ['Smartwatch', 'Titanium', 'Fitness', 'GPS', 'ECG'],
  },
  {
    id: 'prod-3',
    slug: 'aura-flow-75-mechanical-keyboard-rgb',
    name: 'Aura Flow75 Wireless Mechanical Keyboard',
    subtitle: 'Gasket Mounted, Hot-Swappable Tactile Switches & CNC Aluminum',
    brand: 'Keychron Pro',
    brandId: 'b-4',
    category: 'Laptops & Workstations',
    categoryId: 'cat-3',
    price: 159.99,
    compareAtPrice: 199.99,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 184,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Precision-machined from solid 6063 aluminum alloy block. The Flow75 features double-shot PBT keycaps, pre-lubed mechanical switches, IXPE switch pads, and 5-layer acoustic dampening foam for an addictive creamy acoustic marble pop sound profile.',
    features: [
      'Anodized CNC Aluminum chassis with gasket mount structure',
      'Tri-Mode Connectivity: 2.4GHz Low-Latency, Bluetooth 5.2 (3 Devices), USB-C',
      'Hot-Swappable PCB supporting 3-pin & 5-pin MX mechanical switches',
      'Pre-lubed Factory Custom Tactile Switches (45g actuation force)',
      'Per-Key RGB Lighting with custom web configurator software',
      '4000mAh Lithium battery delivering up to 300 hours with RGB off',
    ],
    specifications: [
      { key: 'Layout', value: '75% Compact (82 Keys + Rotary Knob)' },
      { key: 'Case Material', value: 'Full CNC Anodized Aluminum' },
      { key: 'Mounting Style', value: 'Flexible Silicone Gasket Mount' },
      { key: 'Switch Type', value: 'Pre-lubed Tactile Cream Switches' },
      { key: 'Keycap Profile', value: 'Cherry Profile Double-Shot PBT' },
      { key: 'Battery Capacity', value: '4000 mAh Rechargeable' },
    ],
    stock: 15,
    isFeatured: true,
    isDealOfDay: true,
    dealEndTime: new Date(Date.now() + 86400000 * 1.8).toISOString(),
    tags: ['Mechanical Keyboard', 'Wireless', 'Hot-Swappable', 'Custom PC'],
  },
  {
    id: 'prod-4',
    slug: 'aura-boost-100w-gan-magsafe-desktop-station',
    name: 'Aura Boost 100W GaN IV MagSafe Desktop Charging Station',
    subtitle: '4-in-1 Qi2 15W Magnetic Charger with 100W USB-C PD 3.1',
    brand: 'Anker Power',
    brandId: 'b-3',
    category: 'Power & Charging',
    categoryId: 'cat-4',
    price: 89.99,
    compareAtPrice: 119.99,
    discountPercent: 25,
    rating: 4.7,
    reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622445268465-84385d81b857?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Clean up your desk workspace. The Aura Boost combines an official Qi2 15W magnetic tilt charger for smartphones, a fast Apple Watch charger, an AirPods pad, and a high-power 100W USB-C PD port capable of charging a 16-inch MacBook Pro at maximum speed.',
    features: [
      '100W Total Output with Gallium Nitride (GaN IV) thermal protection',
      'Official Qi2 Certified 15W Wireless Magnetic Fast Charger',
      'Simultaneous charging for Smartphone, Smartwatch, Earbuds & Laptop',
      'Dynamic power distribution automatically adjusts watts to each connected device',
      'Soft LED ambient nightstand indicator with touch dimming sensor',
    ],
    specifications: [
      { key: 'Total Power Output', value: '100W Max' },
      { key: 'Qi2 Magnetic Output', value: '15W Fast Charge' },
      { key: 'USB-C Output 1', value: 'Up to 100W PD 3.1 (PPS Supported)' },
      { key: 'USB-A Output', value: '18W Quick Charge 3.0' },
      { key: 'Safety Suite', value: 'ActiveShield 3.0 Temperature Monitoring' },
    ],
    stock: 35,
    isFeatured: false,
    isBestSeller: true,
    tags: ['GaN Charger', 'MagSafe', 'Fast Charging', 'Desk Setup'],
  },
  {
    id: 'prod-5',
    slug: 'aura-clarity-4k-pro-webcam-ringlight',
    name: 'Aura Clarity 4K HDR Studio Webcam',
    subtitle: 'Sony STARVIS 2 Sensor, AI Auto-Framing & Dual Studio Mics',
    brand: 'Vyzobd Studio',
    brandId: 'b-1',
    category: 'Gaming & Studio Gear',
    categoryId: 'cat-5',
    price: 149.99,
    compareAtPrice: 189.99,
    discountPercent: 21,
    rating: 4.8,
    reviewCount: 98,
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Stream like a pro with 4K 60FPS uncompressed video powered by a large 1/1.8" Sony STARVIS 2 CMOS sensor. Integrated AI eye tracking keeps you perfectly framed during meetings or gaming streams, while ambient lighting automatically adjusts to backlight.',
    features: [
      '4K Ultra HD Resolution at 60 FPS / 1080p at 120 FPS high speed',
      '1/1.8" Sony STARVIS 2 Sensor for exceptional low-light performance',
      'AI Subject Tracking & Auto-Focus with digital pan/tilt zoom',
      'Dual Omni-Directional Mics with Noise Reduction DSP',
      'Built-in physical magnetic privacy shutter',
    ],
    specifications: [
      { key: 'Resolution', value: '4K @ 60fps / 1080p @ 120fps' },
      { key: 'Field of View', value: 'Adjustable 65° / 78° / 90°' },
      { key: 'Sensor', value: '1/1.8" Sony STARVIS 2 CMOS' },
      { key: 'Focus Type', value: 'AI Phase Detection Auto Focus' },
      { key: 'Cable', value: 'Detachable 2m Braided USB-C to USB-C' },
    ],
    stock: 22,
    isNew: true,
    tags: ['4K Webcam', 'Streaming', 'Work From Home', 'Studio'],
  },
  {
    id: 'prod-6',
    slug: 'aura-buds-live-anc-spatial-earbuds',
    name: 'Aura Buds Air Pro ANC Earbuds',
    subtitle: 'Transparent Hi-Res Wireless, 42dB Adaptive ANC & Wireless Case',
    brand: 'Soundcore Acoustics',
    brandId: 'b-2',
    category: 'Audio & Headphones',
    categoryId: 'cat-1',
    price: 129.99,
    compareAtPrice: 169.99,
    discountPercent: 24,
    rating: 4.7,
    reviewCount: 289,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Compact featherweight earbuds with huge sound. Dual coax drivers combine liquid crystal polymer bass with a balanced armature tweeter for acoustic detail. Features 6 noise-cancelling mics with AI beamforming for crystal clear voice calls in wind.',
    features: [
      '42dB Adaptive ANC with 3 Transparency Modes',
      'LDAC Lossless Codec + Custom Equalizer with 22 EQ Presets',
      'Up to 36 Hours total battery with Qi Wireless Charging case',
      'IP55 Water and Sweat Resistance for intense workouts',
      'In-ear detection & squeeze gesture control sensors',
    ],
    specifications: [
      { key: 'Driver Architecture', value: 'Dual Coaxial Driver (11mm LCP + Knowles BA)' },
      { key: 'Microphones', value: '6 Mics with AI ENC Beamforming' },
      { key: 'Water Rating', value: 'IP55 Dust & Splash Proof' },
      { key: 'Playtime', value: '9 Hours (Earbuds) + 27 Hours (Case)' },
      { key: 'Charging', value: 'Qi Wireless & USB-C Fast Charge' },
    ],
    stock: 40,
    isBestSeller: true,
    tags: ['Earbuds', 'ANC', 'Wireless Charging', 'Sports'],
  },
  {
    id: 'prod-7',
    slug: 'aura-hub-12in1-thunderbolt4-dock',
    name: 'Aura Thunderbolt 4 Studio Hub 12-in-1',
    subtitle: 'Dual 4K 120Hz Output, 2.5G Ethernet, 85W Host Power',
    brand: 'Vyzobd Studio',
    brandId: 'b-1',
    category: 'Laptops & Workstations',
    categoryId: 'cat-3',
    price: 199.99,
    compareAtPrice: 249.99,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 76,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Unlock maximum workstation productivity. Transform a single cable connection on your laptop into dual 4K 120Hz display outputs, 2.5Gbps high speed Ethernet, UHS-II SD card readers, and 40Gbps Thunderbolt 4 data transfer speeds.',
    features: [
      'Full 40Gbps Thunderbolt 4 / USB4 bandwidth',
      'Supports Dual 4K @ 120Hz or Single 8K @ 60Hz Displays',
      '85W Pass-Through Power Delivery to power laptops',
      '2.5 Gigabit High Speed Ethernet RJ45 port',
      'UHS-II SD and microSD Card Slot (Up to 312 MB/s transfer)',
    ],
    specifications: [
      { key: 'Upstream Interface', value: 'Thunderbolt 4 / USB4 (40Gbps)' },
      { key: 'Ports', value: '2x TB4, 2x HDMI 2.1, 3x USB-A 10Gbps, 2.5G LAN, SD/microSD, 3.5mm Audio' },
      { key: 'Host Charging', value: '85W PD Charging' },
      { key: 'Body', value: 'Anodized Heat-Dissipating Aluminum Case' },
    ],
    stock: 12,
    tags: ['Thunderbolt', 'Docking Station', 'Dual Monitor', 'MacBook'],
  },
  {
    id: 'prod-8',
    slug: 'aura-magbank-10k-magsafe-powerbank',
    name: 'Aura MagBank 10,000mAh Magnetic Power Bank',
    subtitle: 'Pass-Through Qi2 Wireless, Foldable Kickstand & OLED Battery Display',
    brand: 'Anker Power',
    brandId: 'b-3',
    category: 'Power & Charging',
    categoryId: 'cat-4',
    price: 59.99,
    compareAtPrice: 79.99,
    discountPercent: 25,
    rating: 4.9,
    reviewCount: 310,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Ultra-strong 15N magnetic latch keeps this power bank firmly snap-attached to the back of your phone. Built-in zinc alloy kickstand allows comfortable hands-free video viewing while charging at 15W wireless speed.',
    features: [
      '10,000 mAh Capacity yields 2.2 full phone recharges',
      'Qi2 Certified 15W Magnetic Wireless Fast Charge',
      'Bi-directional 30W USB-C PD fast port recharges power bank in 1.2h',
      'Real-time OLED display screen showing exact remaining percentage & time',
      'Integrated foldable zinc kickstand for portrait & landscape orientation',
    ],
    specifications: [
      { key: 'Battery Capacity', value: '10,000 mAh / 38.5Wh' },
      { key: 'Wireless Output', value: '15W / 10W / 7.5W Qi2' },
      { key: 'USB-C Output/Input', value: '30W Max PD' },
      { key: 'Dimensions', value: '105 x 68 x 18 mm' },
      { key: 'Weight', value: '208 grams' },
    ],
    stock: 50,
    isBestSeller: true,
    tags: ['Power Bank', 'MagSafe', 'Travel Essential'],
  },
];

export const MOCK_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'art-1',
    slug: 'active-noise-cancellation-30-explained',
    title: 'How Adaptive ANC 3.0 Transformed Wireless Audio in 2026',
    excerpt: 'Explore the AI acoustic physics behind modern -48dB ambient isolation and spatial audio head tracking.',
    content: `Active Noise Cancellation (ANC) has undergone a dramatic revolution. Early noise cancelling relied on simple inverted phase waves to cancel low-frequency airplane engine rumbles. Today, Adaptive ANC 3.0 combines dual internal microphone feedback loops with high-speed neural processing chips that recalculate room acoustics over 40,000 times per second.

In this deep dive, we test how Aura Studio Pro ANC handles complex soundscapes—from noisy cafes to high-speed trains—and explain why high-definition LDAC codecs are essential for preserving vocal depth.`,
    coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    author: 'Dr. Sarah Jenkins',
    date: 'August 4, 2026',
    readTime: '5 min read',
    category: 'Acoustic Engineering',
    tags: ['Audio', 'Headphones', 'Tech Explained'],
    relatedArticleSlugs: ['gan-charging-revolution-explained']
  },
  {
    id: 'art-2',
    slug: 'desk-setup-guide-productivity-2026',
    title: 'Designing the Ultimate Clean Minimalist Workstation',
    excerpt: 'A step-by-step breakdown of dual-monitor ergonomics, single-cable Thunderbolt 4 docks, and ambient lighting.',
    content: `Clutter-free desk setups are not just aesthetically pleasing—they directly boost cognitive focus and reduce fatigue during long work days.

Here are the four pillars of a modern pro workstation:
1. **Single-Cable Integration**: Utilizing a Thunderbolt 4 hub like the Aura Studio Hub delivers 85W of laptop power, dual 4K monitor signals, and 2.5G internet through a single braided wire.
2. **Tactile Custom Keyboards**: Gasket-mounted mechanical keyboards reduce finger impact stress while providing satisfying acoustic pop.
3. **Ergonomic Lighting**: High-CRI LED bar monitors illuminate your desktop without screen glare.`,
    coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    author: 'Alex Vance',
    date: 'July 28, 2026',
    readTime: '7 min read',
    category: 'Workspace Inspiration',
    tags: ['Desk Setup', 'Productivity', 'Workstation'],
    relatedArticleSlugs: ['active-noise-cancellation-30-explained']
  },
  {
    id: 'art-3',
    slug: 'gan-charging-revolution-explained',
    title: 'Why Gallium Nitride (GaN) Replaced Silicon Chargers',
    excerpt: 'Learn how GaN IV semiconductors allow 100W desktop chargers to shrink to the size of a deck of cards.',
    content: `For decades, power bricks were bulky, heavy, and produced significant heat energy loss. Gallium Nitride (GaN) replaced traditional silicon, offering 1,000x faster electron transport and 30% higher power efficiency.

The result? Chargers like the Aura Boost 100W can safely power a laptop, phone, and watch simultaneously without thermal throttling.`,
    coverImage: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
    author: 'Michael Chen',
    date: 'July 15, 2026',
    readTime: '4 min read',
    category: 'Power Innovations',
    tags: ['GaN', 'Charging', 'Hardware'],
    relatedArticleSlugs: ['desk-setup-guide-productivity-2026']
  },
];

export const MOCK_CMS_PAGES: any[] = [
  {
    id: 'cms-1',
    slug: 'about-us',
    title: 'Precision Engineering. Minimalist Soul.',
    content: `Founded in 2024, Vyzobd was born from a simple frustration: why does high-performance hardware have to be so cluttered?

We believe that the tools you use every day should be as beautiful as they are functional. Our design philosophy, "Precision Engineering, Minimalist Soul," guides every product we create—from the internal acoustic chambers of our headphones to the aerospace-grade titanium in our watches.

Based in San Francisco, our team of engineers and designers obsess over the details that others ignore. We don't just build electronics; we build the future of your workspace.`,
    lastUpdated: '2026-08-01',
    metaTitle: 'About Vyzobd | The Future of Minimalist Hardware',
    metaDescription: 'Learn about the Vyzobd story and our commitment to precision engineering and minimalist design.'
  },
  {
    id: 'cms-2',
    slug: 'privacy-policy',
    title: 'Your Privacy Matters',
    content: `At Vyzobd, we value your trust more than your data. This Privacy Policy outlines how we collect, use, and protect your information.

1. **Data Minimization**: We only collect the information necessary to fulfill your orders and provide support.
2. **No Third-Party Selling**: We never sell your personal information to advertisers or data brokers.
3. **Encryption**: All transaction data is encrypted using industry-standard AES-256 protocols.
4. **Cookie Transparency**: We use cookies only for essential site functions and basic analytics to improve your experience.`,
    lastUpdated: '2026-07-15',
    metaTitle: 'Privacy Policy | Vyzobd'
  },
  {
    id: 'cms-3',
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    content: `By using the Vyzobd storefront, you agree to the following terms:

1. **Ordering**: Orders are subject to availability and confirmation of the order price.
2. **Shipping**: Delivery times are estimates. We are not responsible for delays caused by customs or carrier issues.
3. **Warranty**: Most hardware includes a 2-year AuraCare warranty against manufacturing defects.
4. **Intellectual Property**: All site content, designs, and logos are property of Vyzobd Corp.`,
    lastUpdated: '2026-07-15',
    metaTitle: 'Terms of Service | Vyzobd'
  },
  {
    id: 'cms-5',
    slug: 'shipping-policy',
    title: 'Shipping & Delivery Policy',
    content: `We strive to get your gear to you as fast as possible.

**Processing Times**: All orders placed before 2:00 PM PST are processed and dispatched on the same business day.

**Shipping Methods**:
- **Standard Express**: 2-3 Business Days. Free on orders over $99.
- **Priority Overnight**: 1 Business Day. $18.00 flat rate.

**Tracking**: Once your order ships, you will receive a tracking number via email and your account dashboard.`,
    lastUpdated: '2026-08-01',
  },
  {
    id: 'cms-6',
    slug: 'return-policy',
    title: 'Returns & Exchanges',
    content: `Not satisfied with your purchase? We offer a 30-day money-back guarantee.

**How to Return**:
1. Go to your Orders page in your account.
2. Select the order you wish to return.
3. Click "Request Return" and follow the instructions.

**Refunds**: Once we receive and inspect your item, we will process your refund within 3-5 business days. The refund will be credited to your original payment method.`,
    lastUpdated: '2026-08-01',
  },
  {
    id: 'cms-4',
    slug: 'contact-us',
    title: 'Get in Touch',
    content: `We're here to help you build your perfect setup. Whether you have a question about a product or need support with an existing order, our team is ready.`,
    lastUpdated: '2026-08-10',
  }
];

export const MOCK_FAQ = [
  {
    id: 'faq-1',
    question: 'How long is the AuraCare warranty?',
    answer: 'Every hardware purchase includes 2 years of AuraCare Warranty, covering manufacturing defects and battery health. You can extend this to 4 years during checkout.',
    category: 'Warranty & Support'
  },
  {
    id: 'faq-2',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to over 50 countries worldwide. International shipping usually takes 5-7 business days depending on customs clearance.',
    category: 'Shipping'
  },
  {
    id: 'faq-3',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day, no-questions-asked return policy. Items must be in their original packaging and condition.',
    category: 'Returns'
  },
  {
    id: 'faq-4',
    question: 'Are Aura Pulse watches compatible with Android?',
    answer: 'Yes, Aura Pulse watches are fully compatible with both iOS 15+ and Android 10+ via the AuraSync App.',
    category: 'Compatibility'
  }
];

export const MOCK_COUPONS = [
  { code: 'TECH20', discountPercent: 20, description: '20% OFF on all orders over $100' },
  { code: 'WELCOME10', discountAmount: 10, minSubtotal: 50, description: '$10 OFF your first order' },
  { code: 'AURA35', discountPercent: 35, description: '35% OFF Flagship Audio Gear' },
];

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'hero-1',
    type: 'hero',
    badge: 'NEW FLAGSHIP RELEASE',
    title: 'Aura Studio Pro ANC Headphones',
    subtitle: 'Spatial Audio with Real-Time Head Tracking & 65-Hour Battery Life',
    price: '$299.99',
    comparePrice: '$379.99',
    discount: 'SAVE 21%',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    productSlug: 'aura-studio-pro-wireless-anc-headphones',
    bgColor: 'from-slate-950 via-slate-900 to-rose-950',
  },
  {
    id: 'hero-2',
    type: 'hero',
    badge: 'AEROSPACE GRADE TITANIUM',
    title: 'Aura Pulse Ultra Smartwatch',
    subtitle: '1.95" LTPO Sapphire AMOLED Display, Multi-Band GPS & Medical ECG',
    price: '$349.00',
    comparePrice: '$429.00',
    discount: 'LIMITED EDITION',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    productSlug: 'aura-pulse-ultra-titanium-smartwatch',
    bgColor: 'from-slate-950 via-rose-950 to-slate-900',
  },
  {
    id: 'hero-3',
    type: 'hero',
    badge: 'GAN IV FAST CHARGING',
    title: 'Aura Boost 100W Charging Hub',
    subtitle: '4-in-1 Official Qi2 15W Magnetic Charger with 100W USB-C PD Power',
    price: '$89.99',
    comparePrice: '$119.99',
    discount: 'BEST DESK GEAR',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&auto=format&fit=crop&q=80',
    productSlug: 'aura-boost-100w-gan-magsafe-desktop-station',
    bgColor: 'from-slate-950 via-slate-900 to-primary-hover',
  },
  {
    id: 'promo-1',
    type: 'promo',
    badge: 'NEW ARRIVAL',
    title: '4K Ultra Webcams',
    subtitle: 'Dual AI Noise-Canceling Mics & Sony STARVIS Sensor',
    price: 'From $149',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    buttonText: 'Shop Webcams',
    productSlug: 'aura-view-4k-pro-webcam',
    categorySlug: 'cameras-photography',
  },
  {
    id: 'promo-2',
    type: 'promo',
    badge: 'SPECIAL OFFER',
    title: 'Gasket Keyboards',
    subtitle: 'Hot-Swappable RGB Mechanical Switch Station',
    price: 'Save 25%',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    buttonText: 'Explore Keyboards',
    productSlug: 'aura-key-pro-75-gasket-mechanical-keyboard',
    categorySlug: 'keyboards-mice',
  },
  {
    id: 'offer-1',
    type: 'offer',
    badge: 'LIMITED TIME DEAL',
    title: 'Upgrade Your Desk Ergonomics with Vyzobd Gear',
    subtitle: 'Get up to 30% off workstations, monitors, and magnetic wireless chargers. Free shipping on all orders over $99.',
    buttonText: 'Claim Your Desk Upgrade Now',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=80',
    categorySlug: 'computer-monitors',
  },
];

