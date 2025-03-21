import { Document } from "mongoose";

interface IUser extends Document {
    googleId: string;
    name: string;
    email?: string;
    avatar: string;
    access?: string;
}

export default IUser;
