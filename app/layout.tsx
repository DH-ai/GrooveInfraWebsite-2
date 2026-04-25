import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
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

export const metadata: Metadata = {
  title: {
    default: 'Groove Infra — Premium Interior Construction',
    template: '%s | Groove Infra',
  },
  description:
    'Groove Infra delivers premium interior construction — retail fit-outs, corporate offices, hospitality, and residential spaces crafted with precision.',
  keywords: [
    'interior construction',
    'fit-out',
    'retail interior',
    'office interior',
    'hospitality design',
    'Mumbai',
    'India',
  ],
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
      </body>
    </html>
  )
}
