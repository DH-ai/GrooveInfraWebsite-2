# Groove Infra — Checklist

## Email setup (clarified)

| Address | Purpose | Where it lives |
|---------|---------|----------------|
| **contactus@grooveinfra.in** | Public contact on the website. People email Groove Infra directly. | Site + `PUBLIC_CONTACT_EMAIL` in env |
| **noreply@grooveinfra.in** | Form confirmation **to the visitor** | `NOREPLY_FROM` in env |
| **enquire@grooveinfra.in** | Form alert **from** address (you receive the lead info) | `ENQUIRY_FROM` in env |
| **Your personal Gmail** | Where enquiry alerts are **delivered** | `ENQUIRY_INBOX` in **`.env.local` only** — never commit |

### Environment files
- [ ] Copy `.env.local.example` → `.env.local`
- [ ] Set `ENQUIRY_INBOX` to your personal email in `.env.local` (not in `.env.example` or git)
- [ ] Set `RESEND_API_KEY`, `NOREPLY_FROM`, `ENQUIRY_FROM` in `.env.local`
- [ ] On Vercel: add the same vars under Project → Environment Variables (not in the repo)

### Email (ongoing)
- [ ] Forward **contactus@** → personal inbox (registrar / Cloudflare Email Routing)
- [ ] Test form: visitor gets confirmation from noreply@, you get alert from enquire@ → `ENQUIRY_INBOX`

### Future (not Resend)
- [ ] Reply to leads via email/SMS from admin (see Admin panel below)

---

## Admin panel (to build)

Internal tool (e.g. `admin.grooveinfra.in`) for operations — not on the public site.

### Projects
- [ ] Upload project images (`public/images/projects/<slug>/`)
- [ ] Create / edit / delete projects (`metadata.json` or Supabase)
- [ ] Mark featured, categories, testimonials

### Enquiries
- [ ] List form submissions (store in DB — Supabase or similar)
- [ ] View enquiry detail (name, email, phone, message, project type)
- [ ] Status: new / contacted / closed

### Outreach (future service)
- [ ] Send email to a lead from admin (templates, from enquire@ or team address)
- [ ] Send SMS / WhatsApp to a lead (pick provider: Twilio, MSG91, etc.)
- [ ] Log communication history per enquiry

### Auth & infra
- [ ] Admin login (`ADMIN_PASSWORD` or proper auth)
- [ ] Protect all admin routes
- [ ] Deploy admin separately or behind middleware

---

## Website (done / in progress)

- [x] Home stats, contact details, Delhi address
- [x] Remove placeholder sections (brands carousel, blog on home)
- [x] Project-only images in Our Work carousel
- [x] Dual Resend emails on contact form (confirmation + enquiry alert)
- [ ] Add real project photos so Our Work carousel appears
- [ ] Production env on Vercel (`ENQUIRY_INBOX`, Resend keys)
