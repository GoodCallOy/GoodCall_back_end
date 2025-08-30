// models/user.ts
import mongoose, { Schema, Model } from "mongoose";
import IUser from "../types/IUser"; // Correctly import IUser

const UserSchema = new Schema({
  googleId: { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  email:    { type: String, unique: true },
  avatar:   { type: String, required: true },
  access:   { type: String },
  role:     { type: String, enum: ['admin', 'manager', 'caller'], default: 'caller', required: true },

  // link to your gcAgent record (nullable)
  agentId:    { type: Schema.Types.ObjectId, ref: 'gcAgent', default: null, index: true },
}, { timestamps: true });


const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema); // Ensure User implements IUser interface

export default User;
