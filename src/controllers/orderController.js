"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getAllOrders = void 0;
const orders_1 = __importDefault(require("../models/orders"));
// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await orders_1.default.find();
        console.log('Fetched orders:', orders);
        res.status(200).json(orders);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.getAllOrders = getAllOrders;
// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await orders_1.default.findById(req.params.id);
        if (!order)
            return res.status(404).json({ message: 'order not found' });
        res.json(order);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch order', error: err });
    }
};
exports.getOrderById = getOrderById;
// Create a new order
const createOrder = async (req, res) => {
    try {
        console.log('Creating order with data:', req.body);
        const newOrder = new orders_1.default({
            caseId: req.body.caseId,
            caseName: req.body.caseName,
            caseUnit: req.body.caseUnit,
            pricePerUnit: req.body.pricePerUnit,
            totalQuantity: req.body.totalQuantity,
            deadline: req.body.deadline,
            orderStatus: req.body.orderStatus || 'pending',
            estimatedRevenue: req.body.estimatedRevenue,
            assignedCallers: req.body.assignedCallers || [],
            agentGoals: req.body.agentGoals || {}
        });
        await newOrder.save();
        res.status(200).json({
            message: 'Order created successfully',
            order: newOrder
        });
    }
    catch (err) {
        console.error('Error creating order:', err.message);
        res.status(400).json({
            message: err.message
        });
    }
};
exports.createOrder = createOrder;
// Update an order
const updateOrder = async (req, res) => {
    const orderId = req.params.id;
    const updatedData = req.body;
    try {
        const updatedOrder = await orders_1.default.findByIdAndUpdate(orderId, updatedData, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
    }
    catch (err) {
        console.error('Error updating order:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateOrder = updateOrder;
// Delete an order
const deleteOrder = async (req, res) => {
    const orderId = req.params.id;
    try {
        await orders_1.default.findByIdAndDelete(orderId);
        res.status(200).json({ message: 'Order deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting order:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteOrder = deleteOrder;
