"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
// POST /api/orders - Create a new order
router.post('/', orderController_1.createOrder);
// GET /api/orders - Get all orders
router.get('/', orderController_1.getAllOrders);
// GET /api/orders/:id - Get a single order by ID
router.get('/:id', orderController_1.getOrderById);
// PUT /api/orders/:id - Update an order
router.put('/:id', orderController_1.updateOrder);
// DELETE /api/orders/:id - Delete an order
router.delete('/:id', orderController_1.deleteOrder);
exports.default = router;
