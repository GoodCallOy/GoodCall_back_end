import { Request, Response } from 'express'
import Order from '../models/orders'

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
    console.log('Fetched orders:', orders)
    res.status(200).json(orders)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
      const order = await Order.findById(req.params.id)
      if (!order) return res.status(404).json({ message: 'order not found' })
      res.json(order)
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch order', error: err })
    }
}

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log('Creating order with data:', req.body)
    const newOrder = new Order({
      caseId: req.body.caseId,
      caseName: req.body.caseName,
      caseUnit: req.body.caseUnit,
      pricePerUnit: req.body.pricePerUnit,
      totalQuantity: req.body.totalQuantity,
      startDate: req.body.startDate || new Date(), // Default to current date if not provided
      deadline: req.body.deadline,
      orderStatus: req.body.orderStatus || 'pending',
      estimatedRevenue: req.body.estimatedRevenue,
      assignedCallers: req.body.assignedCallers || [],
      agentGoals: req.body.agentGoals || {} 

    })

    await newOrder.save()
    res.status(200).json({
      message: 'Order created successfully',
      order: newOrder
    })
  } catch (err: any) {
    console.error('Error creating order:', err.message)
    res.status(400).json({
      message: err.message
    })
  }
}

// Update an order
export const updateOrder = async (req: Request, res: Response) => {
  const orderId = req.params.id
  const updatedData = req.body

  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updatedData, { new: true })
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder })
  } catch (err: any) {
    console.error('Error updating order:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
  const orderId = req.params.id
  try {
    await Order.findByIdAndDelete(orderId)
    res.status(200).json({ message: 'Order deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting order:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}