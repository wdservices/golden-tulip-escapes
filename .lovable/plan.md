# Booking Availability Management — Implementation Plan

Add a per-branch "Booking Availability" system so admins can temporarily disable online bookings for a specific branch, with automatic re-enable at a scheduled time. Uses the existing Firestore backend (no new API server needed — Firestore rules replace REST endpoints).

## 1. Data model (Firestore)

New collection: `bookingAvailability/{branchId}` (doc id = branchId, one doc per branch).

```
{
  branchId: string,
  bookingEnabled: boolean,        // default true
  disabledUntil: Timestamp|null,  // UTC
  reason: string|null,
  disabledBy: string|null,        // admin uid
  disabledByName: string|null,
  updatedAt: Timestamp,
  createdAt: Timestamp
}
```

Sibling audit log: `bookingAvailability/{branchId}/logs/{autoId}` with `action` (`disabled|enabled|auto-enabled`), `actor`, `reason`, `disabledUntil`, `timestamp`.

### Firestore rules (add to `firestore.rules`)
- `bookingAvailability/*`: `read: if true` (public), `write: if isAdmin()` — reuse existing admin helper.
- Reject new `bookings` doc creation for a branch whose availability doc has `bookingEnabled == false` AND `disabledUntil > request.time` — enforced in rules so clients can't bypass.

## 2. New files

- `src/hooks/useBookingAvailability.ts` — subscribes to `bookingAvailability/{branchId}`; exposes `{ isEnabled, disabledUntil, reason, loading, refresh }`. Includes lazy auto-enable: if `!bookingEnabled && now >= disabledUntil`, writes the record back to enabled and logs `auto-enabled`.
- `src/services/bookingAvailabilityService.ts` — `getAll()`, `getForBranch(id)`, `disable(branchId, {until, reason, admin})`, `enable(branchId, admin)`, `runAutoEnableSweep()` (called on admin dashboard + public booking page mount).
- `src/components/admin/BookingAvailabilityModal.tsx` — main modal listing all branches with status chip + Disable/Enable action per row.
- `src/components/admin/DisableBookingModal.tsx` — form with branch (preselected), date+time picker, reason textarea, validation (no past dates, required until when disabling).
- `src/components/booking/BookingDisabledNotice.tsx` — the public-facing warning card (icon, formatted local-time reopen, contact reception CTA).

## 3. Modified files

- `src/pages/admin/BookingsPage.tsx` — add **Booking Availability** button beside Export Data / Create Booking (same gold/blue theme), wired to open the modal.
- `src/components/BookingForm.tsx` (and `ModernBookingForm.tsx` / `NewBookingForm.tsx` — the ones actually mounted on public routes) — after branch selection, call `useBookingAvailability(branchId)`; if disabled, render `<BookingDisabledNotice />` and disable room select, guest fields, payment, submit. Auto-enable sweep runs on mount.
- `src/hooks/useBookings.ts` (booking creation path — locate the create call in `BookingForm` submit) — add server-side guard: re-check availability doc immediately before write; throw if disabled.
- `firestore.rules` — add the availability collection + booking-create guard described above.

## 4. Auto re-enable strategy

No backend cron required. Two triggers cover it:
1. **Public booking page load** → `runAutoEnableSweep()` reads all availability docs and flips any expired ones.
2. **Admin dashboard load** → same sweep.
3. **Per-branch read** in `useBookingAvailability` also self-heals its single doc.

All timestamps stored UTC; displayed via existing `dateUtils` in local time.

## 5. UX details

- Status chip: green "Online Booking Enabled" / red "Booking Disabled".
- Disabled card shows: Disabled Until (local time), Reason, [Enable Now] button.
- Public notice is friendly, shows reopen date/time, and directs to reception contact.
- Toast confirmations on enable/disable; activity logged.

## 6. Out of scope

- Room-level (vs branch-level) availability.
- Email/SMS notifications to would-be guests.
- Recurring/scheduled future disables (only single "until" window).

Shall I proceed with implementation?
