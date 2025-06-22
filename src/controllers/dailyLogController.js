"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDailyLog = exports.updateDailyLog = exports.addDailyLog = exports.getLogsByAgentId = exports.getAllDailyLogs = void 0;
const dailyLog_1 = __importDefault(require("../models/dailyLog"));
// Get all daily logs
const getAllDailyLogs = async (_req, res) => {
    try {
        const logs = await dailyLog_1.default.find().populate('agent').populate('order');
        res.status(200).json(logs);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch logs', error: err });
    }
};
exports.getAllDailyLogs = getAllDailyLogs;
// Get daily logs by agent ID
const getLogsByAgentId = async (req, res) => {
    try {
        const logs = await dailyLog_1.default.find({ agentId: req.params.agentId }).populate('orderId');
        res.status(200).json(logs);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch agent logs', error: err });
    }
};
exports.getLogsByAgentId = getLogsByAgentId;
// Add a new daily log
const addDailyLog = async (req, res) => {
    try {
        const { agent, agentName, order, caseName, caseUnit, call_time, completed_calls, outgoing_calls, answered_calls, response_rate, date, quantityCompleted, } = req.body;
        console.log('dailylog data:', req.body);
        const newLog = new dailyLog_1.default({
            agent,
            agentName,
            order,
            caseName,
            caseUnit,
            call_time: call_time || 0,
            completed_calls: completed_calls || 0,
            outgoing_calls: outgoing_calls || 0,
            answered_calls: answered_calls || 0,
            response_rate: response_rate || 0,
            date: date || new Date(),
            quantityCompleted: quantityCompleted || 0
        });
        const savedLog = await newLog.save();
        console.log('Adding new daily log:', newLog);
        res.status(201).json({ message: 'Daily log saved', log: savedLog });
    }
    catch (err) {
        console.error('Error saving daily log:', err);
        res.status(400).json({ message: 'Failed to add log', error: err });
    }
};
exports.addDailyLog = addDailyLog;
// Update an existing daily log
const updateDailyLog = async (req, res) => {
    try {
        const updatedLog = await dailyLog_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedLog) {
            return res.status(404).json({ message: 'Log not found' });
        }
        res.status(200).json({ message: 'Log updated', log: updatedLog });
    }
    catch (err) {
        res.status(400).json({ message: 'Failed to update log', error: err });
    }
};
exports.updateDailyLog = updateDailyLog;
// Delete a daily log
const deleteDailyLog = async (req, res) => {
    try {
        await dailyLog_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Log deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to delete log', error: err });
    }
};
exports.deleteDailyLog = deleteDailyLog;
