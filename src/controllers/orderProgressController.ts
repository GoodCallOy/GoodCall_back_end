import DailyLog from '../models/dailyLog'
import Order from '../models/orders'
import gcAgent from '../models/gcAgent'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

export const getOrderProgress = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    const order = await Order.findById(orderId).populate('assignedCallers', 'name')

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const logs = await DailyLog.find({ orderId })

    const progressMap = new Map()

    for (const caller of order.assignedCallers as any) {
      const agentId = caller._id.toString()
      const agentLogs = logs.filter(log => log.agentId.toString() === agentId)
       const agentName = caller.name;

      const dailyBreakdown = agentLogs.map(log => ({
        date: log.date.toISOString().split('T')[0],
        quantity: log.quantityCompleted
      }))

      const totalCompleted = agentLogs.reduce((sum, log) => sum + log.quantityCompleted, 0)

      progressMap.set(agentId, {
        agent: {
          _id: caller._id,
          name: caller.name
        },
        logs: dailyBreakdown,
        totalCompleted
      })
    }

    res.json({
      orderId: order._id,
      goalType: order.goalType,
      totalQuantity: order.totalQuantity,
      assignedCallers: Array.from(progressMap.values())
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
