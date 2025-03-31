import { Request, Response } from "express";
import Cases from "../models/cases";
import ICases from "../types/ICases";
export const getAllCases = async (req: Request, res: Response) => {
  try {
    
    const allCases = await Cases.find();
    res.status(200).json(allCases);
  } catch (err: any) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// Get a single job by ID
export const getCaseById = async (req: Request, res: Response) => {
  const CaseId = req.params.id;

  try {
    console.log("getting case by id", CaseId);
    const Case: ICases | null = await Cases.findById(CaseId);
    if (!Case) {
      return res.status(404).json({ error: 'caseId not found' });
    }
    res.status(200).json(Case);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addCase = async (req: Request, res: Response) => {
  try {
    const newCase = new Cases({
      name: req.body.name,
      billing: req.body.billing,
      state: req.body.state,
      type: req.body.type,
   });
   console.log('newCase', newCase);

    if (await newCase.save()) {
      res.status(200).json({
        status: 200,
        message: "Case saved successfully" + newCase,
      });
    } 
  } catch (err: any) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

export const modifyCase = async (req: Request, res: Response) => {
  const CaseId = req.params.id;
  const updatedCaseData: Partial<ICases> = req.body;

  try {
    const modifiedCase = await Cases.findByIdAndUpdate(CaseId, updatedCaseData, { new: true });
    res.status(200).json({ message: 'Case modified successfully.', modifiedCase });
  } catch (error) {
    console.error('Error modifying case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCase = async (req: Request, res: Response) => {
  const CaseId = req.params.id;

  try {
    await Cases.findByIdAndDelete(CaseId);
    res.status(200).json({ message: 'Case deleted successfully.' });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
