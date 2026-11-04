import "server-only"
import { Resend } from "resend"

export const OWNER_NOTIFICATION_EMAIL = "solumsafetyconsulting@gmail.com"

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function getNotificationRecipients(): string[] {
  // The requested owner address must not be lost to an older environment override.
  const configured = process.env.CONTACT_TO_EMAIL?.split(/[,;]/).map((email) => email.trim()).filter(Boolean) ?? []
  return [...new Set([OWNER_NOTIFICATION_EMAIL, ...configured])]
}

export function getNotificationSender(): string {
  const configured = process.env.CONTACT_FROM_EMAIL?.trim()
  // Gmail cannot be used as a Resend sender. Preserve the existing owner-only
  // resend.dev fallback until a verified sending-domain address is configured.
  if (!configured || /@(gmail|outlook|hotmail|yahoo|icloud)\.com>?\s*$/i.test(configured)) {
    return "Solum Safety Consulting <onboarding@resend.dev>"
  }
  return configured
}

export async function sendOwnerNotification(options: {
  subject: string
  html: string
  text: string
  replyTo?: string
  idempotencyKey?: string
}): Promise<string> {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) throw new Error("RESEND_API_KEY is not configured")

  const resend = new Resend(key)
  const recipients = getNotificationRecipients()
  const from = getNotificationSender()
  // The resend.dev test sender can only deliver to the account owner's mailbox.
  // Do not let an older optional recipient prevent the owner's notification.
  const to = from.includes("@resend.dev") ? [OWNER_NOTIFICATION_EMAIL] : recipients
  const { data, error } = await resend.emails.send(
    {
      from,
      to,
      subject: options.subject.replace(/[\r\n]/g, " "),
      html: options.html,
      text: options.text,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    },
    options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined,
  )
  if (error || !data?.id) {
    throw new Error(error?.message ?? "Email provider did not accept the notification")
  }
  return data.id
}
