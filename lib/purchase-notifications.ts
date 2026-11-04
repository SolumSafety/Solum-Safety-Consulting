import "server-only"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { escapeHtml, sendOwnerNotification } from "@/lib/notifications"

const SENT_MARKER = "solum_owner_notification_id"

export async function notifyPaidPurchase(checkout: Stripe.Checkout.Session): Promise<void> {
  // Never notify on an abandoned/unpaid checkout or on sandbox tests.
  if (!checkout.livemode || checkout.mode !== "payment") return
  if (checkout.payment_status !== "paid") return

  const session = await stripe.checkout.sessions.retrieve(checkout.id)
  if (session.metadata?.[SENT_MARKER]) return
  if (session.payment_status !== "paid") return

  const items: Stripe.LineItem[] = []
  for await (const item of stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })) {
    items.push(item)
  }
  const currency = (session.currency ?? "aud").toUpperCase()
  const amount = new Intl.NumberFormat("en-AU", { style: "currency", currency }).format((session.amount_total ?? 0) / 100)
  const email = session.customer_details?.email ?? session.customer_email ?? "Not supplied"
  const name = session.customer_details?.name ?? "Not supplied"
  const phone = session.customer_details?.phone ?? "Not supplied"
  const purchaseDate = new Date(session.created * 1000).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })
  const itemText = items.map((item) => `${item.description ?? "Purchased item"} × ${item.quantity ?? 1}`).join("\n")
  const itemHtml = items.map((item) => `<li>${escapeHtml(item.description ?? "Purchased item")} × ${item.quantity ?? 1}</li>`).join("")
  const id = await sendOwnerNotification({
    subject: `New website purchase — ${amount} ${currency}`,
    ...(email !== "Not supplied" ? { replyTo: email } : {}),
    text: `A customer purchase is confirmed.\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nTotal: ${amount} ${currency}\nCheckout: ${session.id}\nDate (Sydney): ${purchaseDate}\n\nItems:\n${itemText || "No line item descriptions supplied"}`,
    html: `<h2>New confirmed purchase</h2>
      <p><strong>Customer:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Total:</strong> ${escapeHtml(amount)} ${escapeHtml(currency)}</p>
      <p><strong>Date (Sydney):</strong> ${escapeHtml(purchaseDate)}</p>
      <p><strong>Checkout reference:</strong> ${escapeHtml(session.id)}</p>
      <h3>Purchased items</h3><ul>${itemHtml || "<li>No line item descriptions supplied</li>"}</ul>`,
    idempotencyKey: `purchase-owner/${session.id}`,
  })
  // Durable marker survives deployments and Resend's 24-hour dedupe window.
  // Merge only this key: all product/entitlement metadata remains untouched.
  await stripe.checkout.sessions.update(session.id, { metadata: { [SENT_MARKER]: id } })
}
