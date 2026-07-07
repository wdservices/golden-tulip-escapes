import { useEffect, useState, useCallback } from "react";
import {
  BookingAvailability,
  getForBranch,
  enableBooking,
} from "@/services/bookingAvailabilityService";

/**
 * Reads booking availability for a single branch and self-heals:
 * if the record is disabled but disabledUntil has passed, it flips back to enabled.
 */
export function useBookingAvailability(branchId?: string | null) {
  const [availability, setAvailability] = useState<BookingAvailability | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => setRefreshTick((t) => t + 1), []);

  useEffect(() => {
    if (!branchId) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let av = await getForBranch(branchId);
        // Self-heal expired disables
        if (
          !av.bookingEnabled &&
          av.disabledUntil &&
          av.disabledUntil.getTime() <= Date.now()
        ) {
          try {
            await enableBooking(branchId, null, true);
            av = await getForBranch(branchId);
          } catch (e) {
            console.warn("Failed to auto-enable expired disable", e);
          }
        }
        if (!cancelled) setAvailability(av);
      } catch (e) {
        console.warn("Failed to load booking availability", e);
        if (!cancelled)
          setAvailability({
            branchId,
            bookingEnabled: true,
            disabledUntil: null,
            reason: null,
            disabledBy: null,
            disabledByName: null,
            updatedAt: null,
            createdAt: null,
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId, refreshTick]);

  const isEnabled = availability?.bookingEnabled !== false;
  return {
    availability,
    isEnabled,
    disabledUntil: availability?.disabledUntil ?? null,
    reason: availability?.reason ?? null,
    loading,
    refresh,
  };
}
