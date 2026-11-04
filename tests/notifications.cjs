const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
let assertions = 0

function load(relative, mocks = {}, env = {}) {
  const exports = {}
  const module = { exports }
  const source = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(source, {
    exports, module, process: { env }, console: { log() {}, error() {}, warn() {} },
    require(name) {
      if (name === 'server-only') return {}
      if (Object.hasOwn(mocks, name)) return mocks[name]
      if (name === 'node:crypto') return require(name)
      throw new Error(`Unexpected dependency: ${name}`)
    },
  }, { filename: relative })
  return module.exports
}
function check(value, expected) { assert.equal(value, expected); assertions++ }
const next = { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } }
const sample = {
  id: 'cs_live_offline_test', mode: 'payment', livemode: true, payment_status: 'paid',
  metadata: { productCode: 'WHSGA-T2' }, amount_total: 132000, currency: 'aud', created: 1700000000,
  customer_details: { email: 'buyer@example.test', name: '<Buyer>', phone: null },
}

async function main() {
  const sent = []
  const env = { RESEND_API_KEY: 'offline-only', CONTACT_FROM_EMAIL: 'solumsafetyconsulting@gmail.com', CONTACT_TO_EMAIL: 'info@solumsafetyconsulting.com.au' }
  const notifications = load('lib/notifications.ts', {
    resend: { Resend: class { constructor() { this.emails = { send: async (message, options) => { sent.push({ message, options }); return { data: { id: 'email_offline' }, error: null } } } } } },
  }, env)
  check(notifications.escapeHtml('<script>"\''), '&lt;script&gt;&quot;&#39;')
  await notifications.sendOwnerNotification({ subject: 'Internal\nnotification', html: '<p>test</p>', text: 'test', idempotencyKey: 'offline-key' })
  check(sent[0].message.to[0], 'solumsafetyconsulting@gmail.com')
  check(sent[0].message.to.length, 1)
  check(sent[0].message.subject, 'Internal notification')
  check(sent[0].options.idempotencyKey, 'offline-key')
  delete env.RESEND_API_KEY
  await assert.rejects(() => notifications.sendOwnerNotification({ subject: 'test', html: '', text: '' }), /not configured/); assertions++
  check(sent.length, 1)

  let providerFailure = false
  let contactMessage
  const contact = load('app/api/contact/route.ts', {
    'next/server': next,
    '@/lib/notifications': { escapeHtml: notifications.escapeHtml, sendOwnerNotification: async (message) => {
      contactMessage = message
      if (providerFailure) throw new Error('Provider rejected send')
      return 'contact_offline'
    } },
  })
  const contactRequest = (body) => ({ json: async () => body })
  check((await contact.POST(contactRequest(null))).status, 400)
  check((await contact.POST(contactRequest({ name: 123 }))).status, 400)
  check((await contact.POST(contactRequest({ name: 'Client', email: 'invalid', message: 'test' }))).status, 400)
  const payload = { name: '<Client>', email: 'buyer@example.test', message: '<script>unsafe</script>\nhello' }
  let response = await contact.POST(contactRequest(payload))
  check(response.status, 200)
  check(response.body.notificationId, 'contact_offline')
  check(contactMessage.html.includes('&lt;script&gt;'), true)
  check(contactMessage.replyTo, 'buyer@example.test')
  providerFailure = true
  response = await contact.POST(contactRequest(payload))
  check(response.status, 502)
  check(response.body.ok, undefined)
  providerFailure = false
  check((await contact.POST(contactRequest({ type: 'waitlist', name: 'Client', email: 'buyer@example.test', organisation: 'Business' }))).status, 200)

  let mailCount = 0
  let updateCount = 0
  let current = structuredClone(sample)
  let mailError = false
  let updateError = false
  let purchaseMessage
  const stripe = { checkout: { sessions: {
    retrieve: async () => current,
    listLineItems: () => ({ async *[Symbol.asyncIterator]() { yield { description: '<Desktop WHS>', quantity: 1 } } }),
    update: async (id, { metadata }) => { updateCount++; if (updateError) throw new Error('marker failed'); Object.assign(current.metadata, metadata); return current },
  } } }
  const purchase = load('lib/purchase-notifications.ts', {
    '@/lib/stripe': { stripe },
    '@/lib/notifications': { escapeHtml: notifications.escapeHtml, sendOwnerNotification: async (message) => {
      if (mailError) throw new Error('Email failed')
      mailCount++; purchaseMessage = message; return 'purchase_offline'
    } },
  })
  await purchase.notifyPaidPurchase({ ...sample, livemode: false })
  await purchase.notifyPaidPurchase({ ...sample, payment_status: 'unpaid' })
  check(mailCount, 0)
  await purchase.notifyPaidPurchase(sample)
  check(mailCount, 1)
  check(updateCount, 1)
  check(current.metadata.productCode, 'WHSGA-T2')
  check(current.metadata.solum_owner_notification_id, 'purchase_offline')
  check(purchaseMessage.html.includes('&lt;Desktop WHS&gt;'), true)
  check(purchaseMessage.text.includes('1,320.00'), true)
  check(purchaseMessage.idempotencyKey, 'purchase-owner/cs_live_offline_test')
  await purchase.notifyPaidPurchase(sample)
  check(mailCount, 1)
  current = structuredClone(sample); mailError = true
  await assert.rejects(() => purchase.notifyPaidPurchase(sample), /Email failed/); assertions++
  check(current.metadata.solum_owner_notification_id, undefined)
  mailError = false; updateError = true
  await assert.rejects(() => purchase.notifyPaidPurchase(sample), /marker failed/); assertions++
  check(current.metadata.solum_owner_notification_id, undefined)
  updateError = false
  current = { ...structuredClone(sample), payment_status: 'no_payment_required', amount_total: 0 }
  await purchase.notifyPaidPurchase(current)
  check(current.metadata.solum_owner_notification_id, undefined)

  let event = { type: 'checkout.session.completed', data: { object: sample } }
  let invalidSignature = false
  let failedNotification = false
  let webhookNotifications = 0
  const webhook = load('app/api/stripe/webhook/route.ts', {
    'next/server': next,
    'next/headers': { headers: async () => ({ get: () => 'offline-signature' }) },
    stripe: function Stripe() {},
    '@/lib/stripe': { stripe: { webhooks: { constructEvent: () => { if (invalidSignature) throw new Error('Invalid signature'); return event } } } },
    '@/lib/supabase-admin': { getSupabaseAdmin: () => null },
    '@/lib/checkout': { decodeCodesFromMetadata: () => [] },
    '@/lib/solly-entitlement': { SOLLY_PACKAGE_SKU: 'PACKAGE' },
    '@/lib/purchase-notifications': { notifyPaidPurchase: async () => { webhookNotifications++; if (failedNotification) throw new Error('Email failed') } },
  }, { STRIPE_WEBHOOK_SECRET: 'offline-only' })
  const request = { text: async () => '{}' }
  check((await webhook.POST(request)).status, 200)
  event.type = 'checkout.session.async_payment_succeeded'
  check((await webhook.POST(request)).status, 200)
  check(webhookNotifications, 2)
  failedNotification = true
  check((await webhook.POST(request)).status, 500)
  invalidSignature = true
  check((await webhook.POST(request)).status, 400)

  // Exercise the real fulfilment helpers: notification failure -> refund -> retry.
  const records = { solly_entitlements: [], form_purchases: [], form_sessions: [], solly_conversations: [], solly_credit_purchases: [] }
  let unlockUpdates = 0
  const supabase = { from(table) {
    let mode = 'select', values, conflict, ignored = false, inserted = false
    const filters = []
    const query = {
      upsert(row, options) { mode = 'upsert'; values = row; conflict = options.onConflict; ignored = !!options.ignoreDuplicates; return query },
      update(row) { mode = 'update'; values = row; return query },
      select() { return query },
      eq(key, value) { filters.push([key, value]); return query },
      async maybeSingle() { return execute() },
      then(resolve, reject) { return Promise.resolve(execute()).then(resolve, reject) },
    }
    function execute() {
      const list = records[table]
      if (mode === 'upsert') {
        const found = list.find((row) => row[conflict] === values[conflict])
        if (found) {
          if (!ignored) Object.assign(found, values)
          return { data: ignored ? null : found, error: null }
        }
        const row = { id: `row_${list.length}`, ...values }; list.push(row); inserted = true
        return { data: row, error: null }
      }
      const matches = list.filter((row) => filters.every(([key, value]) => row[key] === value))
      if (mode === 'update') {
        for (const row of matches) Object.assign(row, values)
        if (table === 'form_sessions') unlockUpdates++
      }
      return { data: matches[0] ?? null, error: null }
    }
    return query
  } }
  const paid = { ...structuredClone(sample), payment_intent: 'pi_offline', metadata: { productCode: 'PACKAGE', conversationId: 'conv_offline', codes: 'DOC' } }
  let replayEvent = { type: 'checkout.session.completed', data: { object: paid } }
  let replayEmailError = true
  const replay = load('app/api/stripe/webhook/route.ts', {
    'next/server': next,
    'next/headers': { headers: async () => ({ get: () => 'offline-signature' }) },
    stripe: function Stripe() {},
    '@/lib/stripe': { stripe: { webhooks: { constructEvent: () => replayEvent }, checkout: { sessions: { list: async () => ({ data: [paid] }) } } } },
    '@/lib/supabase-admin': { getSupabaseAdmin: () => supabase },
    '@/lib/checkout': { decodeCodesFromMetadata: () => ['PACKAGE'] },
    '@/lib/solly-entitlement': { SOLLY_PACKAGE_SKU: 'PACKAGE' },
    '@/lib/purchase-notifications': { notifyPaidPurchase: async () => { if (replayEmailError) throw new Error('Email failed') } },
  }, { STRIPE_WEBHOOK_SECRET: 'offline-only' })
  check((await replay.POST(request)).status, 500)
  check(records.solly_entitlements[0].status, 'paid')
  check(records.form_purchases[0].status, 'paid')
  const initialUnlockUpdates = unlockUpdates
  replayEvent = { type: 'charge.refunded', data: { object: { payment_intent: 'pi_offline' } } }
  check((await replay.POST(request)).status, 200)
  check(records.solly_entitlements[0].status, 'refunded')
  check(records.form_purchases[0].status, 'refunded')
  replayEvent = { type: 'checkout.session.completed', data: { object: paid } }; replayEmailError = false
  check((await replay.POST(request)).status, 200)
  check(records.solly_entitlements[0].status, 'refunded')
  check(records.form_purchases[0].status, 'refunded')
  check(unlockUpdates, initialUnlockUpdates)
  console.log(`PASS: ${assertions} offline notification assertions; no real emails or payments sent.`)
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
