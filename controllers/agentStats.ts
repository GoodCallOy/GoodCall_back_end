import { Request, Response } from "express";
import AgentStats from "../models/agentStats";
import IAgent from "../types/IAgentStats";
export const getAllAgentStats = async (req: Request, res: Response) => {
  try {
    console.log("getting all agents");
    const allAgents = await AgentStats.find();
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
export const getAgentStatsById = async (req: Request, res: Response) => {
  const agentId = req.params.id;

  try {
    console.log("getting agent by id", agentId);
    const agent: IAgent | null = await AgentStats.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'agentId not found' });
    }
    res.status(200).json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addAgentStats = async (req: Request, res: Response) => {
  try {
    console.log("agent object:", req.body);

    // Create a new agent using the data from the request body
    const newAgent = new AgentStats({
      name: req.body.name,
      meetings: req.body.meetings,
      call_time: req.body.call_time,
      calls_made: req.body.calls_made,
      outgoing_calls: req.body.outgoing_calls,
      answered_calls: req.body.answered_calls,
      response_rate: req.body.response_rate,
      case: req.body.case,
      callingdate: req.body.callingdate,
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

export const modifyAgentStats = async (req: Request, res: Response) => {
  const agentId = req.params.id;
  const updatedAgentData: Partial<IAgent> = req.body;

  try {
    const modifiedAgent = await AgentStats.findByIdAndUpdate(agentId, updatedAgentData, { new: true });
    res.status(200).json({ message: 'agent modified successfully.', modifiedAgent });
  } catch (error) {
    console.error('Error modifying agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAgentStats = async (req: Request, res: Response) => {
  const agentId = req.params.id;

  try {
    await AgentStats.findByIdAndDelete(agentId);
    res.status(200).json({ message: 'Agent deleted successfully.' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
