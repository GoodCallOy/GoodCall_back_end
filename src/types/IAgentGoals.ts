import { Document } from "mongoose";

interface IAgentGoals extends Document {
    agent: string;
    case: string;
    goal: string;
    goal_date: Date;
    type: string;
    monthKey: string;
    create_date: Date;
}

export default IAgentGoals;
