import { doc, getDoc, getDocs, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const COLLECTION = 'bookingAvailability';

export async function getBookingAvailability(branchId) {
  try {
    const ref = doc(db, COLLECTION, branchId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { branchId, bookingEnabled: true, disabledUntil: null, reason: null };
    }
    const data = snap.data();
    const disabledUntil = data.disabledUntil instanceof Timestamp
      ? data.disabledUntil.toDate()
      : data.disabledUntil
      ? new Date(data.disabledUntil)
      : null;

    // Auto-enable if expired
    if (!data.bookingEnabled && disabledUntil && disabledUntil.getTime() <= Date.now()) {
      return { branchId, bookingEnabled: true, disabledUntil: null, reason: null };
    }

    return {
      branchId,
      bookingEnabled: data.bookingEnabled !== false,
      disabledUntil,
      reason: data.reason || null,
    };
  } catch (e) {
    console.warn('Failed to fetch booking availability', e);
    return { branchId, bookingEnabled: true, disabledUntil: null, reason: null };
  }
}

export async function getAllBookingAvailability() {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const now = Date.now();
    return snap.docs.map((d) => {
      const data = d.data();
      const disabledUntil = data.disabledUntil instanceof Timestamp
        ? data.disabledUntil.toDate()
        : data.disabledUntil
        ? new Date(data.disabledUntil)
        : null;

      if (!data.bookingEnabled && disabledUntil && disabledUntil.getTime() <= now) {
        return { branchId: d.id, bookingEnabled: true, disabledUntil: null, reason: null };
      }

      return {
        branchId: d.id,
        bookingEnabled: data.bookingEnabled !== false,
        disabledUntil,
        reason: data.reason || null,
      };
    });
  } catch (e) {
    console.warn('Failed to fetch booking availability', e);
    return [];
  }
}
