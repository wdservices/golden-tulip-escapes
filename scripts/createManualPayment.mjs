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
  console.error('Usage: node scripts/createManualPayment.mjs <branchId> <bookingId> [method=cash|bank_transfer|credit_card]')
  process.exit(1)
}

const branchId = args[0]
const bookingId = args[1]
const inputMethod = args[2] || 'bank_transfer'

const toDate = (v) => {
  if (!v) return null
  if (v.toDate) return v.toDate()
  return null
}

const resolveAmount = (booking) => {
  const ci = toDate(booking.checkInDate)
  const co = toDate(booking.checkOutDate)
  const nights = ci && co ? Math.max(1, Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24))) : 1
  const roomPrice = Number(booking.roomPrice || 0)
  const totalAmount = Number(booking.totalAmount || 0)
  if (totalAmount > 0) return totalAmount
  if (roomPrice > 0) return roomPrice * nights
  return 0
}

const run = async () => {
  const bookingRef = db.doc(`branches/${branchId}/bookings/${bookingId}`)
  const bookingSnap = await bookingRef.get()
  if (!bookingSnap.exists) {
    console.error('Booking not found:', bookingRef.path)
    process.exit(1)
  }
  const booking = bookingSnap.data()
  const amount = resolveAmount(booking)
  if (amount <= 0) {
    console.error('Could not resolve amount for payment')
    process.exit(2)
  }

  const paymentRef = db.collection(`branches/${branchId}/bookings/${bookingId}/payments`).doc()
  const payload = {
    amount,
    currency: 'NGN',
    status: 'successful',
    paymentMethod: inputMethod,
    method: inputMethod,
    channel: 'manual',
    transactionId: `manual-${Date.now()}`,
    createdAt: admin.firestore.Timestamp.now(),
    paidAt: admin.firestore.Timestamp.now(),
    branchId,
    bookingId,
    guestName: booking.guestName || '',
    customerEmail: booking.guestEmail || '',
    gatewayResponse: 'Manual entry'
  }
  await paymentRef.set(payload)

  const saved = await paymentRef.get()
  console.log(JSON.stringify({
    path: paymentRef.path,
    payment: saved.data()
  }, null, 2))
}

run().catch(e => {
  console.error('ERROR', e && e.message ? e.message : e)
  process.exit(1)
})
