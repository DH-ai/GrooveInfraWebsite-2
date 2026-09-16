import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import OrganizationSchema from '@/components/seo/OrganizationSchema'
import ScrollProgress from '@/components/ui/ScrollProgress'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const defaultTitle = `${SITE_NAME} — ${SITE_TAGLINE}`

export const metadata: Metadata = {
  // Makes every relative `alternates.canonical` and generated OG image path in
  // the app resolve to an absolute URL, which social scrapers require.
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'interior construction',
    'fit-out',
    'retail interior',
    'office interior',
    'hospitality design',
    'Delhi',
    'Gurgaon',
    'NCR',
    'India',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: SITE_LOCALE,
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('groove-theme')||((window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-base text-primary`}>
        <ThemeProvider>
          <ScrollProgress />
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
        <OrganizationSchema />
        {/* Both are no-ops outside Vercel, so local development is unaffected. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
