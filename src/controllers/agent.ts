import { Request, Response } from "express";
import Agent from "../models/agent";
import IAgent from "../types/IAgentStats";
export const getAllAgents = async (req: Request, res: Response) => {
  try {
    const allAgents = await Agent.find();
    res.status(200).json(allAgents);
  } catch (err: any) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// Get a single job by ID
export const getAgentById = async (req: Request, res: Response) => {
  const agentId = req.params.id;

  try {
    console.log("getting agent by id", agentId);
    const agent: IAgent | null = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'agentId not found' });
    }
    res.status(200).json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getAgentByName = async (req: Request, res: Response) => {
  const agentName = req.params.name;

  try {
    console.log("Getting agent by name:", agentName);
    
    const agent = await Agent.findOne({ name: agentName });

    if (!agent) {
      return res.status(404).json({ error: 'Agent name not found' });
    }

    res.status(200).json(agent);
  } catch (error) {
    console.error("Error fetching agent by name:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const addAgent = async (req: Request, res: Response) => {
  try {

    // Create a new agent using the data from the request body
    const newAgent = new Agent({
      name: req.body.name,
      cases: req.body.cases,
      position: req.body.position,
      create_date: req.body.create_date, // Optional, defaults to Date.now if not provided
    });

    // Save the new agent to the database
    await newAgent.save();

    res.status(200).json({
      status: 200,
      message: "Agent saved successfully",
      agent: newAgent,
    });
  } catch (err: any) {
    console.error("Error adding agent:", err.message);
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

export const modifyAgent = async (req: Request, res: Response) => {
  const agentId = req.params.id;
  const updatedAgentData: Partial<IAgent> = req.body;

  try {
    const modifiedAgent = await Agent.findByIdAndUpdate(agentId, updatedAgentData, { new: true });
    res.status(200).json({ message: 'agent modified successfully.', modifiedAgent });
  } catch (error) {
    console.error('Error modifying agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  const agentId = req.params.id;

  try {
    await Agent.findByIdAndDelete(agentId);
    res.status(200).json({ message: 'Agent deleted successfully.' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
