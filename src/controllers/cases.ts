import { Request, Response } from "express";
import Cases from "../models/cases";
import ICases from "../types/ICases";
import Order from "../models/orders";
import DailyLog from "../models/dailyLog";
import AgentGoals from "../models/agentGoals";
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
    // Fetch existing case to compare name
    const existingCase = await Cases.findById(CaseId);
    if (!existingCase) {
      return res.status(404).json({ error: 'caseId not found' });
    }

    const modifiedCase = await Cases.findByIdAndUpdate(
      CaseId,
      updatedCaseData,
      { new: true }
    );

    if (!modifiedCase) {
      return res.status(404).json({ error: 'caseId not found after update' });
    }

    // If name changed, cascade update to related collections that denormalize caseName
    const oldName = existingCase.name;
    const newName = updatedCaseData.name ?? modifiedCase.name;

    if (newName && newName !== oldName) {
      try {
        // 1) Orders: update caseName where caseId matches
        await Order.updateMany(
          { caseId: modifiedCase._id },
          { $set: { caseName: newName } }
        );

        // 2) Daily logs: find orders for this case, then update logs by order ref
        const ordersForCase = await Order.find({ caseId: modifiedCase._id }).select("_id");
        const orderIds = ordersForCase.map(o => o._id);
        if (orderIds.length > 0) {
          await DailyLog.updateMany(
            { order: { $in: orderIds } },
            { $set: { caseName: newName } }
          );
        }

        // 3) Weekly goals: stored by caseName string; update where old name matches
        await AgentGoals.updateMany(
          { caseName: oldName },
          { $set: { caseName: newName } }
        );

        console.log(
          `Cascade caseName change "${oldName}" -> "${newName}" on orders, daily logs, weekly goals`
        );
      } catch (cascadeErr) {
        console.error("Error during caseName cascade update:", cascadeErr);
        // Do not fail the main request just because cascade failed
      }
    }

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
