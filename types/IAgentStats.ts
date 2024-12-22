import { Document } from "mongoose";

interface IAgentStats extends Document {
    name: string;
    meetings: number;
    call_time: number;
    calls_made: number;
    outgoing_calls: number;
    answered_calls: number;
    response_rate: number;
    case: string;
    create_date: Date;
}

export default IAgentStats;
