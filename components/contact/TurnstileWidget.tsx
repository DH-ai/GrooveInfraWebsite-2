'use client'

import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile widget.
 *
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, so the form keeps
 * working before the Cloudflare keys are configured. The server skips
 * verification in exactly the same case; see lib/turnstile.ts.
 */

interface TurnstileWidgetProps {
  onToken: (token: string) => void
  /** Bumping this re-renders the widget, which is required after a failed submit. */
  resetKey: number
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          theme?: 'auto' | 'light' | 'dark'
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        }
      ) => string
      remove: (widgetId: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

function loadScript(): Promise<void> {
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(script)
  })
}

export default function TurnstileWidget({ onToken, resetKey }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!siteKey) return

    const container = containerRef.current
    if (!container) return

    let widgetId: string | undefined
    let cancelled = false

    loadScript()
      .then(() => {
        // The script defines window.turnstile asynchronously after load.
        const start = Date.now()
        const tryRender = () => {
          if (cancelled || !containerRef.current) return
          if (!window.turnstile) {
            if (Date.now() - start > 10_000) return
            window.setTimeout(tryRender, 100)
            return
          }
          container.innerHTML = ''
          widgetId = window.turnstile.render(container, {
            sitekey: siteKey,
            theme: 'auto',
            callback: (token) => onToken(token),
            'expired-callback': () => onToken(''),
            'error-callback': () => onToken(''),
          })
        }
        tryRender()
      })
      .catch((err) => console.error('[turnstile]', err))

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId)
        } catch {
          // Widget already gone; nothing to clean up.
        }
      }
    }
  }, [siteKey, onToken, resetKey])

  if (!siteKey) return null

  return <div ref={containerRef} className="mt-1" />
}
