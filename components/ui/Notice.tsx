type NoticeTone = 'info' | 'success' | 'warning' | 'error'

interface NoticeProps {
  tone?: NoticeTone
  children: React.ReactNode
  /** Set for messages that appear in response to an action, so they are announced. */
  live?: boolean
  className?: string
  'data-testid'?: string
}

/**
 * The one banner shape on the site.
 *
 * There were eleven of these written out by hand — `rounded-2xl border
 * border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100` and ten near
 * misses, differing in radius, border opacity and text tint depending on which
 * file they were typed into. A 20%-opacity border also renders as barely
 * anything, so the tone was being carried almost entirely by a 10% background
 * wash.
 *
 * A 2px rule on the leading edge carries the tone at full strength, which both
 * reads at a glance and survives a forced-colours mode that drops the wash.
 */
const TONES: Record<NoticeTone, string> = {
  info: 'border-groove-gold bg-groove-gold/10 text-primary',
  success: 'border-emerald-400 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-400 bg-amber-500/10 text-amber-100',
  error: 'border-red-400 bg-red-500/10 text-red-100',
}

export default function Notice({
  tone = 'info',
  children,
  live = false,
  className = '',
  'data-testid': testId,
}: NoticeProps) {
  return (
    <div
      data-testid={testId}
      role={live ? 'status' : undefined}
      className={`border-l-2 px-5 py-4 text-body ${TONES[tone]} ${className}`}
    >
      {children}
    </div>
  )
}
