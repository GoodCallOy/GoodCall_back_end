"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgentStats = exports.modifyAgentStats = exports.addAgentStats = exports.getAgentStatsById = exports.getAllAgentStats = void 0;
const agentStats_1 = __importDefault(require("../models/agentStats"));
const getAllAgentStats = async (req, res) => {
    try {
        console.log("getting all agents");
        const allAgents = await agentStats_1.default.find();
        console.log("all agents found", allAgents);
        res.status(200).json(allAgents);
    }
    catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};
exports.getAllAgentStats = getAllAgentStats;
// Get a single job by ID
const getAgentStatsById = async (req, res) => {
    const agentId = req.params.id;
    try {
        console.log("getting agent by id", agentId);
        const agent = await agentStats_1.default.findById(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'agentId not found' });
        }
        res.status(200).json(agent);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAgentStatsById = getAgentStatsById;
const addAgentStats = async (req, res) => {
    try {
        console.log("agent object:", req.body);
        // Create a new agent using the data from the request body
        const newAgent = new agentStats_1.default({
            name: req.body.name,
            meetings: req.body.meetings,
            call_time: req.body.call_time,
            calls_made: req.body.calls_made,
            outgoing_calls: req.body.outgoing_calls,
            answered_calls: req.body.answered_calls,
            response_rate: req.body.response_rate,
            case: req.body.case,
            create_date: req.body.create_date, // Optional, defaults to Date.now if not provided
        });
        // Save the new agent to the database
        await newAgent.save();
        res.status(200).json({
            status: 200,
            message: "Agent saved successfully",
            agent: newAgent,
        });
    }
    catch (err) {
        console.error("Error adding agent:", err.message);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};
exports.addAgentStats = addAgentStats;
const modifyAgentStats = async (req, res) => {
    const agentId = req.params.id;
    const updatedAgentData = req.body;
    try {
        const modifiedAgent = await agentStats_1.default.findByIdAndUpdate(agentId, updatedAgentData, { new: true });
        res.status(200).json({ message: 'agent modified successfully.', modifiedAgent });
    }
    catch (error) {
        console.error('Error modifying agent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.modifyAgentStats = modifyAgentStats;
const deleteAgentStats = async (req, res) => {
    const agentId = req.params.id;
    try {
        await agentStats_1.default.findByIdAndDelete(agentId);
        res.status(200).json({ message: 'Agent deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteAgentStats = deleteAgentStats;
