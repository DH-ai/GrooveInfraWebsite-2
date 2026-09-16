import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site'

/**
 * Social preview card, generated at build time rather than committed as a
 * binary, so the wording and palette stay editable in code and no image asset
 * has to be tracked in git.
 *
 * Uses plain inline styles because Satori (the renderer behind ImageResponse)
 * supports only a subset of CSS and does not see Tailwind classes.
 */

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GOLD = '#C9A84C'
const INK = '#1a1816'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: INK,
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* A gold hairline across the top, echoing the section rules on the site. */}
        <div style={{ display: 'flex', height: 4, width: 160, background: GOLD }} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              letterSpacing: 10,
              textTransform: 'uppercase',
              color: GOLD,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.05,
              color: '#ECE7DE',
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 30,
              color: '#9A9A9A',
            }}
          >
            Retail · Hospitality · Commercial · Residential
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 24,
            color: '#6E6E6E',
          }}
        >
          <span>{SITE_URL.replace(/^https?:\/\//, '')}</span>
          <span>Delhi · Gurgaon · Noida</span>
        </div>
      </div>
    ),
    size
  )
}
