         # Groove Infra Website — Developer Documentation

A premium Next.js 14 website for an interior construction company operating across India. Built with the App Router, TypeScript, Tailwind CSS, and Framer Motion.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Setup](#project-setup)
3. [Tech Stack](#tech-stack)
4. [Directory Structure](#directory-structure)
5. [Configuration Files](#configuration-files)
6. [Data Architecture](#data-architecture)
7. [Types](#types)
8. [Utilities / Lib](#utilities--lib)
9. [App Router Pages](#app-router-pages)
10. [Layout Components](#layout-components)
11. [Home Page Components](#home-page-components)
12. [Project Components](#project-components)
13. [Contact Components](#contact-components)
14. [UI Components](#ui-components)
15. [Styling & Design System](#styling--design-system)
16. [Content & Data](#content--data)
17. [API Routes](#api-routes)
18. [State Management & Client Context](#state-management--client-context)
19. [Performance Considerations](#performance-considerations)
20. [Environment Variables](#environment-variables)

---

## Architecture Overview

### High-Level System Design

This is a **hybrid SSG + SSR + CSR** Next.js 14 application with a content-first approach:

```
┌─────────────────────────────────────────────────────────┐
│                   GROOVE INFRA WEBSITE                   │
├─────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER (React 18 Components)               │
│  ├─ Client Components (animations, interactivity)       │
│  ├─ Server Components (data fetching, rendering)        │
│  └─ Layout System (shared Header, Footer, Theme)        │
├─────────────────────────────────────────────────────────┤
│  APPLICATION LAYER (Next.js 14 App Router)              │
│  ├─ Static Pages (/about, /innovation, /contact)        │
│  ├─ Dynamic Pages (/projects/[slug] with SSG)           │
│  ├─ Interactivity Pages (/projects with client filter)  │
│  └─ API Routes (Contact form)                            │
├─────────────────────────────────────────────────────────┤
│  DATA LAYER (Filesystem-based Content)                  │
│  ├─ JSON metadata (content/projects/*/metadata.json)    │
│  ├─ Local images (public/images/projects/*)             │
│  └─ Data fetching helpers (lib/projects.ts)             │
├─────────────────────────────────────────────────────────┤
│  STYLING LAYER (Tailwind CSS + CSS Variables)           │
│  ├─ Design tokens (colors, fonts, spacing)              │
│  ├─ Dark mode support (CSS class strategy)              │
│  └─ Animations (Framer Motion + CSS keyframes)          │
└─────────────────────────────────────────────────────────┘
```

### Rendering Strategy

| Route Type | Pattern | Rationale |
|---|---|---|
| **Static pages** (`/about`, `/innovation`) | SSG @ build time | Hardcoded content, no dynamic data |
| **Project detail** (`/projects/[slug]`) | ISR w/ `generateStaticParams()` | Pre-render all project pages at build time for fast initial load |
| **Projects listing** (`/projects`) | SSR (fetch @ render) | Supports future filtering/sorting without cache busting |
| **Home** (`/`) | SSG @ build time | Calls `getAllProjects()` statically, no user interactivity |
| **Contact** (`/`) | SSR + CSR hybrid | Contact form is client-side, email sent via API |

### Data Flow

```
User Browser
    ↓
Next.js Router (App Router)
    ↓
Route Handler (page.tsx or route.ts)
    ├─ Server Component Path
    │  ├─ `lib/projects.ts` fetches data (filesystem)
    │  ├─ Renders RSC (React Server Component)
    │  └─ Serializes to HTML
    │
    └─ Client Component Path
       ├─ Hydrates interactive state
       ├─ Framer Motion handles animations
       └─ Event handlers trigger API calls
    ↓
  Browser renders HTML + JS
```

### Authentication & Security

- **Admin / internal tools** — Not included in this repository or deployment. Operations such as project authoring or authenticated dashboards are intended to run on a separate app (for example `https://admin.grooveinfra.in`) with its own API surface, secrets, and infrastructure. This public site only ships static and SSR marketing pages plus the contact endpoint below.

- **Contact Form** — Server-side email sending via Resend
  - Validates required fields (name, email, message)
  - Sends to `CONTACT_EMAIL` with reply-to set to sender

### Key Architectural Decisions

1. **Filesystem-based content** — Project data stored as JSON + local images, avoid database complexity
2. **Server Components default** — Minimize JS bundle, fetch only on server
3. **Selective hydration** — Only interactive sections use `'use client'` (carousel, filters, theme toggle)
4. **Type safety throughout** — Strict TypeScript, inference on data shapes
5. **Dark mode as first-class citizen** — CSS variables + class strategy, localStorage persistence
6. **Framer Motion for animations** — High-performance animations, GPU-accelerated transforms
7. **Tailwind for styling** — Utility-first, minimal custom CSS, design token system

---

## Project Setup

```bash
npm install
npm run dev       # dev server on localhost:3000
npm run build     # production build
npm run start     # serve production build
npm run lint      # ESLint check
```

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | lucide-react |
| Email | Resend |
| CSS utilities | clsx + tailwind-merge |

---

## Directory Structure

```
/
├── app/                        # Next.js App Router pages & API
│   ├── layout.tsx              # Root layout (header, footer, theme)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles & CSS variables
│   ├── not-found.tsx           # 404 page
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── innovation/page.tsx
│   ├── projects/
│   │   ├── page.tsx            # Portfolio listing
│   │   └── [slug]/page.tsx     # Individual project detail
│   └── api/
│       └── contact/route.ts    # Contact form POST handler
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeProvider.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── Stats.tsx
│   │   ├── Services.tsx
│   │   ├── PhotoCarousel.tsx
│   │   ├── ClientLogos.tsx
│   │   ├── Testimonials.tsx
│   │   ├── BlogInsights.tsx
│   │   ├── FeaturedProjects.tsx
│   │   └── CallToAction.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── ProjectFilter.tsx
│   │   └── ProjectGallery.tsx
│   ├── contact/
│   │   ├── ContactForm.tsx
│   │   └── FaqAccordion.tsx
│   └── ui/
│       ├── AnimatedSection.tsx
│       ├── ThemeToggle.tsx
│       ├── GlassCard.tsx
│       └── ScrollProgress.tsx
├── content/
│   └── projects/
│       └── [slug]/
│           └── metadata.json   # Project data
├── lib/
│   ├── projects.ts             # Data fetching helpers
│   └── utils.ts                # Shared utility functions
├── public/
│   └── images/
│       └── projects/
│           └── [slug]/         # Local project images
│               └── logo/       # Optional project logos
└── types/
    └── project.ts              # TypeScript interfaces
```

---

## Configuration Files

### `package.json`
Defines scripts and dependencies. Key packages: `next`, `react`, `framer-motion`, `lucide-react`, `resend`, `tailwind-merge`, `clsx`.

### `tsconfig.json`
TypeScript in strict mode. Path alias `@/*` maps to the repo root, so imports like `@/lib/utils` work from anywhere.

### `next.config.js`
Permits external images from `picsum.photos`, `images.unsplash.com`, and `plus.unsplash.com` via `images.remotePatterns`.

### `tailwind.config.ts`
Extends Tailwind with:
- **Colors:** `groove.gold` (`#C9A84C`), `groove.dark` (`#080808`), silver grays.
- **Fonts:** `font-sans` → Inter, `font-display` → Playfair Display.
- **Animations:** `float`, `fade-up`, custom spring curves.
- **Dark mode:** `class` strategy — theme toggle adds/removes `dark` on `<html>`.

### `postcss.config.js`
Standard Tailwind + autoprefixer pipeline.

---

## Data Architecture

### Content Model

The application manages projects as the core data entity. Projects are structured using a **metadata + assets** pattern:

```
content/projects/
├── artisan-marketplace-delhi/
│   └── metadata.json
├── bata-india-office/
│   └── metadata.json
└── [project-slug]/
    └── metadata.json

public/images/projects/
├── artisan-marketplace-delhi/
│   ├── [image-files].jpg
│   └── logo/
│       └── [logo-file].svg
└── [project-slug]/
    ├── [image-files].jpg
    └── logo/
```

**Why this structure?**
- Metadata is version-controlled (JSON in git)
- Images are static assets (CDN-friendly if migrated to cloud storage)
- Easy to add/remove projects without code changes
- Scales to hundreds of projects with minimal overhead

### Data Fetching Strategy

All data fetching is **server-side** and happens in:

1. **Build-time** (SSG): `getAllProjects()` called in page.tsx
2. **Request-time** (SSR): `getProjectBySlug()` in dynamic route handlers  
3. **Static param generation**: `generateStaticParams()` pre-renders all project detail pages

**No runtime API calls for project data** — filesystem is the source of truth.

### Testimonials Extraction

Projects with a `testimonial` field are automatically surfaced on the homepage via `getAllTestimonials()` (inferred from metadata).

---

## Types

### [`types/project.ts`](types/project.ts)

```ts
type ProjectCategory = 'retail' | 'commercial' | 'residential' | 'civil'

interface ProjectMetadata {
  title: string
  slug: string
  category: ProjectCategory
  location: string
  client_name: string
  testimonial?: string
  description: string
  year?: number
  area?: string
  duration?: string
  featured?: boolean
  highlight?: string
  tags?: string[]
  placeholder_images?: string[]
  cover_image?: string
}

interface Project extends ProjectMetadata {
  images: string[]
  logo?: string
}

interface Testimonial {
  text: string
  client: string
  project: string
  slug: string
  category: string
}

interface BlogPost {
  title: string
  slug: string
  date: string
  category: string
  description: string
  cover_image: string
  reading_time: number
}
```

---

## Utilities / Lib

### [`lib/utils.ts`](lib/utils.ts)

| Export | Signature | Purpose |
|---|---|---|
| `cn` | `(...inputs) => string` | Merges Tailwind class strings, resolves conflicts |
| `formatCategory` | `(cat: string) => string` | `'retail'` → `'Retail'` |
| `getCoverImage` | `(project: Project) => string` | Returns cover_image → first image → placeholder |

### [`lib/projects.ts`](lib/projects.ts)

All functions are server-side (no `'use client'`). They read from the filesystem at build/request time.

| Export | Returns | Notes |
|---|---|---|
| `getAllProjects()` | `Project[]` | Reads `content/projects/*/metadata.json`, merges local images |
| `getProjectBySlug(slug)` | `Project \| null` | Finds by slug |
| `getFeaturedProjects()` | `Project[]` | `featured: true` projects, or first 6 |
| `getAllImages()` | `string[]` | Flat list of every image across all projects |
| `getAllTestimonials()` | `Testimonial[]` | Projects with a `testimonial` field |
| `getProjectCategories()` | `string[]` | `['all', 'commercial', 'retail', 'residential', 'civil']` |
| `getProjectsByCategory(cat)` | `Project[]` | Filtered by category string |

**Image resolution order:**
1. Local files in `public/images/projects/[slug]/`
2. `placeholder_images` from metadata.json
3. Generic placeholder

---

## App Router Pages

### Page Rendering Matrix

| Route | Component Type | Rendering | Data | Cache |
|---|---|---|---|---|
| `/` | Server | SSG @ build | `.getAllProjects()`, `.getAllTestimonials()` | Static (revalidate on rebuild) |
| `/about` | Server | SSG @ build | Hardcoded | Static |
| `/contact` | Hybrid | SSR | None | Dynamic (CTA stays fresh) |
| `/innovation` | Server | SSG @ build | Hardcoded | Static |
| `/projects` | Hybrid | SSR | `.getAllProjects()`, `.getProjectCategories()` | Dynamic (supports filtering UI) |
| `/projects/[slug]` | Hybrid | ISR via `generateStaticParams()` | `.getProjectBySlug()` | Pregenerated (incremental revalidation) |

---

### [`app/layout.tsx`](app/layout.tsx) — Root Layout

**Key responsibilities:**
1. **Metadata setup** — SEO title template, description, keywords
2. **Font loading** — Google Fonts (Inter + Playfair Display) with `display: 'swap'`
3. **Theme initialization** — Blocking script to read `localStorage` before hydration (prevents flash)
4. **Context providers** — Wraps children in `<ThemeProvider>`
5. **Persistent layout** — Renders `<Header>`, `<ScrollProgress>`, `{children}`, `<Footer>` to persist across routes

**CSS imports:** `./globals.css` (defines Tailwind utilities, CSS variables, dark mode behavior)

**Why the theme script?**
```html
<script dangerouslySetInnerHTML={{ __html: `...` }} />
```
This runs **before React hydrates**, so the DOM already has the correct class when JS loads. Without it, light theme would flash before theme loads from localStorage.

---

### [`app/page.tsx`](app/page.tsx) — Homepage

**Rendering:** SSG (all data fetched at build time)

**Data flow:**
```typescript
const projects = getAllProjects()        // reads content/projects/*/metadata.json
const testimonials = getAllTestimonials() // filters projects with testimonial field
```

**Major sections (in order):**
1. `<Hero />` — Full-screen carousel with auto-advance
2. `<Stats />` — 4 animated counters
3. `<Services />` — 4 service cards
4. `<PhotoCarousel />` — Infinite horizontal scroll of project images
5. `<ClientLogos />` — Marquee of brand names
6. `<Testimonials />` — Carousel of project testimonials
7. `<BlogInsights />` — 3 blog preview cards
8. `<CallToAction />` — Dark section with radial glows

**Performance note:** All components are `'use client'`, so homepage JS bundle includes Framer Motion, carousel logic, animations.

---

### [`app/about/page.tsx`](app/about/page.tsx) — About Page

**Rendering:** SSG

**Data:** All content is hardcoded (no fetching)

**Sections:**
- Hero introduction
- Image collage (2×2 grid with `aspect-ratio`)
- Story + Philosophy description
- 8-phase process timeline (numbered cards)
- Team member profiles (3 people with photos)
- Service areas (5 cities: Mumbai, Delhi, Bangalore, Hyderabad, Pune)
- CTA section

**Note:** No dynamic data; perfect candidate for static generation and caching.

---

### [`app/projects/page.tsx`](app/projects/page.tsx) — Projects Listing

**Rendering:** SSR (fetched at request time, not build time)

**Why SSR instead of SSG?** Allows future filtering/search updates without rebuilding.

**Data flow:**
```typescript
const projects = getAllProjects()           // fetches filesystem
const categories = getProjectCategories()   // returns filtered categories
// Passes both to ProjectGrid for client-side filtering
```

**UI:**
- Header section with intro text + project count
- `<ProjectGrid>` component (handles client-side filtering)

**Client interaction:** Category filter buttons update displayed projects without page reload.

---

### [`app/projects/[slug]/page.tsx`](app/projects/[slug]/page.tsx) — Project Detail

**Rendering:** ISR + SSG hybrid

**Pre-rendering:**
```typescript
export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }))
}
```
This pre-generates `/projects/[slug].html` at **build time** for every project, so detail pages load instantly.

**Metadata:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = getProjectBySlug(params.slug)
  if (!project) return {} // Will 404
  return { title: project.title, description: project.description }
}
```
- Unique `<title>` and Open Graph tags per project
- SEO-friendly

**Dynamic rendering:**
```typescript
export default function ProjectPage({ params }) {
  const project = getProjectBySlug(params.slug)
  if (!project) notFound() // Renders 404 page
  // ...render project details
}
```

**Sections:**
1. Cover image (responsive, full-width)
2. Back link (← to projects list)
3. Project metadata (location, year, area, duration via icons)
4. Description + testimonial quote
5. `<ProjectGallery>` — Image grid + lightbox
6. Right sidebar:
   - Category, tags
   - CTA button
   - Related projects (not yet implemented)

---

### [`app/contact/page.tsx`](app/contact/page.tsx) — Contact Page

**Rendering:** SSR

**Layout:**
- Left column: `<ContactForm>` (client component)
- Right column: Contact info cards (email, phone, address)
- Below both: `<FaqAccordion>` (client component)

**Contact details:**
- Email: `hello@grooveinfra.in`
- Phone: `+91 22 1234 5678` (Mumbai office)
- Address: Bandra Kurla Complex, Mumbai

**Form submission flow:**
1. User fills out form + clicks "Send"
2. `ContactForm` makes POST to `/api/contact`
3. Backend sends email via Resend
4. UI shows success/error state

---

### [`app/innovation/page.tsx`](app/innovation/page.tsx) — Innovation

**Rendering:** SSG

**Content:** Showcase of 4 upcoming products (placeholders):
1. **AI Cost Estimator** — Estimate project costs instantly
2. **Modular Interior Systems** — Pre-fabricated components library
3. **Vendor Marketplace** — B2B marketplace for materials
4. **Project Intelligence** — Analytics dashboard

**Note:** All 4 products marked "Coming Soon"; no actual functionality yet.

---

### [`app/not-found.tsx`](app/not-found.tsx) — 404 Page

**Triggered by:**
- Invalid project slug (via `notFound()` in `[slug]/page.tsx`)
- Any unmapped route

**UI:** 
- Large gold "404" text
- Message "Page not found"
- Link back to home

---

## Layout Components

### [`components/layout/Header.tsx`](components/layout/Header.tsx)

**Type:** Client component (`'use client'`)

**Responsibilities:**
1. **Sticky positioning** — Changes styling after 50px (`scrollY > 60`) scroll
2. **Active link detection** — Highlights current page via `usePathname()`
3. **Mobile overlay menu** — Hamburger icon toggles animated slide-out navigation
4. **Theme toggle** — Renders `ThemeToggle` button (top right)

**State:**
```typescript
const [scrolled, setScrolled] = useState(false)  // for sticky bar styling
const [menuOpen, setMenuOpen] = useState(false)  // for mobile menu overlay
```

**Scroll listener:**
- Attached on mount via `useEffect`
- Throttled via `{ passive: true }` flag
- Cleanup removes listener on unmount

**Navigation links:** Portfolio, About, Innovation, Contact

**Active link styling:**
- Full-width gold underline for current page
- Animated underline on hover for other links
- Color adapts: white text on hero pages (`/`), theme-aware on other pages

**CTA button:** "Enquire Now" button links to `/contact`

**Responsive:**
- Desktop: Full nav bar with links + CTA
- Mobile: Hamburger menu with overlay navigation (Framer Motion `AnimatePresence`)

---

### [`components/layout/Footer.tsx`](components/layout/Footer.tsx)

**Type:** Server component

**Responsibilities:**
1. **Brand section** — Logo, tagline, contact info (email, phone, address)
2. **Link groups** — "Services" (4 project categories), "Company" (4 main pages)
3. **Copyright year** — Dynamic `new Date().getFullYear()`

**Layout:**
- **Desktop:** 4 columns (brand | services | company | empty)
- **Mobile:** 1 column (stacked)

**Contact details:**
- Email: `hello@grooveinfra.in` (mailto link)
- Phone: `+91 22 1234 5678` (tel link)
- Address: Mumbai, Maharashtra

**Link categories:**
```
Services:
  - Retail Rollouts (/projects?category=retail)
  - Hospitality & Clubs (/projects?category=commercial)
  - Commercial Renovation (/projects?category=commercial)
  - Residential Makeovers (/projects?category=residential)

Company:
  - Portfolio (/projects)
  - About Us (/about)
  - Innovation Lab (/innovation)
  - Contact (/contact)
```

**Hover effects:**
- Links change color to gold (`text-accent-gold`)
- Smooth transition (200ms)

**Styling:**
- Bordered top (`border-t border-subtle`)
- Dark background (`bg-surface`)
- Generous padding (py-16)

---

### [`components/layout/ThemeProvider.tsx`](components/layout/ThemeProvider.tsx)

**Type:** Client context provider (`'use client'`)

**Purpose:** Global theme state management (light/dark mode)

**Context shape:**
```typescript
interface ThemeContextValue {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}
```

**Lifecycle:**
1. **Mount:** Read `localStorage.getItem('groove-theme')`
2. **Fallback:** If not found, check `window.matchMedia('(prefers-color-scheme: dark)')`
3. **Apply:** Toggle `dark` class on `<html>` element
4. **Persist:** Save preference to localStorage on toggle

**applyTheme() function:**
```typescript
function applyTheme(t: 'dark' | 'light') {
  document.documentElement.classList.toggle('dark', t === 'dark')
  // Tailwind watches 'dark' class and applies dark mode CSS
}
```

**Consumer hook:**
```typescript
export function useTheme() {
  return useContext(ThemeContext)
}
// Usage: const { theme, toggleTheme } = useTheme()
```

**CSS variable swapping:**
In `globals.css`, CSS variables are defined twice:
```css
/* Light mode (default) */
:root {
  --color-background: #ffffff;
  --color-text: #000000;
}

/* Dark mode */
:root.dark {
  --color-background: #080808;
  --color-text: #ffffff;
}
```

**Hydration safety:**
- No server-side theme reading; theme is purely client-side
- Initial theme applied via blocking `<script>` in `layout.tsx`
- Prevents flash of wrong theme

---

## Home Page Components

These are all client components (`'use client'`) with animations via Framer Motion.

### [`components/home/Hero.tsx`](components/home/Hero.tsx)

**Carousel with 4 slides (auto-advance every 5.5s)**

**Slides:**
1. Retail Rollouts: "Spaces That Drive Sales"
2. Commercial Interiors: "Where Work Becomes Culture"
3. Hospitality & Clubs: "Atmospheres People Return To"
4. Residential Makeovers: "Your Home, Reimagined"

**Background images:** Curated interior photography from Unsplash (`images.unsplash.com`). Swap URLs or move assets under `public/` when you have final brand photography.

**State:**
```typescript
const [current, setCurrent] = useState(0)  // current slide index
const [paused, setPaused] = useState(false) // pause on hover
```

**Animation:**
- `AnimatePresence` mode="wait" for image transitions
- Opacity fade + scale (1.08 → 1.04) over 1s with easing
- `priority={current === 0}` for first slide LCP optimization

**Overlays:**
- `bg-black/40` + `backdrop-blur-[2px]`
- `bg-gradient-to-b` dark gradient for text contrast

**Interactive elements:**
- Arrow buttons (Prev/Next) with `onClick` handlers
- Dot navigation (4 dots, click to jump to slide)
- Pause on mouse enter (hover stops auto-advance)
- Slide counter: "1 / 4"
- Progress bar (linear animation based on slide duration)

**CTA buttons:**
- "View Portfolio" (link to `/projects`)
- "Get in Touch" (link to `/contact`)

---

### [`components/home/Stats.tsx`](components/home/Stats.tsx)

**Animated counter section with 4 key metrics**

**Metrics:**
- 200+ Projects
- 50+ Brands
- 12+ Years
- 98% On-Time

**Animation:**
- Numbers animate from 0 to target value when section enters viewport
- Duration: 1.8s
- Triggered via `useInView()` hook

**Rendering:**
- Each stat is a card with large number, label, small description
- Hover effect on cards

---

### [`components/home/Services.tsx`](components/home/Services.tsx)

**4 service category cards**

**Cards:**
1. Retail Fit-Outs
2. Hospitality Design
3. Commercial Offices
4. Residential Spaces

**Design:**
- Numbered 01–04
- Lucide icon for each
- Category name + description
- Hover: background highlight (gold accent)

---

### [`components/home/PhotoCarousel.tsx`](components/home/PhotoCarousel.tsx)

**Infinite horizontal scrolling gallery of project images**

**Props:**
```typescript
{ projects: Project[] }
```

**Behavior:**
- 2 rows of images (opposite scroll directions)
- Row 1: scrolls left continuously (38s cycle)
- Row 2: scrolls right continuously (44s cycle)
- Uses CSS `animation` (GPU-accelerated, not JS)
- Hover: shows project name + category overlay
- Click: navigates to project detail page

**Performance:** CSS animation is ~60fps, no React overhead

---

### [`components/home/ClientLogos.tsx`](components/home/ClientLogos.tsx)

**Marquee effect with brand names**

**Behavior:**
- 2 marquee rows (opposite directions)
- ~10 brand names per row
- Gradient fade masks on left/right edges
- Hover: restores from grayscale to full color

---

### [`components/home/Testimonials.tsx`](components/home/Testimonials.tsx)

**Project testimonial carousel**

**Props:**
```typescript
{ testimonials: Testimonial[] }
```

**Features:**
- Direction-aware animations (slide direction matches prev/next button)
- Dot navigation (one dot per testimonial)
- Arrow buttons (Prev/Next)
- Auto-advance (optional, not currently implemented)

**Content per slide:**
- Quote text
- Client name
- Project name
- Click to view project detail

---

### [`components/home/BlogInsights.tsx`](components/home/BlogInsights.tsx)

**3-column blog preview grid**

**Features:**
- Cover image with overlay
- Category badge
- Publication date + reading time
- Clamped description (2–3 lines)
- Hover: reveal "Read More" link

**Note:** All blog data is hardcoded; no blog database yet.

---

### [`components/home/FeaturedProjects.tsx`](components/home/FeaturedProjects.tsx)

**Bento-style project showcase layout**

**Layout logic:**
```
[Large 1] [Small 1]
          [Small 2]
[Small 3] [Small 4]
```

**Props:**
```typescript
{ projects: Project[] }
```

**Hover effects:**
- Image zoom (1.06×)
- Arrow button appears
- Title turns gold
- Link to project detail

---

### [`components/home/CallToAction.tsx`](components/home/CallToAction.tsx)

**Dark bottom section with CTA**

**Design elements:**
- Dark gradient background
- Gold radial glow effects (positioned absolutely)
- Grid pattern overlay (subtle texture)
- Animated pulse badge ("Ready to Transform?")
- Large gradient heading
- Two CTA buttons

**Animations:**
- Scale-in effect on scroll into view
- Text fade-up
- Pulse animation on badge

---

## UI Components

### [`components/ui/AnimatedSection.tsx`](components/ui/AnimatedSection.tsx)

**Wrapper for scroll-reveal animations**

**Props:**
```typescript
{
  children: React.ReactNode
  className?: string
  delay?: number          // optional stagger delay (0 by default)
  direction?: 'up'|'down'|'left'|'right'|'none'  // default 'up'
  once?: boolean          // default true (only animate once)
}
```

**How it works:**
```typescript
const inView = useInView(ref, { once, margin: '-10% 0px' })
// Triggers when section is 10% into viewport
```

**Animation:**
```
Initial state: opacity 0, offset 40px in [direction]
              ↓ (triggered by inView)
Animated state: opacity 1, offset 0
Duration: 0.6s with custom easing
```

**Use case:** Wrap HomePage sections, content blocks, cards to animate them into view.

**Example:**
```typescript
<AnimatedSection direction="up" delay={0.2}>
  <h2>Content to animate in</h2>
</AnimatedSection>
```

---

### [`components/ui/ThemeToggle.tsx`](components/ui/ThemeToggle.tsx)

**Type:** Client component

**Renders:** Circular button with animated icon (Sun ☀️ / Moon 🌙)

**Behavior:**
- Dark mode → shows Sun icon
- Light mode → shows Moon icon
- Icon rotates 180° on toggle
- Calls `toggleTheme()` from `useTheme()`

---

### [`components/ui/GlassCard.tsx`](components/ui/GlassCard.tsx)

**Type:** Client component

**Props:**
```typescript
{
  children: React.ReactNode
  className?: string
  tilt?: boolean  // default true (3D tilt effect on mouse move)
  glow?: boolean  // default false (dark mode only)
}
```

**Features:**
- **3D tilt effect** — Card tilts toward mouse cursor
  - Uses `react-tilt` library (or custom Framer Motion)
  - Max tilt: ~15°
  
- **Glare reflection** — White gradient follows cursor
  - Only visible with `glow={true}`
  - Positioned absolutely, clipped to card bounds
  - Opacity responds to cursor angle

**Use case:** Featured project cards, testimonial cards, premium UI sections

---

### [`components/ui/ScrollProgress.tsx`](components/ui/ScrollProgress.tsx)

**Type:** Client component

**Renders:** Fixed 2px gold bar at top of page

**How it works:**
```typescript
const { scrollYProgress } = useScroll()
// scrollYProgress = 0 to 1 as user scrolls page
```

**Animation:**
- Width driven by scroll progress
- Spring animation (stiffness 200, damping 30)
- Width = `scrollYProgress * 100%`

**Styling:**
- Fixed top, full width
- `z-50` (above everything except modals)
- Gold color (`bg-groove-gold`)
- 2px height

---

### [`components/projects/ProjectCard.tsx`](components/projects/ProjectCard.tsx)

**Type:** Client component

**Props:**
```typescript
{ project: Project }
```

**Visual elements:**
- Cover image (from `project.cover_image` or first image)
- Dark gradient overlay (bottom-to-top)
- Category badge (top-left)
- Hover animation:
  - Image zoom in (1.06×)
  - Arrow button fades in
  - Shadow intensifies
- Project title (always visible)
- Location + year + description
- Optional area/duration

**Click:** Navigates to `/projects/[slug]`

---

### [`components/projects/ProjectGrid.tsx`](components/projects/ProjectGrid.tsx)

**Type:** Client component

**Props:**
```typescript
{
  projects: Project[]
  categories: string[]
}
```

**Responsibilities:**
1. Render `<ProjectFilter>` component (category buttons)
2. Manage active filter state locally
3. Render 3-column responsive grid of `<ProjectCard>`

**State:**
```typescript
const [activeFilter, setActiveFilter] = useState('all')
const filtered = activeFilter === 'all' 
  ? projects 
  : projects.filter(p => p.category === activeFilter)
```

**Responsive:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

**Layout animation:** When filter changes, grid items animate in with staggered timing

**Empty state:** If filtered result is empty, shows "No projects found" message

---

### [`components/projects/ProjectFilter.tsx`](components/projects/ProjectFilter.tsx)

**Type:** Client component

**Props:**
```typescript
{
  categories: string[]     // ['all', 'retail', 'commercial', 'residential', 'civil']
  active: string          // current active filter
  onChange: (cat: string) => void
}
```

**Renders:** Row of pill buttons, one per category

**Animations:**
- Active pill has gold background
- Gold background animates between pills using Framer Motion `layoutId`
- Smooth transition (200ms)

**Interaction:**
- Click pill to filter projects
- Calls `onChange(category)`

---

### [`components/projects/ProjectGallery.tsx`](components/projects/ProjectGallery.tsx)

**Type:** Client component with lightbox

**Props:**
```typescript
{
  images: string[]
  title: string
}
```

**Grid layout:**
- First image: 16:9 aspect ratio, spans 2 columns
- Remaining images: 1:1 aspect ratio (square)
- Responsive: 2–4 columns on different screen sizes

**Lightbox:**
- Click any image to open fullscreen lightbox
- Black background overlay (z-indexed high)
- Image counter: "1 / 12"
- Prev/Next arrow buttons
- Close button (X icon)
- Click outside to close

**Keyboard support:** (optional, check if implemented)
- `Esc` to close
- Arrow keys to navigate

---

## Contact Components

### [`components/contact/ContactForm.tsx`](components/contact/ContactForm.tsx)

**Type:** Client component

**Form fields:**
1. **Name** (text, required)
2. **Company/Brand** (text, optional)
3. **Email** (email, required)
4. **Phone** (tel, optional)
5. **Project Type** (pill selector, optional)
   - Options: Retail, Hospitality, Commercial, Residential, Civil, Other
6. **Location** (text, optional)
7. **Message** (textarea, required)

**State:**
```typescript
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
const [formData, setFormData] = useState({...})
const [projectType, setProjectType] = useState('')
```

**Submission flow:**
1. User fills form + clicks "Send"
2. Validate required fields (name, email, message)
3. POST to `/api/contact` with form data
4. Show loading spinner during request
5. On success: show checkmark, reset form, show "Message sent!" message
6. On error: show error message, allow retry

**Visual feedback:**
- All inputs turn gold border on focus
- Project type pills show selection state (gold background)
- Submit button disabled during loading
- Success/error messages display in red/green toast

---

### [`components/contact/FaqAccordion.tsx`](components/contact/FaqAccordion.tsx)

**Type:** Client component

**Structure:** 6 FAQs in accordion format

**FAQs:**
1. What types of projects do you handle?
2. What's your typical project timeline?
3. Do you work outside of India?
4. What's the minimum budget for a project?
5. Do you handle design-only or build-only services?
6. What warranty do you provide on construction?

**Behavior:**
- Only one item can be open at a time
- First item (`index={0}`) opens by default
- Click accordion header to toggle open/close
- Smooth height animation (0.28s) when opening/closing

**State:**
```typescript
const [openIndex, setOpenIndex] = useState(0)
```

**Styling:**
- Dark background
- Expandable sections with smooth scroll height animation
- Gold accent color for active item

---

## Styling & Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `groove.gold` | `#C9A84C` | Primary accent, borders, highlights |
| `groove.gold-light` | `#E8D5B7` | Lighter gold text |
| `groove.gold-dark` | `#A87D2A` | Darker gold for hover states |
| `groove.dark` | `#080808` | Deepest background |
| `groove.dark-2` | `#111111` | Card backgrounds |
| `groove.dark-3` | `#181818` | Elevated surfaces |
| `groove.gray` | `#222222` | Borders, dividers |
| `groove.silver` | `#888888` | Secondary text |

### Typography

- **Display / Headings:** Playfair Display (`font-display`) — serif, editorial feel
- **Body / UI:** Inter (`font-sans`) — clean, readable

### Utility Classes (globals.css)

| Class | Effect |
|---|---|
| `.bg-base` | Page background color |
| `.bg-surface` | Card surface color |
| `.bg-surface-2` | Elevated card |
| `.text-primary` | Main text color |
| `.text-secondary` | Subdued text |
| `.text-muted-custom` | Muted/placeholder text |
| `.text-gradient-gold` | Gold gradient text effect |
| `.glass` | Glass-morphism (dark mode) |
| `.light-glass` | Glass-morphism (light mode) |
| `.silver-logo` | Grayscale + hover restore |
| `.glow-gold` | Gold neon border glow |
| `.glow-gold-text` | Gold neon text glow |

### Dark Mode

Theme is controlled by adding/removing the `dark` class on `<html>`. CSS variables in `globals.css` swap automatically. User preference is persisted to `localStorage` under the key `groove-theme`.

---

## Content & Data

### Adding a New Project

1. Create a folder: `content/projects/your-slug/`
2. Add `metadata.json`:

```json
{
  "title": "Project Name",
  "slug": "your-slug",
  "category": "commercial",
  "location": "Mumbai",
  "client_name": "Acme Corp",
  "description": "Short description of the project.",
  "year": 2024,
  "area": "3,500 sq ft",
  "duration": "4 months",
  "featured": false,
  "tags": ["Office", "Fit-out"],
  "testimonial": "Optional client quote.",
  "cover_image": "https://optional-cover-url.jpg"
}
```

3. (Optional) Add local images to `public/images/projects/your-slug/` — any `.jpg`, `.jpeg`, `.png`, `.webp` files will be picked up automatically.
4. (Optional) Add a logo image to `public/images/projects/your-slug/logo/`.

The project will appear automatically on the portfolio page and in carousels.

### Project Image Priority

1. Local files in `public/images/projects/[slug]/`
2. `placeholder_images` array in metadata.json
3. Generic placeholder image

---

## API Routes

### `POST /api/contact`

Handled by [`app/api/contact/route.ts`](app/api/contact/route.ts).

**Request body (JSON):**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "message": "string (required)",
  "phone": "string (optional)",
  "company": "string (optional)",
  "projectType": "string (optional)",
  "location": "string (optional)"
}
```

**Response:**
- **Success (200):** `{ "ok": true }`
- **Missing fields (400):** `{ "error": "Missing required fields" }`
- **Server error (500):** `{ "error": "Internal server error" }`

**Behavior:**
- Sends HTML-formatted email via Resend API
- From: `noreply@grooveinfra.in`
- To: `process.env.CONTACT_EMAIL` (defaults to `hello@grooveinfra.in`)
- Reply-To: Sender's email address (for direct replies)
- Email includes all form fields in a branded HTML template with gold accent

**Used by:** `ContactForm.tsx` (client-side form submission)

**Admin APIs:** Any future authenticated project-management or CMS APIs belong on the separate admin deployment (for example `admin.grooveinfra.in`), not on this marketing site, so cookies and credentials are not shared across origins and this app stays a minimal static + contact surface.

---

## Pagination & Status Codes

**Standard HTTP status codes used:**
- `200` — Success (GET, POST successful)
- `400` — Bad request (missing/invalid fields)
- `401` — Unauthorized (not used by `/api/contact`; reserved for any future authenticated routes)
- `404` — Not found (invalid project slug via `notFound()`)
- `500` — Server error (Resend API failure, filesystem error)

---

## State Management & Client Context

### Theme Context (`ThemeProvider`)

The application uses **React Context** for theme management instead of external state libraries:

```typescript
interface ThemeContextValue {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}
```

**Provider location:** `components/layout/ThemeProvider.tsx` (wraps entire app in `app/layout.tsx`)

**How it works:**
1. On component mount, reads `localStorage` key `groove-theme`
2. Falls back to `window.matchMedia('(prefers-color-scheme)')` if not found
3. Applies `class="dark"` to `<html>` element
4. CSS variables in `globals.css` swap colors automatically
5. Persists preference to localStorage on toggle

**Consumer hook:** `useTheme()` returns `{ theme, toggleTheme }`

**Limitation:** SSR flash prevention relies on a blocking script in `app/layout.tsx` that runs before React hydration:
```html
<script dangerouslySetInnerHTML={{ __html: `...localStorage read...` }} />
```

### Component-Level State

**Client Components** manage local state via `useState()`:

| Component | State | Purpose |
|---|---|---|
| `ProjectGrid` | `activeFilter: string` | Track selected project category |
| `ContactForm` | `status: 'idle'\|'loading'\|'success'\|'error'`, form fields | Form submission lifecycle |
| `FaqAccordion` | `openIndex: number` | Track which accordion item is open |
| `Header` | `mobileMenuOpen: boolean` | Toggle mobile nav overlay |
| `Hero` | `currentSlide: number` | Track active carousel slide |
| `Testimonials` | `currentIndex: number`, `direction: -1\|1` | Carousel state + direction for animations |

**No cross-component state sharing** beyond theme context — components are relatively isolated.

### Side Effects & Animations

**Scroll listeners:**
- `ScrollProgress` uses Framer Motion's `useScroll()` hook to track scroll position
- `Stats` component uses `useInView()` to trigger number animations when scrolled into viewport
- `ScrollProgress, GlassCard` use `useMotionTemplate()` for dynamic CSS values

**Lifecycle hooks:**
- `ThemeProvider` uses `useEffect()` to read localStorage on mount
- `Header` uses `useEffect()` to listen for scroll events and add/remove "sticky" styling

---

## Performance Considerations

### Bundle Size Optimization

1. **Server Components by default** — Only marks interactive sections as `'use client'`
   - Reduces hydration size
   - Moves rendering to server

2. **Dynamic imports** — Not currently used, but recommended for heavy components:
   ```typescript
   const ProjectGallery = dynamic(() => import('@/components/projects/ProjectGallery'), {
     loading: () => <Skeleton />,
     ssr: false
   })
   ```

3. **Code splitting** — Next.js automatically splits by route

### Build-time Optimizations

1. **Static generation** — All project detail pages (`/projects/[slug]`) pre-rendered at build via `generateStaticParams()`
2. **Image optimization** — Uses Next.js `<Image>` component in carousels (with proper `width`, `height`, `priority` props)
3. **Font optimization** — Google Fonts (Inter, Playfair Display) loaded with `display: 'swap'` to prevent FOUT

### Runtime Performance

1. **Framer Motion** — Uses GPU-accelerated transforms (`translateX`, `translateY`, `scale`)
   - Carousel animations: `translateX` (no layout thrashing)
   - Hover effects: `scale` + opacity (no reflows)

2. **CSS variables** — Dark mode switch is instant (no re-render needed, just CSS swaps)

3. **Infinite scrolling** — PhotoCarousel uses absolute positioning + CSS `animation` (not JS, for 60fps)

4. **Debouncing** — Not currently used; could be added to scroll listeners if performance degrades

### Recommended Optimizations for Scale

When scaling to 100+ projects:
- **Image CDN** — Migrate local images to Vercel Blob Storage or Cloudinary
- **Pagination** — Add pagination to ProjectGrid instead of rendering all projects at once
- **ISR revalidation** — Add `revalidate: 3600` to project pages for incremental regeneration
- **Caching headers** — Set `Cache-Control` headers on static assets
- **Database** — Consider moving metadata from JSON files to a database if editing via CMS UI becomes necessary

---

## Development Workflow

### Adding a New Page

1. Create `app/your-route/page.tsx` (or with nested routes: `app/parent/child/page.tsx`)
2. If static, use `generateStaticParams()` for dynamic segments
3. Fetch data via `lib/projects.ts` helpers (server-side)
4. Wrap interactive sections in `'use client'` boundaries
5. Render UI with components from `components/`

**Example:**
```typescript
// app/new-page/page.tsx
import { getAllProjects } from '@/lib/projects'
import ProjectCard from '@/components/projects/ProjectCard'

export default function NewPage() {
  const projects = getAllProjects()
  return <div>{projects.map(p => <ProjectCard key={p.slug} project={p} />)}</div>
}
```

### Debugging

| Issue | Solution |
|---|---|
| Theme flashing on page load | Check `localStorage.getItem('groove-theme')` call in `<script>` tag |
| Images not showing | Verify domain in `next.config.js` `remotePatterns`, or check `public/images/` path |
| Type errors | Run `tsc --noEmit` to check TypeScript |
| Animations janky | Check Framer Motion `layout` props, avoid layout-shifting content |
| Project not appearing | Verify `content/projects/[slug]/metadata.json` exists and has valid JSON |

---

## Supabase Migration — Project Data Schema

The filesystem-based content system (`content/projects/*/metadata.json` + `public/images/`) is being replaced with Supabase. Below is the full field reference for the `projects` table, derived from the original metadata.json structure.

### `projects` Table Schema

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes | Primary key, auto-generated |
| `title` | `text` | Yes | Display name, e.g. `"Bata India Office"` |
| `slug` | `text` | Yes | URL-safe identifier, e.g. `"bata-india-office"` — must be unique |
| `category` | `text` | Yes | One of: `retail`, `commercial`, `residential`, `civil` |
| `location` | `text` | Yes | City/region string, e.g. `"Gurgaon, Haryana"` |
| `client_name` | `text` | Yes | Client's full company name |
| `description` | `text` | Yes | Project summary paragraph |
| `testimonial` | `text` | No | Optional client quote |
| `year` | `int4` | No | Completion year, e.g. `2025` |
| `area` | `text` | No | Floor area string, e.g. `"10,000 sq ft"` |
| `duration` | `text` | No | Project duration string, e.g. `"25 weeks"` |
| `featured` | `bool` | No | If `true`, surfaces on homepage featured section |
| `highlight` | `text` | No | One-liner callout, e.g. `"Live renovation, 3 phased floors"` |
| `tags` | `text[]` | No | Array of keyword tags, e.g. `["office-design", "lighting"]` |
| `cover_image` | `text` | No | URL of the hero/cover image |
| `images` | `text[]` | No | Ordered array of all project image URLs |
| `logo` | `text` | No | URL of the client/project logo image |
| `created_at` | `timestamptz` | Yes | Auto-set by Supabase |

### Example Row (JSON)

```json
{
  "title": "Bata India Office",
  "slug": "bata-india-office",
  "category": "commercial",
  "location": "Gurgaon, Haryana",
  "client_name": "Bata India LTD",
  "description": "Designed and executed a 10,000 sq ft corporate office space, focusing on efficient space planning, collaborative work environments, and ergonomic design.",
  "testimonial": "The team delivered a modern retail space that perfectly aligns with our brand identity while enhancing customer experience.",
  "year": 2025,
  "area": "10,000 sq ft",
  "duration": "25 weeks",
  "featured": true,
  "highlight": null,
  "tags": ["office-design", "workspace-planning", "interiors", "lighting", "execution"],
  "cover_image": "https://your-storage-url/bata-india-office/cover.jpg",
  "images": [
    "https://your-storage-url/bata-india-office/DSC_0023.jpg",
    "https://your-storage-url/bata-india-office/DSC_0026.jpg"
  ],
  "logo": null
}
```

### Image Storage

Images previously stored in `public/images/projects/[slug]/` should be uploaded to **Supabase Storage** (or another CDN). Recommended bucket structure:

```
projects/
└── [slug]/
    ├── cover.jpg
    ├── DSC_0023.jpg
    └── logo/
        └── logo.svg
```

The `cover_image`, `images[]`, and `logo` columns store the public URLs returned by Supabase Storage.

### Category Enum Values

```
retail       — Retail fit-outs, shops, showrooms
commercial   — Offices, corporate interiors
residential  — Homes, apartments
civil        — Civil/infrastructure projects
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes | Resend API key for sending contact form emails |
| `CONTACT_EMAIL` | No | Destination email; defaults to `hello@grooveinfra.in` |

Create a `.env.local` file at the project root:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_EMAIL=your@email.com
```
