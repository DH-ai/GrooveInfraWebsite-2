# Groove Infra — Setup runbook

Everything you have to do by hand: which keys to create, where each one goes, how
to sign into the admin panel, and how to check it worked. Work top to bottom; each
step says what breaks if you skip it.

`.env.example` is the machine-readable version of this document. Copy it to
`.env.local` for development and paste the same names into Vercel for production.

---

## 0. The short version

| # | You need | Where it comes from | Site works without it? |
|---|---|---|---|
| 1 | Supabase project, schema, storage bucket | supabase.com | No — the data layer throws on a missing URL or key, so pages error |
| 2 | Admin username, password, session secret | You invent them; `openssl rand -hex 32` for the secret | No — you cannot sign in to add projects |
| 3 | Turnstile site key + secret key | dash.cloudflare.com → Turnstile | Yes — form still protected by honeypot, timing check, rate limit |
| 4 | Resend API key + verified domain | resend.com | Yes — enquiries are still saved to the database, you just get no email |
| 5 | `NEXT_PUBLIC_SITE_URL` | Your own domain | Yes, but canonical URLs, sitemap and social previews point at the wrong host |

---

## 1. Supabase — database and image storage

1. Create a project at [supabase.com](https://supabase.com). Pick the region
   closest to your visitors (Mumbai/Singapore for India).
2. Open **SQL Editor → New query**, paste the whole of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. That one script
   creates the `projects` and `enquiries` tables, enables row level security,
   creates the public `project-images` storage bucket, and adds the read policies.
3. Open **Project Settings → API** and copy three values:

| Supabase calls it | Put it in | Notes |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | e.g. `https://abcdefgh.supabase.co` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe in the browser. Only reads published projects. |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Never prefix it `NEXT_PUBLIC_`. It bypasses row level security. |

Why the split matters: public pages read with the anon key, so the row level
security policies apply and the `enquiries` table (personal data) is unreachable
from the browser. Admin writes and enquiry reads use the service-role key on the
server only.

> **Vercel gotcha:** `NEXT_PUBLIC_SUPABASE_URL` is read at **build** time as well
> as runtime — the Content Security Policy and the image allowlist in
> `next.config.js` are derived from it. If it is missing during the build, your
> project photos will be blocked by CSP even though the URLs are correct. Set it
> before you deploy, and redeploy after changing it.

---

## 2. Admin panel — how to get in

There is no signup screen. The one account is defined by environment variables.

```env
ADMIN_USERNAME=dhruv
ADMIN_PASSWORD=<a long password you choose>
ADMIN_SESSION_SECRET=<output of: openssl rand -hex 32>
```

- `ADMIN_USERNAME` / `ADMIN_PASSWORD` are the credentials you type on the login
  form. Compared in constant time, so a wrong username and a wrong password are
  indistinguishable by response time.
- `ADMIN_SESSION_SECRET` is not something you type. It is the HMAC-SHA256 key that
  signs your session cookie. Generate it once with `openssl rand -hex 32` and
  never reuse it elsewhere. Changing it immediately signs out every session.
- `ADMIN_TOKEN` is read as a fallback for the signing secret so the older
  deployment keeps working. New setups should set `ADMIN_SESSION_SECRET` and leave
  `ADMIN_TOKEN` unset.

**Signing in:** go to `/admin/login`, enter the username and password. You land on
`/admin`, which lists enquiries and projects. Notes on the session:

- It lasts **8 hours**, then you are redirected back to the login form with
  `?error=expired`.
- The cookie is `httpOnly`, `sameSite=lax`, and `secure` in production, so it
  cannot be read by scripts and is not sent cross-site.
- **10 failed attempts per IP per 15 minutes**, then the login form returns
  `?error=rate-limited` until the window passes. The counter lives in one server
  instance's memory, so treat it as a speed bump against guessing, not a lockout —
  the password still has to be strong.
- Every `/admin/*` and `/api/admin/*` route is gated in `middleware.ts`, so a new
  admin page cannot accidentally ship unprotected.
- `/admin` is `noindex` and excluded from `robots.txt` and the sitemap.

---

## 3. Cloudflare Turnstile — the CAPTCHA on the contact form

Two keys, and it is all-or-nothing: **set both or set neither.**

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add
   widget**. You do not need your DNS on Cloudflare for this.
2. Name it (e.g. `grooveinfra-contact`) and add the hostnames that will show the
   widget: `www.grooveinfra.in` and `grooveinfra.in`. Leave `localhost` out and use
   the test keys below for development instead.
3. Widget mode **Managed** is the right default.
4. Copy the two keys:

| Cloudflare calls it | Put it in | Exposed to browser? |
|---|---|---|
| Site Key | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes, by design — it identifies the widget |
| Secret Key | `TURNSTILE_SECRET_KEY` | **No.** Server-side verification only |

How the code behaves, so you can predict the outcome of a half-finished setup:

- **Neither key set** — the widget does not render and the server skips
  verification. The form still works, and the honeypot field, the
  submitted-too-fast check, and the 5-per-IP-per-10-minutes rate limit all still
  apply. This is the current state of the deployment.
- **Both keys set** — the widget renders in dark theme under the message field and
  the server rejects any submission without a valid, unused token.
- **Only the secret set** — the widget never renders, so no token is ever sent and
  **every submission fails** with "we could not verify that you are human". Do not
  leave it in this state. The site key is inlined at build time, so adding it
  without redeploying leaves you here too.
- **Only the site key set** — the widget renders but the server does not check it.
  Harmless, but pointless.

For local development, Cloudflare's official dummy keys pass from any hostname —
this is what `.env.local` uses, and why you do not need `localhost` on the widget's
hostname list:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

The dummy pair resolves instantly and draws no visible challenge: it writes
`XXXX.DUMMY.TOKEN.XXXX` straight into the hidden `cf-turnstile-response` field, so
an empty space under the message field locally is correct, not a broken widget.
Swap the site key for `2x00000000000000000000AB` to exercise the failure path. Real
secret keys reject the dummy token and vice versa, so keep the pair matched.

---

## 4. Resend — enquiry emails

Enquiries are written to the `enquiries` table **before** any email is attempted,
so a mail outage shows up as an unsent-notification flag in `/admin` rather than a
lost lead. Email is the convenience layer, not the system of record.

1. Sign up at [resend.com](https://resend.com), then **API Keys → Create** with
   send permission. Copy it into `RESEND_API_KEY` (starts `re_`).
2. **Domains → Add domain**, enter `grooveinfra.in`, and add the DKIM/SPF records
   Resend shows you at your DNS provider. Wait for **Verified**. Until then, mail
   from `@grooveinfra.in` addresses will be rejected.
3. Set the addresses:

```env
PUBLIC_CONTACT_EMAIL=<public address on the site, e.g. contact@your-domain>
NOREPLY_FROM=<sends the confirmation to the visitor, e.g. noreply@your-domain>
ENQUIRY_FROM=<from address on your alert, e.g. enquire@your-domain>
ENQUIRY_INBOX=<your personal inbox — where alerts are delivered>
```

`ENQUIRY_INBOX` is private: put it in `.env.local` and in Vercel, never in a
committed file. `PUBLIC_CONTACT_EMAIL` is the only one rendered on the page — if
it is unset, the site omits the email row entirely rather than printing a dead
`mailto:`.

Test it with `npm run email:test` once `.env.local` is filled in.

---

## 5. Domain and canonical URL

```env
NEXT_PUBLIC_SITE_URL=https://www.grooveinfra.in
```

Set this in production. Without it the code falls back to Vercel's generated
deployment hostname, which would put `groove-infra-xyz.vercel.app` into your
canonical tags, sitemap and Open Graph URLs — bad for search.

In Vercel, add both `grooveinfra.in` and `www.grooveinfra.in`, and make the apex
**redirect** to `www` so there is a single canonical host.

---

## 6. Vercel — where to paste all of it

**Project → Settings → Environment Variables.** Add every name from the table
below to **Production** (and to Preview if you want previews to work fully).
Redeploy afterwards — changing a variable does not rebuild on its own, and the
`NEXT_PUBLIC_*` ones are inlined at build time.

| Variable | Required | Secret |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Yes** |
| `ADMIN_USERNAME` | Yes | Yes |
| `ADMIN_PASSWORD` | Yes | **Yes** |
| `ADMIN_SESSION_SECRET` | Yes | **Yes** |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | No |
| `PUBLIC_CONTACT_EMAIL` | Recommended | No |
| `RESEND_API_KEY` | For email | **Yes** |
| `NOREPLY_FROM`, `ENQUIRY_FROM` | For email | No |
| `ENQUIRY_INBOX` | For email | Yes |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional | No |
| `TURNSTILE_SECRET_KEY` | Optional (pair with the above) | **Yes** |

Analytics needs no keys. Vercel Analytics and Speed Insights are wired into the
root layout and start reporting once the project is deployed on Vercel; enable
them under **Project → Analytics** / **Speed Insights**.

---

## 7. Putting your real photographs in

Nothing needs configuring for this, and nothing needs deleting. A project with no
uploaded images renders a generated plate derived from its slug; the moment you
upload photography it takes over.

1. Sign in at `/admin`.
2. **New project**, or **Edit** an existing one.
3. Attach a **cover image** and any number of **gallery images**. JPEG, PNG, WebP
   or AVIF, up to 10 MB each. They upload straight to the `project-images` bucket
   through a short-lived signed URL, so the service-role key never reaches the
   browser.
4. Save. The public pages revalidate immediately — no redeploy.

`/admin` labels every project either with its photo count or with **Generated
plate**, and warns at the top of the list how many are still unphotographed, so
you can see what is left to shoot.

---

## 8. Verify it worked

After deploying with the variables set:

- `/` renders with a hero photograph or a generated plate, not an empty frame.
- `/admin/login` accepts your credentials and `/admin` lists projects.
- Create a throwaway project with one image, confirm it appears at
  `/projects/<slug>`, then delete it.
- Submit the contact form. You should get the confirmation email, your inbox
  should get the alert, and the enquiry should appear in `/admin`.
- `/sitemap.xml` and `/robots.txt` both mention `www.grooveinfra.in`, not a
  `vercel.app` host.
- View source on `/`: `og:image` points at `/opengraph-image`.

The repository's own suites cover the rest — see [documentation.md](documentation.md)
for `npm run test:a11y`, `test:contrast` and `test:images`.

---

## 9. When something is wrong

| Symptom | Cause |
|---|---|
| Login form shows `missing-config` | `ADMIN_USERNAME`, `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` is unset in that environment |
| Login shows `rate-limited` | 10 failed attempts from your IP; wait 15 minutes |
| Signed out after a few hours | Normal — the session is 8 hours |
| Signed out immediately, repeatedly | `ADMIN_SESSION_SECRET` differs between deployments, or changed since the cookie was issued |
| Projects exist but photos are blank | `NEXT_PUBLIC_SUPABASE_URL` was missing at build time, so CSP and the image allowlist do not include your storage host. Set it and redeploy. |
| Public pages show no projects | `supabase/schema.sql` was not run, or the `projects_public_read` policy is missing |
| Every contact submission fails verification | `TURNSTILE_SECRET_KEY` is set but `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is not |
| Enquiries in `/admin` flagged as email not sent | `RESEND_API_KEY` missing, domain not verified in Resend, or `ENQUIRY_INBOX` unset. The lead is safe in the database. |
| Canonical URLs point at `vercel.app` | `NEXT_PUBLIC_SITE_URL` is unset in production |

---

## Local development

```bash
cp .env.example .env.local   # then fill it in
npm install
npm run dev                  # http://localhost:3000
```

Point `.env.local` at either your hosted Supabase project or a local stack
(`supabase start`; its loopback API port is already allowed in `next.config.js`, so
project images render without touching the image allowlist). Use the Turnstile
dummy keys from step 3.

If a shell already exports `ADMIN_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL` or similar,
those exported values win over `.env.local` and you will be running against
something other than you think. Run builds and servers through
`scripts/with-local-env.sh` to force `.env.local` to take precedence.
