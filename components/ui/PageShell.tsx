interface PageShellProps {
  children: React.ReactNode
  /**
   * `wide` for pages that carry imagery or multi-column data, `reading` for
   * pages that are only prose and should be capped at a readable measure.
   */
  width?: 'wide' | 'reading'
  className?: string
}

/**
 * The page frame: gutter, top clearance for the fixed header, and one content
 * width.
 *
 * Each page used to declare its own — `max-w-7xl` here, `max-w-3xl` there,
 * `px-4 sm:px-6 lg:px-8` in five places, `pt-20` on some and `pt-24` on others.
 * The result was a page edge that moved as you navigated between them and a
 * heading that started 16px further left on Contact than on Portfolio. There is
 * one frame now, and the only choice a page makes is how wide its column is.
 */
export default function PageShell({ children, width = 'wide', className = '' }: PageShellProps) {
  return (
    <div className={`gutter min-h-screen bg-base pb-28 pt-36 ${className}`}>
      <div className={`mx-auto w-full ${width === 'wide' ? 'max-w-[100rem]' : 'max-w-[52rem]'}`}>
        {children}
      </div>
    </div>
  )
}
