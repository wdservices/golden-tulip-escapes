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
const dayStr = `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,'0')}-${String(base.getDate()).padStart(2,'0')}`

const toISO = v => {
  if (!v) return null
  if (v.toDate) return v.toDate().toISOString()
  if (v instanceof Date) return v.toISOString()
  return null
}

const normalize = doc => {
  const data = doc.data() || {}
  const pathSegments = doc.ref.path.split('/')
  const isRoot = pathSegments.length === 2 && pathSegments[0] === 'bookings'
  const branchId = data.branchId || (doc.ref.parent.parent ? doc.ref.parent.parent.id : null)
  return {
    id: doc.id,
    path: doc.ref.path,
    isRoot,
    branchId,
    roomType: data.roomType || null,
    status: data.status || null,
    guestName: data.guestName || data.guest || data.fullName || null,
    guestEmail: data.guestEmail || data.email || null,
    guestPhone: data.guestPhone || data.phone || null,
    createdAt: toISO(data.createdAt) || toISO(data.bookingDate),
    checkInDate: toISO(data.checkInDate) || (data.checkIn || null),
    paymentStatus: data.paymentStatus || null,
  }
}

const run = async () => {
  const results = new Map()

  const filterByRange = docs => {
    return docs.filter(doc => {
      const d = doc.data() || {}
      const ca = d.createdAt?.toDate?.() || null
      const bd = d.bookingDate?.toDate?.() || null
      const x = ca || bd
      if (!x) return false
      return x >= start && x <= end
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

  const q1 = runQ(
    () => db.collectionGroup('bookings')
      .where('createdAt', '>=', startTs)
      .where('createdAt', '<=', endTs)
      .get(),
    () => db.collectionGroup('bookings').get()
  )

  const q2 = runQ(
    () => db.collectionGroup('bookings')
      .where('bookingDate', '>=', startTs)
      .where('bookingDate', '<=', endTs)
      .get(),
    () => db.collectionGroup('bookings').get()
  )

  const q3 = runQ(
    () => db.collection('bookings')
      .where('createdAt', '>=', startTs)
      .where('createdAt', '<=', endTs)
      .get(),
    () => db.collection('bookings').get()
  )

  const q4 = runQ(
    () => db.collection('bookings')
      .where('bookingDate', '>=', startTs)
      .where('bookingDate', '<=', endTs)
      .get(),
    () => db.collection('bookings').get()
  )
  const q5 = runQ(
    () => db.collectionGroup('bookings')
      .where('checkIn', '==', dayStr)
      .get(),
    () => db.collectionGroup('bookings').get()
  )
  const q6 = runQ(
    () => db.collection('bookings')
      .where('checkIn', '==', dayStr)
      .get(),
    () => db.collection('bookings').get()
  )

  const [r1, r2, r3, r4, r5, r6] = await Promise.all([q1, q2, q3, q4, q5, q6])

  ;[r1, r2, r3, r4, r5, r6].forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      const data = doc.data() || {}
      if (data.checkIn && data.checkIn !== dayStr) return
      results.set(doc.ref.path, normalize(doc))
    })
  })

  const list = Array.from(results.values())
  list.sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dbt = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dbt - da
  })

  console.log(JSON.stringify({
    date: start.toISOString().slice(0, 10),
    count: list.length,
    bookings: list
  }, null, 2))
}

run().catch(e => {
  console.error('ERROR', e && e.message ? e.message : e)
  process.exit(1)
})
