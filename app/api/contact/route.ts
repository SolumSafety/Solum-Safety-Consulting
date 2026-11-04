import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { escapeHtml, sendOwnerNotification } from '@/lib/notifications'

export const runtime = 'nodejs'

type ContactPayload = {
  name?: unknown
  company?: unknown
  email?: unknown
  service?: unknown
  message?: unknown
  organisation?: unknown
  type?: unknown
}

function field(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  let data: ContactPayload
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid payload')
    data = body
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const isWaitlist = data.type === 'waitlist'
  const name = field(data.name)
  const email = field(data.email)
  const message = field(data.message)
  const organisation = field(data.organisation)
  const company = field(data.company)
  const service = field(data.service)

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (name.length > 200 || email.length > 254 || company.length > 300 || organisation.length > 300 || service.length > 300 || message.length > 10000) {
    return NextResponse.json({ error: 'Your message is too long. Please shorten it and try again.' }, { status: 400 })
  }

  const html = isWaitlist
    ? `<h2>Wait list member</h2>
       <p><strong>Name:</strong> ${escapeHtml(name)}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p><strong>Organisation:</strong> ${escapeHtml(organisation)}</p>
       <p>This person has joined the SolumPM platform wait list.</p>`
    : `<h2>New enquiry from the website</h2>
       <p><strong>Name:</strong> ${escapeHtml(name)}</p>
       <p><strong>Company:</strong> ${escapeHtml(company || '—')}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p><strong>Service:</strong> ${escapeHtml(service || '—')}</p>
       <p><strong>Message:</strong></p>
       <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`
  const text = isWaitlist
    ? `New SolumPM wait list member\nName: ${name}\nEmail: ${email}\nOrganisation: ${organisation}`
    : `New website enquiry\nName: ${name}\nCompany: ${company || '—'}\nEmail: ${email}\nService: ${service || '—'}\n\n${message}`

  try {
    const notificationId = await sendOwnerNotification({
      subject: isWaitlist ? `Wait list member — ${name}` : `New enquiry from ${name}`,
      replyTo: email,
      html,
      text,
      idempotencyKey: `contact/${randomUUID()}`,
    })
    return NextResponse.json({ ok: true, delivered: true, notificationId })
  } catch (error) {
    console.error('[contact] Notification failed:', error instanceof Error ? error.message : 'Unknown email error')
    return NextResponse.json(
      { error: 'Could not send your message. Please try again or email solumsafetyconsulting@gmail.com.' },
      { status: 502 },
    )
  }
}
