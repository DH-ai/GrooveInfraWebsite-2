/** @type {import('next').NextConfig} */

// Supabase Storage serves the project imagery, so it must be allowed as an image
// and connect source. Derived from the configured project URL rather than
// hardcoded so preview/staging projects work too.
const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : ''
  } catch {
    return ''
  }
})()

// Cloudflare Turnstile loads its script from, and renders its challenge in an
// iframe served by, this origin.
const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com'

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js ships inline bootstrap scripts, and the theme script in the root
  // layout must run before paint to avoid a flash of the wrong theme.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${TURNSTILE_ORIGIN} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  // Narrowed from `https:`, which permitted any host on the web. Every image the
  // site renders is now either our own storage, a file in public/, or drawn from
  // CSS, so there is nothing left that needs a third-party host.
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${TURNSTILE_ORIGIN} https://vitals.vercel-insights.com`.trim(),
  `frame-src 'self' ${TURNSTILE_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig = {
  poweredByHeader: false,
  images: {
    /*
     * Our own storage only. The stock hosts that used to be listed here
     * (images.unsplash.com, plus.unsplash.com, picsum.photos) and the hotlinked
     * LinkedIn CDN are gone: unphotographed projects are filled by
     * lib/placeholder-art.ts, which draws from CSS and fetches nothing. Keeping
     * this list to storage means an image URL that is not ours cannot render,
     * which makes the allowlist a second line of defence behind
     * isAllowedImageUrl on the write path.
     */
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      // Local Supabase stack (development)
      { protocol: 'http', hostname: '127.0.0.1', port: '54321' },
      { protocol: 'http', hostname: 'localhost', port: '54321' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
