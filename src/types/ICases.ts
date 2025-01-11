import { Document } from "mongoose";

interface ICases extends Document {
    name: string;
    billing: number;
    create_date: Date;
}

export default ICases;
