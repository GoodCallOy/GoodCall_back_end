import { Request, Response } from "express";
import AgentGoals from "../models/agentGoals";
import IAgentGoals from "../types/IAgentGoals";
export const getAllAgentGoals = async (req: Request, res: Response) => {
  try {
    console.log("getting all agents");
    const allAgents = await AgentGoals.find();
    console.log("all agents found", allAgents);

    res.status(200).json(allAgents);
  } catch (err: any) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// Get a single job by ID
export const getAgentGoalsById = async (req: Request, res: Response) => {
  const agentId = req.params.id;

  try {
    console.log("getting agent goals by id", agentId);
    const agent: IAgentGoals | null = await AgentGoals.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'agent goals Id not found' });
    }
    res.status(200).json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addAgentGoals = async (req: Request, res: Response) => {
  try {
    console.log("agent goals object:", req.body);

    // Create a new agent using the data from the request body
    const newAgent = new AgentGoals({
      agent: req.body.agent,
      goal: req.body.goal,
      goal_date: req.body.goal_date,
      type: req.body.type,
    });

    // Save the new agent to the database
    await newAgent.save();

    res.status(200).json({
      status: 200,
      message: "Agent goals saved successfully",
      agent: newAgent,
    });
  } catch (err: any) {
    console.error("Error adding agent goals:", err.message);
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

export const modifyAgentGoals = async (req: Request, res: Response) => {
  const agentId = req.params.id;
  const updatedAgentData: Partial<IAgentGoals> = req.body;

  try {
    const modifiedAgent = await AgentGoals.findByIdAndUpdate(agentId, updatedAgentData, { new: true });
    res.status(200).json({ message: 'agent goals modified successfully.', modifiedAgent });
  } catch (error) {
    console.error('Error modifying agent goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAgentGoals = async (req: Request, res: Response) => {
  const agentId = req.params.id;

  try {
    await AgentGoals.findByIdAndDelete(agentId);
    res.status(200).json({ message: 'Agent goals deleted successfully.' });
  } catch (error) {
    console.error('Error deleting agent goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
