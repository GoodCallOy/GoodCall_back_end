// ../types/IUser.ts
import { Document } from "mongoose";

interface IUser extends Document {
    _id: string;
    googleId: string;
    name: string;
    email?: string;
    avatar: string;
    linkedUserId?: string;
    access?: string;
    role?: string;
}

export default IUser; // <-- Default export
