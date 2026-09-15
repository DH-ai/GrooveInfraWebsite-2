/**
 * First focusable element on the page, so a keyboard or screen-reader user can
 * jump past the header nav instead of tabbing through it on every route.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only-focusable fixed left-4 top-4 z-[200] inline-flex min-h-11 items-center rounded-full bg-groove-gold px-5 text-sm font-semibold text-black"
    >
      Skip to main content
    </a>
  )
}
