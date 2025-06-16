import express from 'express'
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController'

const router = express.Router()

// POST /api/orders - Create a new order
router.post('/', createOrder)

// GET /api/orders - Get all orders
router.get('/', getAllOrders)

// GET /api/orders/:id - Get a single order by ID
router.get('/:id', getOrderById)

// PUT /api/orders/:id - Update an order
router.put('/:id', updateOrder)

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', deleteOrder)

export default router
