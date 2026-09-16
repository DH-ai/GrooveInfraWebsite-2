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
| Spam | Cloudflare Turnstile |
| Deployment | Vercel |

## Getting Started

```bash
cp .env.example .env.local   # then fill it in — see SETUP.md
npm install
npm run dev       # dev server on localhost:3000
npm run build     # production build
npm run lint      # ESLint check
```

## Environment Variables

Every variable, what it is for, and where to get it: **[SETUP.md](SETUP.md)**.
[`.env.example`](.env.example) is the copy-paste version.

The short list: Supabase URL and both keys, admin credentials plus a session
signing secret, `NEXT_PUBLIC_SITE_URL`, Resend key and addresses, and optionally a
Cloudflare Turnstile key pair.

## Setup and Operations

[SETUP.md](SETUP.md) covers creating the Supabase schema and storage bucket,
signing into the admin panel, issuing Turnstile and Resend keys, the Vercel
variable list, uploading project photography, and what each failure symptom means.

[Checklist.md](Checklist.md) tracks the remaining product work.

## Project Structure

```
app/            # Next.js App Router pages & API routes
components/     # React components (layout, home, projects, ui)
lib/            # Data fetching helpers and utilities
scripts/        # Test suites (a11y, contrast, image fallback, API integration)
supabase/       # Schema and migrations
types/          # TypeScript interfaces
public/         # Static assets
```

For full architecture, component, and API documentation see [documentation.md](documentation.md).
