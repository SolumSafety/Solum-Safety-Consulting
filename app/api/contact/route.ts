import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

type ContactPayload = {
  name?: string
  company?: string
  email?: string
  service?: string
  message?: string
  organisation?: string
  type?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request: Request) {
  let data: ContactPayload
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const isWaitlist = data.type === 'waitlist'
  const name = data.name?.trim()
  const email = data.email?.trim()
  const message = data.message?.trim()
  const organisation = data.organisation?.trim()

  if (isWaitlist) {
    if (!name || !email || !organisation) {
      return NextResponse.json(
        { error: 'Please provide your name, email, and organisation.' },
        { status: 400 },
      )
    }
  } else if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Please provide your name, email, and a message.' },
      { status: 400 },
    )
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL?.trim() || 'info@solumsafetyconsulting.com.au'

  // Resend requires the "from" address to be on a verified domain. Plain
  // gmail.com/outlook.com addresses are rejected, so fall back to Resend's
  // public sandbox sender if the configured value isn't a verified domain.
  const configuredFrom = process.env.CONTACT_FROM_EMAIL?.trim()
  const fromIsUnverified =
    !configuredFrom || /@(gmail|outlook|hotmail|yahoo|icloud)\.com>?\s*$/i.test(configuredFrom)
  const from = fromIsUnverified
    ? 'Solum Safety Consulting <onboarding@resend.dev>'
    : configuredFrom

  // If the API key isn't configured yet, don't fail the user — log and accept.
  if (!apiKey) {
    console.log('[v0] Form submission (email not configured):', {
      type: isWaitlist ? 'waitlist' : 'enquiry',
      name,
      email,
      company: data.company,
      organisation,
      service: data.service,
      message,
    })
    return NextResponse.json({ ok: true, delivered: false })
  }

  const resend = new Resend(apiKey)

  const html = isWaitlist
    ? `
    <h2>Wait list member</h2>
    <p><strong>Name:</strong> ${escapeHtml(name!)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Organisation:</strong> ${escapeHtml(organisation!)}</p>
    <p>This person has joined the SolumPM platform wait list.</p>
  `
    : `
    <h2>New enquiry from the website</h2>
    <p><strong>Name:</strong> ${escapeHtml(name!)}</p>
    <p><strong>Company:</strong> ${escapeHtml(data.company ?? '—')}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Service:</strong> ${escapeHtml(data.service ?? '—')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message!).replace(/\n/g, '<br/>')}</p>
  `

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: isWaitlist ? `Wait list member — ${name}` : `New enquiry from ${name}`,
    html,
  })

  if (error) {
    console.log('[v0] Resend error:', error)
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, delivered: true })
}
