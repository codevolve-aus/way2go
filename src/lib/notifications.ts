// Team email notifications — internal alerts to the operations inbox when
// operational events happen (booking confirmed, contract sent, payment
// recorded, an upcoming return, maintenance coming due). Distinct from the
// customer-facing transactional emails in (site)/actions.ts and
// admin/bookings/actions.ts, which always send regardless of these prefs —
// those are the actual booking/contract correspondence, not a "nice to
// know" internal alert, so they shouldn't be silently switchable off here.
//
// Each event is gated by an admin-configurable toggle (Settings →
// Notifications tab) stored in the same Setting key-value table used for
// pricing rules. See notifications-actions.ts for the server actions.

export interface NotificationPrefs {
  bookingConfirmed: boolean
  contractReady: boolean
  returnReminder: boolean
  paymentReceived: boolean
  maintenanceDue: boolean
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  bookingConfirmed: true,
  contractReady: true,
  returnReminder: true,
  paymentReceived: true,
  maintenanceDue: true,
}
