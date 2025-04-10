"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgentCaseInfo = exports.modifyAgentCaseInfo = exports.getAgentCaseInfoByAgentAndMonth = exports.addAgentCaseInfo = exports.getAgentCaseInfoById = exports.getAllAgentCaseInfo = void 0;
const agentCaseInfo_1 = __importDefault(require("../models/agentCaseInfo"));
const getAllAgentCaseInfo = async (req, res) => {
    try {
        const allAgents = await agentCaseInfo_1.default.find();
        res.status(200).json(allAgents);
    }
    catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};
exports.getAllAgentCaseInfo = getAllAgentCaseInfo;
// Get a single job by ID
const getAgentCaseInfoById = async (req, res) => {
    const agentId = req.params.id;
    try {
        console.log("getting agent case info by id", agentId);
        const agent = await agentCaseInfo_1.default.findById(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'agent case info Id not found' });
        }
        res.status(200).json(agent);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAgentCaseInfoById = getAgentCaseInfoById;
const addAgentCaseInfo = async (req, res) => {
    try {
        // Create a new agent using the data from the request body
        const newAgent = new agentCaseInfo_1.default({
            agent: req.body.agent,
            case: req.body.case,
            amount: req.body.amount,
            type: req.body.type,
            amount_date: {
                start: req.body.amount_date.start,
                end: req.body.amount_date.end,
            },
            monthKey: req.body.monthKey,
        });
        // Save the new agent to the database
        await newAgent.save();
        res.status(200).json({
            status: 200,
            message: "Agent case info saved successfully",
            agent: newAgent,
        });
    }
    catch (err) {
        console.error("Error adding agent case info:", err.message);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};
exports.addAgentCaseInfo = addAgentCaseInfo;
const getAgentCaseInfoByAgentAndMonth = async (req, res) => {
    try {
        const { agent } = req.params; // get agent from URL params
        const { month } = req.query; // Get month from query params
        console.log("agent", agent);
        console.log("month", month);
        if (!agent) {
            return res.status(400).json({ error: "Agent " });
        }
        // Query agent goals for the given month
        const goals = await agentCaseInfo_1.default.find({
            agent: agent,
            monthKey: month,
        });
        console.log("goals", goals);
        res.json(goals);
    }
    catch (error) {
        console.error('Error fetching agent case info:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAgentCaseInfoByAgentAndMonth = getAgentCaseInfoByAgentAndMonth;
const modifyAgentCaseInfo = async (req, res) => {
    const agentId = req.params.id;
    const updatedAgentData = req.body;
    try {
        const modifiedAgent = await agentCaseInfo_1.default.findByIdAndUpdate(agentId, updatedAgentData, { new: true });
        res.status(200).json({ message: 'agent case info modified successfully.', modifiedAgent });
    }
    catch (error) {
        console.error('Error modifying agent case info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.modifyAgentCaseInfo = modifyAgentCaseInfo;
const deleteAgentCaseInfo = async (req, res) => {
    const agentId = req.params.id;
    try {
        await agentCaseInfo_1.default.findByIdAndDelete(agentId);
        res.status(200).json({ message: 'Agent case info deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting agent case info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteAgentCaseInfo = deleteAgentCaseInfo;
