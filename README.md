# Groove Infra — Website

Marketing and portfolio website for Groove Infra, an interior construction company operating across India.

Built with **Next.js 14 App Router**, TypeScript, Tailwind CSS, and Framer Motion. Project data is managed via **Supabase**.

## Tech Stack

| Concern | Library |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase |
| Email | Resend |
| Deployment | Vercel |

## Getting Started

```bash
npm install
npm run dev       # dev server on localhost:3000
npm run build     # production build
npm run lint      # ESLint check
```

## Environment Variables

Create a `.env.local` at the project root:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_EMAIL=your@email.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
app/            # Next.js App Router pages & API routes
components/     # React components (layout, home, projects, ui)
lib/            # Data fetching helpers and utilities
types/          # TypeScript interfaces
public/         # Static assets
```

For full architecture, component, and API documentation see [documentation.md](documentation.md).
