'use client'

import { useCallback, useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    // offsetParent is null for anything display:none or inside a hidden
    // subtree, which must not be counted as a tab stop.
    (el) => el.offsetParent !== null || el === document.activeElement
  )
}

interface UseDialogOptions {
  open: boolean
  onClose: () => void
}

/**
 * The modal behaviour that the ARIA Authoring Practices Guide requires of any
 * `role="dialog"` with `aria-modal="true"`, in one place so the lightbox and the
 * mobile navigation cannot drift apart:
 *
 *   - Escape closes.
 *   - Tab and Shift+Tab cycle inside the dialog instead of escaping into the
 *     page behind it.
 *   - Focus moves into the dialog on open and returns to the element that
 *     opened it on close, so the keyboard user is not dumped at the top of the
 *     document.
 *   - Body scrolling is locked while it is open.
 *
 * Returns a ref to attach to the dialog container.
 */
export function useDialog({ open, onClose }: UseDialogOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  // Read through a ref inside the effect so a caller passing an inline arrow
  // function does not tear down and reinstall the listeners on every render.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement as HTMLElement | null

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const container = containerRef.current
    if (container) {
      const first = focusableWithin(container)[0]
      ;(first ?? container).focus()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const node = containerRef.current
      if (!node) return

      const focusable = focusableWithin(node)
      if (!focusable.length) {
        event.preventDefault()
        node.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (active instanceof Node && !node.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      returnFocusRef.current?.focus()
    }
  }, [open])

  return containerRef
}

/**
 * Convenience wrapper for the common "close when the backdrop itself is
 * clicked, but not when a click bubbles up from the dialog's contents" case.
 */
export function useBackdropClose(onClose: () => void) {
  return useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (event.target === event.currentTarget) onClose()
    },
    [onClose]
  )
}
