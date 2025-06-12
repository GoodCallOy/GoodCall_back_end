"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgent = exports.modifyAgent = exports.addAgent = exports.getAgentById = exports.getAllAgents = void 0;
const gcAgent_1 = __importDefault(require("../models/gcAgent"));
// Get all agents
const getAllAgents = async (req, res) => {
    try {
        const agents = await gcAgent_1.default.find();
        res.status(200).json(agents);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.getAllAgents = getAllAgents;
// Get agent by ID
const getAgentById = async (req, res) => {
    try {
        const agent = await gcAgent_1.default.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.status(200).json(agent);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAgentById = getAgentById;
// Add a new agent
const addAgent = async (req, res) => {
    var _a;
    try {
        const newAgent = new gcAgent_1.default({
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            active: (_a = req.body.active) !== null && _a !== void 0 ? _a : true
        });
        await newAgent.save();
        res.status(200).json({ message: 'Agent added successfully', agent: newAgent });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.addAgent = addAgent;
// Modify an existing agent
const modifyAgent = async (req, res) => {
    try {
        const updatedAgent = await gcAgent_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAgent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.status(200).json({ message: 'Agent updated', agent: updatedAgent });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.modifyAgent = modifyAgent;
// Delete an agent
const deleteAgent = async (req, res) => {
    try {
        await gcAgent_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Agent deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteAgent = deleteAgent;
