import type { OrderStatus } from '../models/orders'

export const ORDER_STATUS_VALUES: OrderStatus[] = [
  'pending',
  'in-progress',
  'completed',
  'cancelled',
  'on-hold',
]

const MONTH_KEY_RE = /^\d{4}-\d{2}$/

export function normalizeOrderStatus(status: unknown): OrderStatus | null {
  const normalized = String(status ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
  return (ORDER_STATUS_VALUES as string[]).includes(normalized)
    ? (normalized as OrderStatus)
    : null
}

/** Validate and normalize a monthlyOrderStatus map; returns error message or normalized map. */
export function parseMonthlyOrderStatus(
  input: unknown
): { ok: true; value: Record<string, OrderStatus> } | { ok: false; error: string } {
  if (input === undefined || input === null) {
    return { ok: true, value: {} }
  }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'monthlyOrderStatus must be an object keyed by YYYY-MM' }
  }

  const value: Record<string, OrderStatus> = {}
  for (const [key, rawStatus] of Object.entries(input as Record<string, unknown>)) {
    if (!MONTH_KEY_RE.test(key)) {
      return { ok: false, error: `Invalid monthlyOrderStatus key "${key}" (expected YYYY-MM)` }
    }
    const status = normalizeOrderStatus(rawStatus)
    if (!status) {
      return {
        ok: false,
        error: `Invalid status "${String(rawStatus)}" for month ${key}`,
      }
    }
    value[key] = status
  }
  return { ok: true, value }
}
