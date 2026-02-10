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

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/checkBookingsByEmail.mjs <email>')
  process.exit(1)
}

const run = async () => {
  const rootSnap = await db.collection('bookings').where('email', '==', email).get()
  const root = rootSnap.docs.map(d => ({ id: d.id, ...d.data(), _path: d.ref.path }))

  const branchesSnap = await db.collection('branches').get()
  const cg = []
  for (const b of branchesSnap.docs) {
    const bs = await db.collection('branches').doc(b.id).collection('bookings').where('guestEmail', '==', email).get()
    bs.forEach(d => cg.push({ id: d.id, ...d.data(), _path: d.ref.path }))
  }

  const all = [...root, ...cg]
  const seen = new Set()
  const deduped = all.filter(b => {
    const k = `${b.id}:${b.branchId || ''}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  console.log(JSON.stringify({
    email,
    counts: { root: root.length, branches: cg.length, deduped: deduped.length },
    samples: deduped.slice(0, 3)
  }, null, 2))
}

run().catch(e => {
  console.error('ERROR', e && e.message ? e.message : e)
  process.exit(1)
})
