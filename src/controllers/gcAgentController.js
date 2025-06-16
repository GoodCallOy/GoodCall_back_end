"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgent = exports.updateAgent = exports.getAgentById = exports.getAllAgents = exports.createAgent = void 0;
const gcAgent_1 = __importDefault(require("../models/gcAgent"));
// Create a new agent
const createAgent = async (req, res) => {
    try {
        const agent = new gcAgent_1.default(req.body);
        await agent.save();
        res.status(201).json(agent);
    }
    catch (err) {
        res.status(400).json({ message: 'Failed to create agent', error: err });
    }
};
exports.createAgent = createAgent;
// Get all agents
const getAllAgents = async (_req, res) => {
    try {
        const agents = await gcAgent_1.default.find().sort({ createdAt: -1 });
        console.log('Fetched gcAgents:', agents);
        res.json(agents);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch agents', error: err });
    }
};
exports.getAllAgents = getAllAgents;
// Get agent by ID
const getAgentById = async (req, res) => {
    try {
        const agent = await gcAgent_1.default.findById(req.params.id);
        if (!agent)
            return res.status(404).json({ message: 'Agent not found' });
        res.json(agent);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch agent', error: err });
    }
};
exports.getAgentById = getAgentById;
// Update agent
const updateAgent = async (req, res) => {
    try {
        const updated = await gcAgent_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Agent not found' });
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ message: 'Failed to update agent', error: err });
    }
};
exports.updateAgent = updateAgent;
// Delete agent
const deleteAgent = async (req, res) => {
    try {
        const deleted = await gcAgent_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Agent not found' });
        res.json({ message: 'Agent deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to delete agent', error: err });
    }
};
exports.deleteAgent = deleteAgent;
