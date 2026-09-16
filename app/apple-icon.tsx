import { ImageResponse } from 'next/og'

/** Home-screen icon for iOS, which ignores the 32px favicon. */

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#C9A84C',
          color: '#080808',
          fontSize: 120,
          fontWeight: 700,
          fontFamily: 'serif',
        }}
      >
        G
      </div>
    ),
    size
  )
}
