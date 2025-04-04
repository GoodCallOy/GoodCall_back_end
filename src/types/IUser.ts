// ../types/IUser.ts
import { Document } from "mongoose";

interface IUser extends Document {
    _id: string;
    googleId: string;
    name: string;
    email?: string;
    avatar: string;
    access?: string;
}

export default IUser; // <-- Default export
