import { Types } from 'mongoose'
import Order from '../models/orders'
import { areDailyLogsFrozenForOrderMonth, monthKeyFromDate } from './orderStatusHelpers'

type GuardResult =
  | { ok: true }
  | { ok: false; status: number; message: string }

export async function assertDailyLogsAllowed(
  orderId: unknown,
  caseName: unknown,
  logDate: unknown
): Promise<GuardResult> {
  const monthKey = monthKeyFromDate(logDate)
  if (!monthKey) {
    return { ok: false, status: 400, message: 'A valid log date is required' }
  }

  let order = null
  const id = String(orderId ?? '').trim()
  if (id && Types.ObjectId.isValid(id)) {
    order = await Order.findById(id).lean()
  }
  if (!order && caseName) {
    order = await Order.findOne({ caseName: String(caseName) })
      .sort({ startDate: -1 })
      .lean()
  }
  if (!order) {
    return { ok: true }
  }

  if (areDailyLogsFrozenForOrderMonth(order, monthKey)) {
    return {
      ok: false,
      status: 403,
      message: `Daily logs are frozen for "${order.caseName}" in ${monthKey} (order completed for that month)`,
    }
  }

  return { ok: true }
}
