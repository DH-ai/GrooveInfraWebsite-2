import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="gutter flex min-h-screen items-center bg-base">
      <div className="mx-auto w-full max-w-[100rem]">
        <p aria-hidden="true" className="nums-tabular text-micro text-muted-custom">
          404
        </p>
        <h1 className="mt-8 max-w-[20ch] font-display text-h1 font-semibold text-primary">
          That page is not here.
        </h1>
        <p className="measure mt-8 text-body-lg text-secondary">
          The address is wrong, or the page has moved. The work is all still in the portfolio.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center bg-groove-gold px-8 py-3.5 text-meta font-semibold uppercase tracking-eyebrow text-black transition-colors duration-300 hover:bg-groove-gold-light"
          >
            View the portfolio
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center border-b border-strong pb-1 text-meta font-medium uppercase tracking-eyebrow text-primary transition-colors hover:border-groove-gold hover:text-accent-gold"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
