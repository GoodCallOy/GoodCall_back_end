import { Request } from "express";
import IUser from "./IUser";

export interface AuthRequest extends Request {
  user?: IUser; // Add user to the request object, if authenticated
}