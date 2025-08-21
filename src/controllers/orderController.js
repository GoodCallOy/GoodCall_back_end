"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAgentOrderRevenues = exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getAllOrders = void 0;
exports.computeAgentOrderRevenuesGrouped = computeAgentOrderRevenuesGrouped;
const mongoose_1 = require("mongoose");
const orders_1 = __importDefault(require("../models/orders"));
const gcAgent_1 = __importDefault(require("../models/gcAgent"));
// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await orders_1.default.find();
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
            startDate: req.body.startDate || new Date(), // Default to current date if not provided
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
    console.log('Deleting order with ID:', orderId);
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
async function computeAgentOrderRevenuesGrouped(fromDate, toDate, onlyAgentId) {
    var _a, _b, _c, _d;
    const orders = await orders_1.default.find({
        startDate: { $lte: toDate },
        deadline: { $gte: fromDate },
    })
        .select('caseId caseName pricePerUnit startDate deadline assignedCallers agentGoals')
        .lean();
    // collect agent ids
    const agentIdsUsed = new Set();
    for (const order of orders) {
        for (const assignedId of ((_a = order.assignedCallers) !== null && _a !== void 0 ? _a : [])) {
            agentIdsUsed.add(String(assignedId));
        }
    }
    // fetch names
    const userDocs = await gcAgent_1.default.find({
        _id: { $in: Array.from(agentIdsUsed).map(id => new mongoose_1.Types.ObjectId(id)) },
    }).select('name firstName lastName').lean();
    const displayNameById = new Map(userDocs.map(u => {
        const displayName = u.name ||
            [u.firstName, u.lastName].filter(Boolean).join(' ') ||
            '(unknown)';
        return [String(u._id), displayName];
    }));
    // group
    const buckets = {};
    for (const order of orders) {
        const pricePerUnit = Number(order.pricePerUnit) || 0;
        const goalsByAgent = ((_b = order.agentGoals) !== null && _b !== void 0 ? _b : {});
        const assignedAgentIds = ((_c = order.assignedCallers) !== null && _c !== void 0 ? _c : []);
        for (const assignedId of assignedAgentIds) {
            const agentId = String(assignedId);
            if (onlyAgentId && agentId !== onlyAgentId)
                continue;
            const goalForThisOrder = Number(goalsByAgent[agentId]) || 0;
            const revenueForThisOrder = goalForThisOrder * pricePerUnit;
            const agentName = (_d = displayNameById.get(agentId)) !== null && _d !== void 0 ? _d : '(unknown)';
            if (!buckets[agentId]) {
                buckets[agentId] = {
                    agentId,
                    agentName,
                    totalRevenue: 0,
                    orders: [],
                };
            }
            buckets[agentId].orders.push({
                orderId: String(order._id),
                caseId: String(order.caseId),
                caseName: order.caseName,
                goal: goalForThisOrder,
                pricePerUnit,
                revenue: revenueForThisOrder,
                startDate: order.startDate,
                deadline: order.deadline,
            });
            buckets[agentId].totalRevenue += revenueForThisOrder;
        }
    }
    // shape: attach totals to each agent and sort
    const agents = Object.values(buckets)
        .map(a => ({
        ...a,
        totals: { revenue: a.totalRevenue, orders: a.orders.length },
    }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
    return { agents };
}
const listAgentOrderRevenues = async (req, res) => {
    var _a;
    try {
        const { from, to } = req.query;
        if (!from || !to)
            return res.status(400).json({ error: 'from and to are required (ISO dates)' });
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (isNaN(+fromDate) || isNaN(+toDate))
            return res.status(400).json({ error: 'Invalid date(s)' });
        const onlyAgentId = ((_a = req === null || req === void 0 ? void 0 : req.gcAgent) === null || _a === void 0 ? void 0 : _a.role) === 'caller' ? String(req.gcAgent._id) : undefined;
        const { agents } = await computeAgentOrderRevenuesGrouped(fromDate, toDate, onlyAgentId);
        res.status(200).json({ agents });
    }
    catch (err) {
        console.error('Error listing agent order revenues:', (err === null || err === void 0 ? void 0 : err.message) || err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listAgentOrderRevenues = listAgentOrderRevenues;
