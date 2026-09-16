import type { Metadata } from 'next'

/**
 * Applies to every admin route. robots.txt already disallows /admin, but a
 * crawler that reaches a page anyway — via a pasted link, for instance — needs
 * the meta tag to keep it out of the index.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
