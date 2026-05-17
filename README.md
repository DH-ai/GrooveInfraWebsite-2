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
ENQUIRY_INBOX=dhruvastro67@gmail.com          # you receive form alerts here
NOREPLY_FROM=Groove Infra <noreply@grooveinfra.in>   # visitor confirmation
ENQUIRY_FROM=Groove Infra Enquiries <enquire@grooveinfra.in>  # alert sender
PUBLIC_CONTACT_EMAIL=contactus@grooveinfra.in # public site email (forward separately)
RESEND_USE_TEST_SENDER=true                   # false after domain verified in Resend
```

See [Checklist.md](Checklist.md) for email roles and admin panel tasks.

## Project Structure

```
app/            # Next.js App Router pages & API routes
components/     # React components (layout, home, projects, ui)
lib/            # Data fetching helpers and utilities
types/          # TypeScript interfaces
public/         # Static assets
```

For full architecture, component, and API documentation see [documentation.md](documentation.md).
