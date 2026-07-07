import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface BookingAvailability {
  branchId: string;
  bookingEnabled: boolean;
  disabledUntil: Date | null;
  reason: string | null;
  disabledBy: string | null;
  disabledByName: string | null;
  updatedAt: Date | null;
  createdAt: Date | null;
}

const COLLECTION = "bookingAvailability";

const toModel = (id: string, data: any): BookingAvailability => ({
  branchId: id,
  bookingEnabled: data?.bookingEnabled !== false, // default true
  disabledUntil:
    data?.disabledUntil instanceof Timestamp
      ? data.disabledUntil.toDate()
      : data?.disabledUntil
      ? new Date(data.disabledUntil)
      : null,
  reason: data?.reason ?? null,
  disabledBy: data?.disabledBy ?? null,
  disabledByName: data?.disabledByName ?? null,
  updatedAt:
    data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  createdAt:
    data?.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
});

const logAction = async (
  branchId: string,
  action: "disabled" | "enabled" | "auto-enabled",
  actor: { uid?: string | null; name?: string | null } | null,
  extra: Record<string, any> = {}
) => {
  try {
    await addDoc(collection(db, COLLECTION, branchId, "logs"), {
      action,
      actorUid: actor?.uid ?? "system",
      actorName: actor?.name ?? "System",
      timestamp: serverTimestamp(),
      ...extra,
    });
  } catch (e) {
    console.warn("Failed to write availability log", e);
  }
};

export async function getForBranch(
  branchId: string
): Promise<BookingAvailability> {
  const ref = doc(db, COLLECTION, branchId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return toModel(branchId, { bookingEnabled: true });
  }
  return toModel(branchId, snap.data());
}

export async function getAll(): Promise<BookingAvailability[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => toModel(d.id, d.data()));
}

export async function disableBooking(
  branchId: string,
  opts: {
    disabledUntil: Date;
    reason?: string;
    actor?: { uid?: string | null; name?: string | null } | null;
  }
) {
  const ref = doc(db, COLLECTION, branchId);
  await setDoc(
    ref,
    {
      branchId,
      bookingEnabled: false,
      disabledUntil: Timestamp.fromDate(opts.disabledUntil),
      reason: opts.reason ?? null,
      disabledBy: opts.actor?.uid ?? null,
      disabledByName: opts.actor?.name ?? null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  await logAction(branchId, "disabled", opts.actor ?? null, {
    reason: opts.reason ?? null,
    disabledUntil: Timestamp.fromDate(opts.disabledUntil),
  });
}

export async function enableBooking(
  branchId: string,
  actor?: { uid?: string | null; name?: string | null } | null,
  auto = false
) {
  const ref = doc(db, COLLECTION, branchId);
  await setDoc(
    ref,
    {
      branchId,
      bookingEnabled: true,
      disabledUntil: null,
      reason: null,
      disabledBy: null,
      disabledByName: null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await logAction(branchId, auto ? "auto-enabled" : "enabled", actor ?? null);
}

/** Iterate all availability docs and auto-enable any whose disabledUntil has passed. */
export async function runAutoEnableSweep(): Promise<void> {
  try {
    const all = await getAll();
    const now = Date.now();
    await Promise.all(
      all
        .filter(
          (a) =>
            !a.bookingEnabled &&
            a.disabledUntil &&
            a.disabledUntil.getTime() <= now
        )
        .map((a) => enableBooking(a.branchId, null, true))
    );
  } catch (e) {
    console.warn("Auto-enable sweep failed", e);
  }
}
