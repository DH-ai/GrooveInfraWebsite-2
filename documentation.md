         # Groove Infra Website — Developer Documentation

A premium Next.js 14 website for an interior construction company operating across India. Built with the App Router, TypeScript, Tailwind CSS, and Framer Motion.

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Configuration Files](#configuration-files)
5. [Types](#types)
6. [Utilities / Lib](#utilities--lib)
7. [App Router Pages](#app-router-pages)
8. [Layout Components](#layout-components)
9. [Home Page Components](#home-page-components)
10. [Project Components](#project-components)
11. [Contact Components](#contact-components)
12. [UI Components](#ui-components)
13. [Styling & Design System](#styling--design-system)
14. [Content & Data](#content--data)
15. [API Routes](#api-routes)
16. [Environment Variables](#environment-variables)

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
| `getAllTestimonials()` | `Testimonial[]` | Projects that have a `testimonial` field |
| `getProjectCategories()` | `string[]` | `['all', 'commercial', 'retail', 'residential', 'civil']` |
| `getProjectsByCategory(cat)` | `Project[]` | Filtered by category string |

**Image resolution order:**
1. Local files in `public/images/projects/[slug]/`
2. `placeholder_images` from metadata.json
3. Generic placeholder

---

## App Router Pages

### [`app/layout.tsx`](app/layout.tsx) — Root Layout
Wraps every page. Loads Google Fonts (Inter + Playfair Display), sets global metadata, injects a theme-init script that reads `localStorage` before first render (prevents flash), and renders `Header`, `ScrollProgress`, `{children}`, `Footer` inside `ThemeProvider`.

### [`app/page.tsx`](app/page.tsx) — Homepage
Server component. Calls `getAllProjects()` and `getAllTestimonials()`, then renders sections in order:
`Hero` → `Stats` → `Services` → `PhotoCarousel` → `ClientLogos` → `Testimonials` → `BlogInsights` → `CallToAction`

### [`app/about/page.tsx`](app/about/page.tsx)
Static server component. Hardcoded data for `workingPhases` (8 phases), `team` (3 members), `serviceAreas` (5 cities). No data fetching needed.

Sections: Hero → Image collage → Story + Philosophy → 8-phase process grid → Team profiles → Service areas → CTA.

### [`app/projects/page.tsx`](app/projects/page.tsx)
Server component. Fetches all projects and categories, passes them to `ProjectGrid` for client-side filtering.

### [`app/projects/[slug]/page.tsx`](app/projects/[slug]/page.tsx)
Dynamic server component.
- `generateStaticParams()` — pre-renders all project slugs at build time (SSG).
- `generateMetadata()` — per-project `<title>` and `<description>`.
- Calls `notFound()` if slug doesn't match any project.

Renders: Hero image → Back link → Description → `ProjectGallery` → Testimonial quote → Sidebar (meta, tags, CTA).

### [`app/contact/page.tsx`](app/contact/page.tsx)
Server component. Splits into two columns: left = `ContactForm`, right = contact info cards (email, phone, office address). Below both: `FaqAccordion`.

Contact details: `hello@grooveinfra.in`, `+91 22 1234 5678`, Bandra Kurla Complex, Mumbai.

### [`app/innovation/page.tsx`](app/innovation/page.tsx)
Static server component. Showcases 4 coming-soon products (AI Cost Estimator, Modular Interior Systems, Vendor Marketplace, Project Intelligence). No live functionality yet.

### [`app/not-found.tsx`](app/not-found.tsx)
Renders a gold "404" and a link back to home. Triggered automatically by `notFound()` calls.

---

## Layout Components

### [`components/layout/Header.tsx`](components/layout/Header.tsx)
`'use client'`. Sticky header that changes style after 50px scroll. Contains:
- Logo (text + gold accent square)
- Desktop nav links: Portfolio, About, Innovation, Contact
- `ThemeToggle`
- "Enquire" CTA button
- Hamburger / animated mobile overlay menu

Active link detection uses `usePathname()`.

### [`components/layout/Footer.tsx`](components/layout/Footer.tsx)
Server component. Two-column layout — brand + contact info left, services/company links right. Dynamic copyright year. Links to filtered project category pages (`/projects?category=retail`).

### [`components/layout/ThemeProvider.tsx`](components/layout/ThemeProvider.tsx)
`'use client'`. React context that exposes `{ theme, toggleTheme }`. Reads from `localStorage` on mount, falls back to `prefers-color-scheme`. Applies `dark` class to `<html>`. Export the hook with `useTheme()`.

---

## Home Page Components

### [`components/home/Hero.tsx`](components/home/Hero.tsx)
`'use client'`. Full-screen image carousel with 4 slides, 5.5s auto-advance. Pauses on hover. Features: animated text transitions, arrow navigation, dot navigation, slide counter, progress bar, two CTA buttons.

### [`components/home/Stats.tsx`](components/home/Stats.tsx)
`'use client'`. Displays 4 key numbers: 200+ projects, 50+ brands, 12+ years, 98% on-time. Each number animates from 0 to target when the section scrolls into view (1800ms, triggered via `useInView`).

### [`components/home/Services.tsx`](components/home/Services.tsx)
`'use client'`. 4 service cards (Retail, Hospitality, Commercial, Residential) with lucide icons, numbered 01–04, hover background highlight.

### [`components/home/PhotoCarousel.tsx`](components/home/PhotoCarousel.tsx)
`'use client'`. Two infinite-scroll horizontal rows of project images. Row 1 scrolls left (38s), row 2 right (44s). Hover shows project name + category overlay. Clicks navigate to project detail.

**Props:** `{ projects: Project[] }`

### [`components/home/ClientLogos.tsx`](components/home/ClientLogos.tsx)
`'use client'`. Two marquee rows (opposite directions) of 10 client brand names. Gradient fade masks on edges. Hover restores logo from grayscale.

### [`components/home/Testimonials.tsx`](components/home/Testimonials.tsx)
`'use client'`. Direction-aware testimonial carousel. Slide animations follow prev/next direction. Dot navigation + arrow buttons.

**Props:** `{ testimonials: Testimonial[] }`

### [`components/home/BlogInsights.tsx`](components/home/BlogInsights.tsx)
`'use client'`. 3-column grid of hardcoded blog article previews. Each card: cover image, category badge, date, reading time, clamped description, hover reveal read-more link.

### [`components/home/FeaturedProjects.tsx`](components/home/FeaturedProjects.tsx)
`'use client'`. Bento-style layout: 1 large card (spanning 2 rows) + 2 stacked right + 2 bottom. Hover: image zoom, arrow button appears, title turns gold. Clicks navigate to project detail.

**Props:** `{ projects: Project[] }`

### [`components/home/CallToAction.tsx`](components/home/CallToAction.tsx)
`'use client'`. Dark section with gold radial glows, grid overlay pattern, animated pulse badge, large gradient heading, two CTA buttons. Scale-in animation on scroll entry.

---

## Project Components

### [`components/projects/ProjectCard.tsx`](components/projects/ProjectCard.tsx)
`'use client'`. Reusable project card used in grid listings.

**Props:** `{ project: Project }`

Renders: cover image with hover zoom (1.06×), dark gradient overlay, category badge, animated arrow button, location + year + description, optional area/duration.

### [`components/projects/ProjectGrid.tsx`](components/projects/ProjectGrid.tsx)
`'use client'`. The main portfolio page component. Manages active filter state locally, renders a filter bar and a 3-column responsive grid of `ProjectCard` components. Handles empty state if no projects match the active filter. Layout transitions animate when filter changes.

**Props:** `{ projects: Project[], categories: string[] }`

### [`components/projects/ProjectFilter.tsx`](components/projects/ProjectFilter.tsx)
`'use client'`. Row of pill buttons for category filtering. Active pill has a gold background that animates between buttons using Framer Motion `layoutId`.

**Props:**
```ts
{
  categories: string[]
  active: string
  onChange: (cat: string) => void
}
```

### [`components/projects/ProjectGallery.tsx`](components/projects/ProjectGallery.tsx)
`'use client'`. Image grid with a fullscreen lightbox.

**Props:** `{ images: string[], title: string }`

Grid: first image is 16:9 spanning 2 columns, rest are square. Click any image to open lightbox. Lightbox: black overlay, image counter, prev/next, close button, click-outside-to-close.

---

## Contact Components

### [`components/contact/ContactForm.tsx`](components/contact/ContactForm.tsx)
`'use client'`. Full contact form that POSTs to `/api/contact`.

**State:** `status` (`idle | loading | success | error`), `projectType` (selected pill)

**Fields:**
1. Name (required)
2. Company/Brand
3. Email (required)
4. Phone
5. Project Type — 6 pill selectors: Retail, Hospitality, Commercial, Residential, Civil, Other
6. Location
7. Message (required, textarea)

Shows spinner during submission, checkmark on success, error message on failure. All inputs highlight gold on focus.

### [`components/contact/FaqAccordion.tsx`](components/contact/FaqAccordion.tsx)
`'use client'`. Accordion with 6 FAQs. Only one item open at a time. First item open by default. Animated height transitions (0.28s). Topics: project types, timelines, geography, minimum budget (₹20 lakhs), design+build, warranty.

---

## UI Components

### [`components/ui/AnimatedSection.tsx`](components/ui/AnimatedSection.tsx)
Generic scroll-reveal wrapper. Use this around any section that should fade/slide in when it enters the viewport.

**Props:**
```ts
{
  children: React.ReactNode
  className?: string
  delay?: number         // default 0
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'  // default 'up'
  once?: boolean         // default true
}
```

Element starts 40px offset in the chosen direction, then transitions to its natural position over 0.6s.

### [`components/ui/ThemeToggle.tsx`](components/ui/ThemeToggle.tsx)
`'use client'`. Circular button that calls `toggleTheme()` from `useTheme()`. Shows a Sun icon in dark mode, Moon icon in light mode. Animated icon swap with rotation.

### [`components/ui/GlassCard.tsx`](components/ui/GlassCard.tsx)
`'use client'`. Card with 3D tilt on mouse move and a glare reflection effect that follows the cursor.

**Props:**
```ts
{
  children: React.ReactNode
  className?: string
  tilt?: boolean    // default true
  glow?: boolean    // default false, only visible in dark mode
}
```

### [`components/ui/ScrollProgress.tsx`](components/ui/ScrollProgress.tsx)
`'use client'`. Fixed 2px gold bar at the top of the page. Width is driven by `useScroll()` from Framer Motion and scales from 0% to 100% as the user scrolls the page. Spring-animated (stiffness 200, damping 30).

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
  "phone": "string",
  "company": "string",
  "projectType": "string",
  "location": "string"
}
```

**Success response:** `{ "ok": true }` with status 200

**Error responses:**
- `400` — Missing required fields
- `500` — Email send failure

Sends an HTML-formatted email via Resend. The reply-to address is set to the form submitter's email so replies go directly to them.

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
