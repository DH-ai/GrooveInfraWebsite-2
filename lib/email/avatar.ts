import { createHash } from 'crypto'
import { escapeHtml } from './escape'

/** Gravatar with UI Avatars fallback — works in HTML email clients. */
export function getAvatarUrl(email: string, name: string): string {
  const hash = createHash('md5').update(email.trim().toLowerCase()).digest('hex')
  const displayName = encodeURIComponent(name.trim() || email.split('@')[0])
  const fallback = encodeURIComponent(
    `https://ui-avatars.com/api/?name=${displayName}&background=C9A84C&color=111111&size=128&bold=true&format=png`
  )
  return `https://www.gravatar.com/avatar/${hash}?s=128&d=${fallback}`
}

export function avatarImgHtml(email: string, name: string): string {
  const safeName = escapeHtml(name)
  const src = getAvatarUrl(email, name)
  return `
    <img
      src="${src}"
      alt="${safeName}"
      width="72"
      height="72"
      style="display:block;width:72px;height:72px;border-radius:50%;border:3px solid #C9A84C;object-fit:cover;"
    />
  `.trim()
}
