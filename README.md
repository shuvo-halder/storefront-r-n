# Vyzobd Storefront

A high-performance, production-grade e-commerce storefront for **Vyzobd**, built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 🌟 Overview & Key Highlights

- **Modern Architecture**: Next.js 16 App Router with React 19 Server & Client Component composition.
- **RESTful API Client**: Resilient Axios client with automated token refreshing, response normalization, in-flight request deduplication, and in-memory caching.
- **Dynamic CMS & Public Settings**: Real-time integration with backend settings (`branding`, `seo`, `shipping`, `tax`, `marketing`, `analytics`).
- **Comprehensive E-Commerce Suite**:
  - Full-text product catalog search with autocomplete and filter sidebars (categories, brands, price ranges, ratings).
  - Product detail views with variant pickers, image gallery zoom, stock indicators, and real-time review calculations.
  - Cart drawer & dedicated cart management with coupon application, shipping threshold meter, and tax calculations.
  - Multi-step checkout supporting Cash on Delivery (COD) and SSLCommerz payment gateways.
  - Customer account management (Order history, tracking, address book, wishlist, profile).
  - Dynamic CMS content (Blog articles, categories, brands directory, FAQ, and legal policies).
- **SEO & Social Optimization**: Dynamic SSR OpenGraph/Twitter card generation, JSON-LD structured data (Product, Organization, BreadcrumbList), sitemap, and robots.txt.
- **Analytics & Conversion Tracking**: Integrated Google Analytics 4 (GA4) with standard Enhanced Ecommerce events (`view_item`, `view_item_list`, `add_to_cart`, `begin_checkout`, `purchase`).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16+ (App Router) |
| **UI Library** | React 19 (Server & Client Components) |
| **Language** | TypeScript 5.8+ (Strict Mode) |
| **Styling** | Tailwind CSS v4 + PostCSS |
| **Icons** | Lucide React |
| **Animations** | Motion (Framer Motion) |
| **Forms & Validation** | React Hook Form + Zod |
| **HTTP Client** | Axios with custom unwrappers & interceptors |
| **State Management** | React Context (Auth, Cart, Wishlist, Settings, QuickView, Toast) |
| **HTML Sanitization** | DOMPurify / isomorphic-dompurify + html-react-parser |

---

## 📁 Project Structure

```text
├── app/                          # Next.js App Router root
│   ├── account/                  # Customer account dashboard & orders
│   ├── blog/                     # CMS blog articles & category views
│   ├── brands/                   # Brand catalog & brand product filters
│   ├── cart/                     # Full-page shopping cart
│   ├── categories/               # Category catalog & subcategory routes
│   ├── checkout/                 # Multi-tier checkout & payment handlers
│   ├── faq/                      # Frequently asked questions
│   ├── login/ & register/        # Authentication routes
│   ├── order-confirmation/       # Post-order tracking & status
│   ├── pages/                    # Dynamic CMS custom pages (policies, about)
│   ├── products/                 # Dynamic product details ([slug])
│   ├── search/                   # Full-text catalog search & filters
│   ├── shop/                     # Main shop catalog
│   ├── wishlist/                 # Saved items & customer wishlist
│   ├── layout.tsx                # Root layout with dynamic metadata & providers
│   ├── page.tsx                  # Home page layout
│   ├── robots.ts                 # Dynamic robots.txt generator
│   └── sitemap.ts                # Dynamic XML sitemap generator
│
├── src/                          # Application source code
│   ├── components/               # Reusable UI component modules
│   │   ├── account/              # Order history, profile, addresses
│   │   ├── cart/                 # Cart page, drawer, order summaries
│   │   ├── checkout/             # Payment methods, address form, confirmation
│   │   ├── common/               # Header, Footer, Modals, Toasts, Pagination
│   │   ├── home/                 # HeroSection, FeaturedCategories, PromoBanners
│   │   ├── product/              # ProductCard, Gallery, VariantPicker, Reviews
│   │   ├── search/               # SearchBar, FilterSidebar, SearchResults
│   │   ├── shop/                 # Product grids, sorting, brand filters
│   │   └── ui/                   # Badges, Buttons, Inputs, Skeletons, Dropdowns
│   ├── context/                  # Global Context Providers (Cart, Auth, Wishlist)
│   ├── hooks/                    # Custom React hooks (useCart, useAuth, useDebounce)
│   ├── lib/                      # API client, SEO utilities, sanitization
│   ├── providers/                # Client-side root provider composition
│   ├── services/                 # API service layer (Products, Auth, Orders, Settings)
│   ├── types/                    # TypeScript data definitions & API contracts
│   └── utils/                    # Formatting, currency, and analytics helpers
│
├── docs/                         # Architecture & developer documentation
│   ├── DEVELOPER_GUIDE.md        # Comprehensive developer workflow guide
│   └── ARCHITECTURE.md           # System data flow & architecture breakdown
│
└── public/                       # Static public assets (logos, payment banners, icons)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm`, `yarn`, or `bun`

### 1. Installation

```bash
git clone <repository-url>
cd vyzobd-storefront
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory (refer to `.env.example`):

```env
# Vyzobd API Configuration
NEXT_PUBLIC_API_URL=https://admin.vyzobd.com/api/storefront/v1
NEXT_PUBLIC_SITE_URL=https://vyzobd.com

# Analytics & Tracking (Optional in development)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-LF9DTK9SPL
NEXT_PUBLIC_GTM_ID=
```

### 3. Running the Development Server

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 📦 Scripts & Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port 3000. |
| `npm run build` | Builds the production-optimized application in `.next/`. |
| `npm run start` | Runs the compiled production server. |
| `npm run lint` | Performs strict TypeScript type-checking (`tsc --noEmit`). |
| `npm run clean` | Cleans up the `.next` and `dist` build cache artifacts. |

---

## 🔒 Security & Architecture Standards

1. **Client-Side Secret Protection**: Sensitive API keys and tokens remain strictly server-side or are negotiated via standard Bearer tokens stored in browser cookies/session storage.
2. **Safe HTML Injection**: User-generated and CMS rich text is sanitized using `isomorphic-dompurify` before DOM rendering.
3. **Optimized Asset Delivery**: All images pass through `next/image` with Cloudinary CDN optimization, responsive srcSets, and strict `referrerPolicy="no-referrer"`.
4. **Layout Shift (CLS) Prevention**: Pre-measured aspect-ratio skeletons and fixed dimension constraints prevent layout shifting during SSR hydration.

---

## 📚 Documentation

- [Developer Guide](./docs/DEVELOPER_GUIDE.md) — Coding conventions, state management patterns, and service integration guide.
- [Architecture Overview](./docs/ARCHITECTURE.md) — Data flow, caching, and server/client component topology.

---

## 📄 License

Private & Proprietary. All rights reserved by **Vyzobd**.
