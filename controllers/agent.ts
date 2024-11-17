import { Request, Response } from "express";
import Agent from "../models/agent";
import { IAgent } from "../models/agent";
export const getAllAgents = async (req: Request, res: Response) => {
  try {
    console.log("getting all agents");
    const allJobs = await Agent.find();
    console.log("all agents found");

    res.status(200).json(allJobs);
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
    const job: IAgent | null = await Agent.findById(agentId);
    if (!job) {
      return res.status(404).json({ error: 'agentId not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addAgent = async (req: Request, res: Response) => {
  try {
    const newJob = new Agent({
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
  } catch (err: any) {
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
