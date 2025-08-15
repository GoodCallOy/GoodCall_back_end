// models/user.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import IUser from "../types/IUser"; // Correctly import IUser

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  avatar: { type: String, required: true },
  access: { type: String },
  role: { type: String }
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema); // Ensure User implements IUser interface

export default User;
