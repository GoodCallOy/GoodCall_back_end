import mongoose, { Schema, Document, Model } from "mongoose";
import IUser from "../types/IUser";

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  avatar: { type: String, required: true },
  access: { type: String }
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
