import { Document } from "mongoose";

interface IAgentCaseInfo extends Document {
    agent: string;
    case: string;
    amount: string;
    amount_date: Date;
    type: string;
    monthKey: string;
    create_date: Date;
}

export default IAgentCaseInfo;
