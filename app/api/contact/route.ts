import { NextResponse } from 'next/server'
import { sendEnquiryEmails } from '@/lib/email/send-enquiry'
import type { EnquiryDetails } from '@/lib/email/templates'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, company, projectType, location, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const enquiry: EnquiryDetails = {
      name: String(name),
      email: String(email),
      phone: phone ? String(phone) : undefined,
      company: company ? String(company) : undefined,
      projectType: projectType ? String(projectType) : undefined,
      location: location ? String(location) : undefined,
      message: String(message),
    }

    const result = await sendEnquiryEmails(enquiry)

    if (!result.ok) {
      console.error('[contact/route] send error:', result.message)
      return NextResponse.json({ error: result.message }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact/route] unexpected error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
