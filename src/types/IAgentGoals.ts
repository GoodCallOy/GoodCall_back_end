import { Document } from "mongoose";

interface IAgentGoals extends Document {
    agent: string;
    goal: string;
    goal_date: Date;
    type: string;
    create_date: Date;
}

export default IAgentGoals;
