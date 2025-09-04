"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgent = exports.updateAgent = exports.getAgentById = exports.getAllAgents = exports.createAgent = void 0;
const mongoose_1 = require("mongoose");
const gcAgent_1 = __importDefault(require("../models/gcAgent"));
// Create a new agent
const createAgent = async (req, res) => {
    var _a, _b, _c;
    console.log('REQ BODY:', req.body);
    try {
        console.log('REQ BODY2:', req.body, 'linkedUserId type:', typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.linkedUserId));
        // Explicitly coerce/cast the id (if provided)
        const rawId = (_b = req.body) === null || _b === void 0 ? void 0 : _b.linkedUserId;
        const castLinked = rawId && mongoose_1.Types.ObjectId.isValid(rawId) ? new mongoose_1.Types.ObjectId(rawId) : null;
        const agent = await gcAgent_1.default.create({
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            active: (_c = req.body.active) !== null && _c !== void 0 ? _c : true,
            linkedUserId: castLinked, // <-- assign explicitly
        });
        console.log('CREATED AGENT:', agent);
        res.status(201).json(agent);
    }
    catch (err) {
        console.error('CREATE ERROR:', err);
        res.status(400).json({ message: 'Failed to create agent', error: err });
    }
};
exports.createAgent = createAgent;
// Get all agents
const getAllAgents = async (_req, res) => {
    try {
        const agents = await gcAgent_1.default.find().sort({ createdAt: -1 });
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
