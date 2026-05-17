import { escapeHtml } from './escape'
import { avatarImgHtml } from './avatar'

const GOLD = '#C9A84C'
const GOLD_DARK = '#A8873A'
const SURFACE = '#111111'
const BORDER = '#2a2a2a'
const TEXT = '#f5f5f5'
const MUTED = '#a3a3a3'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grooveinfra.in'

function emailFooter(): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin-top:20px;">
      <tr>
        <td style="padding:0 8px;text-align:center;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:${MUTED};">
          <p style="margin:0 0 8px;">Crafted with precision in Delhi, India.</p>
          <p style="margin:0 0 8px;">
            <a href="mailto:contactus@grooveinfra.in" style="color:${GOLD};text-decoration:none;">contactus@grooveinfra.in</a>
            &nbsp;&middot;&nbsp;
            <a href="tel:+918800385198" style="color:${GOLD};text-decoration:none;">+91 88003 85198</a>
          </p>
          <p style="margin:0;">
            <a href="${SITE_URL}" style="color:${MUTED};text-decoration:underline;">grooveinfra.in</a>
          </p>
        </td>
      </tr>
    </table>
  `
}

function emailShell(bodyRows: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#1a1a1a;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:${SURFACE};border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
        ${bodyRows}
      </table>
      ${emailFooter()}
    </td></tr>
  </table>
</body>
</html>`
}

function emailHeader(subtitle: string): string {
  return `<tr>
    <td style="background:linear-gradient(135deg,${GOLD} 0%,${GOLD_DARK} 100%);padding:28px 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0"><tr>
        <td style="width:36px;height:36px;background:#000;border-radius:4px;text-align:center;font-family:Arial,sans-serif;font-weight:700;font-size:16px;color:${GOLD};">G</td>
      </tr></table>
      <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(0,0,0,0.65);">${escapeHtml(subtitle)}</p>
      <h1 style="margin:4px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#000;">Groove Infra</h1>
    </td>
  </tr>`
}

export interface EnquiryDetails {
  name: string
  email: string
  phone?: string
  company?: string
  projectType?: string
  location?: string
  message: string
}

function detailRow(label: string, value: string, isEmail = false): string {
  const cell = isEmail
    ? `<a href="mailto:${escapeHtml(value)}" style="color:${GOLD};text-decoration:none;">${escapeHtml(value)}</a>`
    : escapeHtml(value)
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid ${BORDER};width:120px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:12px 0;border-bottom:1px solid ${BORDER};font-family:Arial,sans-serif;font-size:14px;color:${TEXT};vertical-align:top;">${cell}</td>
  </tr>`
}

export function teamEnquiryEmail(data: EnquiryDetails): string {
  const rows = [
    detailRow('Name', data.name),
    detailRow('Email', data.email, true),
    data.phone ? detailRow('Phone', data.phone) : '',
    data.company ? detailRow('Company', data.company) : '',
    data.projectType ? detailRow('Project', data.projectType) : '',
    data.location ? detailRow('Location', data.location) : '',
  ].join('')

  return emailShell(`${emailHeader('New website enquiry')}
  <tr><td style="padding:32px;">
    <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:14px;color:${MUTED};">
      A new enquiry was submitted on grooveinfra.in. Reply to this thread to reach the client.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
    <p style="margin:24px 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Message</p>
    <div style="background:#1a1a1a;border:1px solid ${BORDER};border-radius:12px;padding:16px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:${TEXT};white-space:pre-wrap;">${escapeHtml(data.message)}</div>
  </td></tr>`)
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'there'
}

export function userConfirmationEmail(data: EnquiryDetails): string {
  const name = escapeHtml(firstName(data.name))
  const projectLine = data.projectType
    ? `<p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;color:${MUTED};">
        We&apos;ve noted your interest in <strong style="color:${TEXT};">${escapeHtml(data.projectType)}</strong> projects.
      </p>`
    : ''

  return emailShell(`${emailHeader('We received your enquiry')}
  <tr><td style="padding:32px;">
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:24px;"><tr>
      <td style="padding-right:20px;vertical-align:middle;">${avatarImgHtml(data.email, data.name)}</td>
      <td style="vertical-align:middle;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};">Thank you</p>
        <h2 style="margin:4px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:600;color:${TEXT};">Hi ${name},</h2>
      </td>
    </tr></table>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:${TEXT};">
      Thank you for reaching out to <strong style="color:${GOLD};">Groove Infra</strong>.
      We&apos;ve received your message and a member of our team will get back to you
      <strong>within 24 business hours</strong>.
    </p>
    ${projectLine}
    <div style="background:#1a1a1a;border-left:3px solid ${GOLD};border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Your message</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:${TEXT};white-space:pre-wrap;">${escapeHtml(data.message)}</p>
    </div>
    <p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:${MUTED};">
      If your request is urgent, call us at
      <a href="tel:+918800385198" style="color:${GOLD};text-decoration:none;">+91 88003 85198</a>
      or email
      <a href="mailto:contactus@grooveinfra.in" style="color:${GOLD};text-decoration:none;">contactus@grooveinfra.in</a>.
    </p>
  </td></tr>`)
}
