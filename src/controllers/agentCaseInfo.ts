import { Request, Response } from "express";
import agentCaseInfo from "../models/agentCaseInfo";
import IAagentCaseInfo from "../types/IAgentCaseInfo";

export const getAllAgentCaseInfo = async (req: Request, res: Response) => {
  try {
    const allAgents = await agentCaseInfo.find();
    res.status(200).json(allAgents);
  } catch (err: any) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// Get a single job by ID
export const getAgentCaseInfoById = async (req: Request, res: Response) => {
  const agentId = req.params.id;

  try {
    console.log("getting agent case info by id", agentId);
    const agent: IAagentCaseInfo | null = await agentCaseInfo.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'agent case info Id not found' });
    }
    res.status(200).json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addAgentCaseInfo = async (req: Request, res: Response) => {
  try {
    // Create a new agent using the data from the request body
    const newAgent = new agentCaseInfo({
      agent: req.body.agent,
      case: req.body.case,
      amount: req.body.amount,
      type: req.body.type,
      amount_date: {
        start: req.body.amount_date.start,
        end: req.body.amount_date.end,
      },
      monthKey: req.body.monthKey,
    });

    // Save the new agent to the database
    await newAgent.save();

    res.status(200).json({
      status: 200,
      message: "Agent case info saved successfully",
      agent: newAgent,
    });
  } catch (err: any) {
    console.error("Error adding agent case info:", err.message);
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};
export const getAgentCaseInfoByAgentAndMonth = async (req: Request, res: Response) => {
  try {

    const { agent } = req.params;  // get agent from URL params
    const { month } = req.query;   // Get month from query params

    console.log("agent", agent);
    console.log("month", month);

    if (!agent) {
        return res.status(400).json({ error: "Agent " });
    }

    // Query agent goals for the given month
    const goals = await agentCaseInfo.find({
        agent: agent,
        monthKey: month,
    });
    console.log("goals", goals);
    res.json(goals);
} catch (error) {
    console.error('Error fetching agent case info:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}
};

export const modifyAgentCaseInfo = async (req: Request, res: Response) => {
  const agentId = req.params.id;
  const updatedAgentData: Partial<IAagentCaseInfo> = req.body;

  try {
    const modifiedAgent = await agentCaseInfo.findByIdAndUpdate(agentId, updatedAgentData, { new: true });
    res.status(200).json({ message: 'agent case info modified successfully.', modifiedAgent });
  } catch (error) {
    console.error('Error modifying agent case info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAgentCaseInfo = async (req: Request, res: Response) => {
  const agentId = req.params.id;

  try {
    await agentCaseInfo.findByIdAndDelete(agentId);
    res.status(200).json({ message: 'Agent case info deleted successfully.' });
  } catch (error) {
    console.error('Error deleting agent case info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
