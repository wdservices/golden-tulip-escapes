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

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: node scripts/updateBookingAmount.mjs <branchId> <bookingId>')
  process.exit(1)
}

const branchId = args[0]
const bookingId = args[1]

const toDate = (v) => {
  if (!v) return null
  if (v.toDate) return v.toDate()
  return null
}

const matchType = (type, candidates) => {
  if (!type) return null
  const t = String(type).toLowerCase()
  const variations = [
    t,
    t.replace(/\s+/g, '-'),
    t.replace(/\s+/g, ''),
    t.split(' ')[0]
  ]
  for (const v of variations) {
    if (candidates.has(v)) return v
  }
  return null
}

const run = async () => {
  const bookingRef = db.doc(`branches/${branchId}/bookings/${bookingId}`)
  const bookingSnap = await bookingRef.get()
  if (!bookingSnap.exists) {
    console.error('Booking not found:', bookingRef.path)
    process.exit(1)
  }
  const booking = bookingSnap.data()

  const roomsSnap = await db.collection(`branches/${branchId}/rooms`).get()
  const priceMap = new Map()
  roomsSnap.forEach(doc => {
    const d = doc.data()
    if (d?.type && d?.pricePerNight != null) {
      const price = Number(d.pricePerNight)
      if (Number.isFinite(price)) {
        const key = String(d.type).toLowerCase()
        const existing = priceMap.get(key)
        if (existing == null || price > existing) {
          priceMap.set(key, price)
        }
      }
    }
  })

  const matchedKey = matchType(booking.roomType, priceMap)
  let roomPrice = 0
  if (matchedKey) {
    roomPrice = priceMap.get(matchedKey) || 0
  } else {
    const paymentsSnap = await db.collection(`branches/${branchId}/bookings/${bookingId}/payments`).get()
    let fallbackAmount = 0
    paymentsSnap.forEach(doc => {
      const d = doc.data()
      const amt = Number(d?.amount || 0)
      if (amt > fallbackAmount) fallbackAmount = amt
    })
    if (fallbackAmount <= 0) {
      console.error('Could not resolve room price for type:', booking.roomType)
      process.exit(2)
    }
    roomPrice = fallbackAmount
  }

  const ci = toDate(booking.checkInDate)
  const co = toDate(booking.checkOutDate)
  const nights = ci && co ? Math.max(1, Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24))) : 1
  const totalAmount = roomPrice * nights

  await bookingRef.update({
    roomPrice,
    nights,
    totalAmount,
    paymentStatus: 'paid',
    updatedAt: admin.firestore.Timestamp.fromDate(new Date())
  })

  const updatedSnap = await bookingRef.get()
  console.log(JSON.stringify({
    path: bookingRef.path,
    updated: {
      roomPrice,
      nights,
      totalAmount,
      paymentStatus: updatedSnap.data().paymentStatus
    }
  }, null, 2))
}

run().catch(e => {
  console.error('ERROR', e && e.message ? e.message : e)
  process.exit(1)
})
