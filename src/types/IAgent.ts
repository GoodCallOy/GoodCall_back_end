import { Document } from "mongoose";

interface IAgent extends Document {
    name: string;
    cases: string[];
    position: string;
    create_date: Date;
}

export default IAgent;
