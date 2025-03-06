import { Document } from "mongoose";

interface ICases extends Document {
    name: string;
    billing: number;
    state: string;
    type: string;
    create_date: Date;
}

export default ICases;
