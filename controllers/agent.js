"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgent = exports.modifyAgent = exports.addAgent = exports.getAgentById = exports.getAllAgents = void 0;
const agent_1 = __importDefault(require("../models/agent"));
const getAllAgents = async (req, res) => {
    try {
        console.log("getting all agents");
        const allJobs = await agent_1.default.find();
        console.log("all agents found");
        res.status(200).json(allJobs);
    }
    catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};
exports.getAllAgents = getAllAgents;
// Get a single job by ID
const getAgentById = async (req, res) => {
    const agentId = req.params.id;
    try {
        const job = await agent_1.default.findById(agentId);
        if (!job) {
            return res.status(404).json({ error: 'agentId not found' });
        }
        res.status(200).json(job);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAgentById = getAgentById;
const addAgent = async (req, res) => {
    try {
        const newJob = new agent_1.default({
            company: req.body.company,
            companyWebSite: req.body.companyWebSite,
            applicationLink: req.body.applicationLink,
            Position: req.body.Position,
            jobDescription: req.body.jobDescription,
            dateApplied: req.body.dateApplied,
            response: req.body.response,
            reasonToWork: req.body.reasonToWork,
            recruiterName: req.body.recruiterName,
            recruiterPosition: req.body.recruiterPosition,
            applied: req.body.applied,
        });
        if (await newJob.save()) {
            res.status(200).json({
                status: 200,
                message: "Agent saved successfully" + newJob,
            });
        }
    }
    catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};
exports.addAgent = addAgent;
const modifyAgent = async (req, res) => {
    const agentId = req.params.id;
    const updatedAgentData = req.body;
    try {
        const modifiedAgent = await agent_1.default.findByIdAndUpdate(agentId, updatedAgentData, { new: true });
        res.status(200).json({ message: 'agent modified successfully.', modifiedAgent });
    }
    catch (error) {
        console.error('Error modifying agent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.modifyAgent = modifyAgent;
const deleteAgent = async (req, res) => {
    const agentId = req.params.id;
    try {
        await agent_1.default.findByIdAndDelete(agentId);
        res.status(200).json({ message: 'Agent deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteAgent = deleteAgent;