import { ImageResponse } from 'next/og'

/**
 * Favicon, generated so the mark stays in sync with the wordmark in the header
 * and footer instead of being a separate binary that drifts.
 */

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#D4AF37',
          color: '#171717',
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'serif',
          borderRadius: 4,
        }}
      >
        G
      </div>
    ),
    size
  )
}
