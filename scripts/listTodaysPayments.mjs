import fs from 'fs'
import path from 'path'
import url from 'url'
import admin from 'firebase-admin'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const saPath = path.resolve(__dirname, '..', 'service-account.json')
const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'))

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
}

const db = admin.firestore()

const arg = process.argv[2]
let base = new Date()
if (arg) {
  const parsed = new Date(arg)
  if (!isNaN(parsed.getTime())) {
    base = parsed
  }
}
const start = new Date(base)
start.setHours(0, 0, 0, 0)
const end = new Date(base)
end.setHours(23, 59, 59, 999)
const startTs = admin.firestore.Timestamp.fromDate(start)
const endTs = admin.firestore.Timestamp.fromDate(end)

const toISO = v => {
  if (!v) return null
  if (v.toDate) return v.toDate().toISOString()
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'string') return v
  return null
}

const normalizePayment = (doc) => {
  const data = doc.data() || {}
  const pathStr = doc.ref.path
  const parts = pathStr.split('/')
  let branchId = null
  let bookingId = null
  if (parts[0] === 'branches') {
    branchId = parts[1]
    if (parts[2] === 'bookings') {
      bookingId = parts[3]
    }
  }
  return {
    id: doc.id,
    path: pathStr,
    branchId,
    bookingId,
    amount: data.amount || 0,
    currency: data.currency || 'NGN',
    status: data.status || data.paymentStatus || 'pending',
    method: data.paymentMethod || data.method || 'paystack',
    reference: data.paystackRef || data.transactionId || data.reference || null,
    customerEmail: data.customerEmail || data.customer?.email || null,
    customerName: data.customerName || data.customer?.customer_name || data.customer?.name || null,
    customerPhone: data.customerPhone || data.customer?.phone || null,
    createdAt: toISO(data.createdAt) || toISO(data.paidAt) || toISO(data.verificationDate),
    gatewayResponse: data.gatewayResponse || data.gateway_response || null
  }
}

const filterByRange = docs => {
  return docs.filter(doc => {
    const d = doc.data() || {}
    const ca = d.createdAt?.toDate?.() || d.paidAt?.toDate?.() || null
    if (!ca) return false
    return ca >= start && ca <= end
  })
}

const runQ = async (fn, fallbackFn) => {
  try {
    return await fn()
  } catch (e) {
    if (String(e.code) === '9' || String(e.message || '').includes('FAILED_PRECONDITION')) {
      const snap = await fallbackFn()
      const filtered = filterByRange(snap.docs)
      return { docs: filtered }
    }
    throw e
  }
}

const run = async () => {
  const results = new Map()

  const q1 = runQ(
    () => db.collectionGroup('payments')
      .where('createdAt', '>=', startTs)
      .where('createdAt', '<=', endTs)
      .get(),
    () => db.collectionGroup('payments').get()
  )

  const q2 = runQ(
    () => db.collection('payments')
      .where('createdAt', '>=', startTs)
      .where('createdAt', '<=', endTs)
      .get(),
    () => db.collection('payments').get()
  )

  const [r1, r2] = await Promise.all([q1, q2])
  ;[r1, r2].forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      results.set(doc.ref.path, normalizePayment(doc))
    })
  })

  const list = Array.from(results.values())
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

  console.log(JSON.stringify({
    date: start.toISOString().slice(0, 10),
    count: list.length,
    payments: list
  }, null, 2))
}

run().catch(e => {
  console.error('ERROR', e && e.message ? e.message : e)
  process.exit(1)
})
