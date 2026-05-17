# Groove Infra — Checklist

## Email setup (clarified)

| Address | Purpose |
|---------|---------|
| **contactus@grooveinfra.in** | Public contact on the website. People email Groove Infra directly. Set up **forwarding** at your domain host (not Resend). |
| **noreply@grooveinfra.in** | Resend **From** when someone submits the enquiry form → sends **confirmation** to the visitor. |
| **enquire@grooveinfra.in** | Resend **From** for **you** when someone submits the form → alert sent to your personal inbox. |
| **dhruvastro67@gmail.com** (or `ENQUIRY_INBOX`) | Where enquiry alerts are **delivered**. |

### Resend / DNS
- [ ] Verify `grooveinfra.in` at [resend.com/domains](https://resend.com/domains)
- [ ] Set `.env.local`: `NOREPLY_FROM`, `ENQUIRY_FROM`, `ENQUIRY_INBOX`
- [ ] Set `RESEND_USE_TEST_SENDER=false` after domain is live
- [ ] Forward **contactus@** → personal Gmail (registrar / Cloudflare Email Routing)
- [ ] Test form: visitor gets confirmation from noreply@, you get alert from enquire@

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
- [ ] Production env on Vercel (`ENQUIRY_INBOX`, Resend keys, domain verified)
