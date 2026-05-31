# Groove Infra — Checklist

## Email setup (clarified)

| Address | Purpose | Where it lives |
|---------|---------|----------------|
| **contactus@grooveinfra.in** | Public contact on the website. People email Groove Infra directly. | Site + `PUBLIC_CONTACT_EMAIL` in env |
| **noreply@grooveinfra.in** | Form confirmation **to the visitor** | `NOREPLY_FROM` in env |
| **enquire@grooveinfra.in** | Form alert **from** address (you receive the lead info) | `ENQUIRY_FROM` in env |
| **Your personal Gmail** | Where enquiry alerts are **delivered** | `ENQUIRY_INBOX` in **`.env.local` only** — never commit |



### Future (not Resend)
- [ ] Reply to leads via email/SMS from admin (see Admin panel below)

---

## Admin panel (to build)

Internal tool (need to change the url to `admin.grooveinfra.in`) for operations — not on the public site.

### Projects
- [x] Upload project images (`public/images/projects/<slug>/`)
- [x] Create / edit / delete projects (`metadata.json` or Supabase)
- [x] Mark featured, categories, testimonials

### Enquiries
- [x] List form submissions (store in DB — Supabase or similar)
- [ ] View enquiry detail on admin page itself (name, email, phone, message, project type)
- [ ] Reply to enquires from admin page itself. 
- [ ] Status on admin page for enquiries: new / contacted / closed

### Outreach (future service)
- [ ] Send email to a lead from admin (templates, from enquire@ or team address)
- [ ] Send SMS / WhatsApp to a lead (pick provider: Twilio, MSG91, etc.)
- [ ] Log communication history per enquiry

### Auth & infra
- [x] Admin login (`ADMIN_PASSWORD` or proper auth)
- [ ] Protect all admin routes
- [ ] Deploy admin separately or behind middleware

---

## Website (done / in progress)

- [x] Home stats, contact details, Delhi address
- [x] Remove placeholder sections (brands carousel, blog on home)
- [x] Project-only images in Our Work carousel
- [x] Dual Resend emails on contact form (confirmation + enquiry alert)
- [x] Add real project photos so Our Work carousel appears
- [x] Production env on Vercel (`ENQUIRY_INBOX`, Resend keys)
