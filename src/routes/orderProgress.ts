import express from 'express'
import { getOrderProgress } from '../controllers/orderProgressController'

const router = express.Router()

router.get('/:orderId/progress', getOrderProgress)

export default router
