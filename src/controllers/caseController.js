"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCase = exports.modifyCase = exports.addCase = exports.getCaseById = exports.getAllCases = void 0;
const case_1 = __importDefault(require("../models/case"));
// Get all clients
const getAllCases = async (req, res) => {
    try {
        const cases = await case_1.default.find();
        res.status(200).json(cases);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.getAllCases = getAllCases;
// Get case by ID
const getCaseById = async (req, res) => {
    try {
        const cases = await case_1.default.findById(req.params.id);
        if (!cases) {
            return res.status(404).json({ error: 'Case not found' });
        }
        res.status(200).json(cases);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCaseById = getCaseById;
// Add a new case
const addCase = async (req, res) => {
    try {
        const newCase = new case_1.default({
            name: req.body.name,
            contactInfo: req.body.contactInfo
        });
        await newCase.save();
        res.status(200).json({ message: '1. Case added successfully', case: newCase });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.addCase = addCase;
// Modify an existing case
const modifyCase = async (req, res) => {
    try {
        const updatedCase = await case_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCase) {
            return res.status(404).json({ error: 'Case not found' });
        }
        res.status(200).json({ message: 'Case updated', case: updatedCase });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.modifyCase = modifyCase;
// Delete a case
const deleteCase = async (req, res) => {
    try {
        await case_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Case deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteCase = deleteCase;
