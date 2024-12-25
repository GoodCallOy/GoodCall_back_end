"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteCase = exports.modifyCase = exports.addCase = exports.getCaseById = exports.getAllCases = void 0;
const cases_1 = __importDefault(require("../models/cases"));
const getAllCases = async (req, res) => {
  try {
    console.log("getting all Cases");
    const allCases = await cases_1.default.find();
    console.log("all cases found", allCases);
    res.status(200).json(allCases);
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message
    });
  }
};
exports.getAllCases = getAllCases;
// Get a single job by ID
const getCaseById = async (req, res) => {
  const CaseId = req.params.id;
  try {
    console.log("getting case by id", CaseId);
    const Case = await cases_1.default.findById(CaseId);
    if (!Case) {
      return res.status(404).json({
        error: 'caseId not found'
      });
    }
    res.status(200).json(Case);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
exports.getCaseById = getCaseById;
const addCase = async (req, res) => {
  try {
    const newCase = new cases_1.default({
      name: req.body.name,
      billing: req.body.billing,
      state: req.body.state,
      type: req.body.type
    });
    console.log('newCase', newCase);
    if (await newCase.save()) {
      res.status(200).json({
        status: 200,
        message: "Case saved successfully" + newCase
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message
    });
  }
};
exports.addCase = addCase;
const modifyCase = async (req, res) => {
  const CaseId = req.params.id;
  const updatedCaseData = req.body;
  try {
    const modifiedCase = await cases_1.default.findByIdAndUpdate(CaseId, updatedCaseData, {
      new: true
    });
    res.status(200).json({
      message: 'Case modified successfully.',
      modifiedCase
    });
  } catch (error) {
    console.error('Error modifying case:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
exports.modifyCase = modifyCase;
const deleteCase = async (req, res) => {
  const CaseId = req.params.id;
  try {
    await cases_1.default.findByIdAndDelete(CaseId);
    res.status(200).json({
      message: 'Case deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
exports.deleteCase = deleteCase;