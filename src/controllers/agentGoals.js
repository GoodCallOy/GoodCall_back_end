"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgentGoals = exports.modifyAgentGoals = exports.getAgentGoalsByAgentAndMonth = exports.addAgentGoals = exports.getAgentGoalsById = exports.getAllAgentGoals = void 0;
const agentGoals_1 = __importDefault(require("../models/agentGoals"));
const getAllAgentGoals = async (req, res) => {
    try {
        console.log("getting all agents");
        const allAgents = await agentGoals_1.default.find();
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
exports.getAllAgentGoals = getAllAgentGoals;
// Get a single job by ID
const getAgentGoalsById = async (req, res) => {
    const agentId = req.params.id;
    try {
        console.log("getting agent goals by id", agentId);
        const agent = await agentGoals_1.default.findById(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'agent goals Id not found' });
        }
        res.status(200).json(agent);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAgentGoalsById = getAgentGoalsById;
const addAgentGoals = async (req, res) => {
    try {
        console.log("agent goals object:", req.body);
        // Create a new agent using the data from the request body
        const newAgent = new agentGoals_1.default({
            agent: req.body.agent,
            case: req.body.case,
            goal: req.body.goal,
            type: req.body.type,
            goal_date: {
                start: req.body.goal_date.start,
                end: req.body.goal_date.end,
            },
            monthKey: req.body.monthKey,
        });
        // Save the new agent to the database
        await newAgent.save();
        res.status(200).json({
            status: 200,
            message: "Agent goals saved successfully",
            agent: newAgent,
        });
    }
    catch (err) {
        console.error("Error adding agent goals:", err.message);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};
exports.addAgentGoals = addAgentGoals;
const getAgentGoalsByAgentAndMonth = async (req, res) => {
    try {
        const { agent } = req.params; // get agent from URL params
        const { month } = req.query; // Get month from query params
        console.log("agent", agent);
        console.log("month", month);
        if (!agent) {
            return res.status(400).json({ error: "Agent " });
        }
        // Query agent goals for the given month
        const goals = await agentGoals_1.default.find({
            agent: agent,
            monthKey: month,
        });
        console.log("goals", goals);
        res.json(goals);
    }
    catch (error) {
        console.error('Error fetching agent goals:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAgentGoalsByAgentAndMonth = getAgentGoalsByAgentAndMonth;
const modifyAgentGoals = async (req, res) => {
    const agentId = req.params.id;
    const updatedAgentData = req.body;
    try {
        const modifiedAgent = await agentGoals_1.default.findByIdAndUpdate(agentId, updatedAgentData, { new: true });
        res.status(200).json({ message: 'agent goals modified successfully.', modifiedAgent });
    }
    catch (error) {
        console.error('Error modifying agent goals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.modifyAgentGoals = modifyAgentGoals;
const deleteAgentGoals = async (req, res) => {
    const agentId = req.params.id;
    try {
        await agentGoals_1.default.findByIdAndDelete(agentId);
        res.status(200).json({ message: 'Agent goals deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting agent goals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteAgentGoals = deleteAgentGoals;
