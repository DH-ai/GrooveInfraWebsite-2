import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await req.json()
    const { name, email, phone, company, projectType, location, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'Groove Infra Website <noreply@grooveinfra.in>',
      to: process.env.CONTACT_EMAIL ?? 'hello@grooveinfra.in',
      replyTo: email,
      subject: `New Enquiry: ${projectType || 'General'} — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #C9A84C; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: #000; font-size: 20px; font-weight: 700; letter-spacing: 0.05em;">
              GROOVE INFRA
            </h1>
            <p style="margin: 4px 0 0; color: #000; font-size: 12px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.1em;">
              New Website Enquiry
            </p>
          </div>

          <div style="border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; width: 130px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #C9A84C;">${email}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${phone}</td>
              </tr>` : ''}
              ${company ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Company</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${company}</td>
              </tr>` : ''}
              ${projectType ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Project Type</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${projectType}</td>
              </tr>` : ''}
              ${location ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Location</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${location}</td>
              </tr>` : ''}
            </table>

            <div style="margin-top: 24px;">
              <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Message</p>
              <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.7; color: #333; white-space: pre-wrap;">${message}</div>
            </div>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #aaa;">
              Sent from grooveinfra.in — reply directly to this email to respond to ${name}.
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact/route] send error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
