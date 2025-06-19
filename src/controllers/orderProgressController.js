"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderProgress = void 0;
const dailyLog_1 = __importDefault(require("../models/dailyLog"));
const orders_1 = __importDefault(require("../models/orders"));
const mongoose_1 = __importDefault(require("mongoose"));
const getOrderProgress = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }
        const order = await orders_1.default.findById(orderId).populate('assignedCallers', 'name');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const logs = await dailyLog_1.default.find({ orderId });
        const progressMap = new Map();
        for (const caller of order.assignedCallers) {
            const agentId = caller._id.toString();
            const agentLogs = logs.filter(log => log.agentId.toString() === agentId);
            const agentName = caller.name;
            const dailyBreakdown = agentLogs.map(log => ({
                date: log.date.toISOString().split('T')[0],
                quantity: log.quantityCompleted
            }));
            const totalCompleted = agentLogs.reduce((sum, log) => sum + log.quantityCompleted, 0);
            progressMap.set(agentId, {
                agent: {
                    _id: caller._id,
                    name: caller.name
                },
                logs: dailyBreakdown,
                totalCompleted
            });
        }
        res.json({
            orderId: order._id,
            goalType: order.goalType,
            totalQuantity: order.totalQuantity,
            assignedCallers: Array.from(progressMap.values())
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getOrderProgress = getOrderProgress;
