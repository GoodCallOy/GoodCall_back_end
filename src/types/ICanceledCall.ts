import { Document } from "mongoose";

export interface ICanceledCall extends Document {
  callDate: Date;
  cancelDate: Date;
  agent: string;
  phoneNumber?: string;
  contactPerson?: string;
  case?: string;
  caseUnit?: string;
  rebookAgent?: string | null;
  rebookDate?: string | null;
  attempts?: number;
  comments?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Request body for POST /api/v1/canceledCalls */
export interface ICanceledCallCreateBody {
  callDate: string;       // YYYY-MM-DD
  cancelDate: string;     // YYYY-MM-DD
  agent: string;          // gcAgent ID
  phoneNumber?: string;
  contactPerson?: string;
  case?: string;           // order/case ID
  caseUnit?: string;
  rebookAgent?: string | null;
  rebookDate?: string | null;
  attempts?: number;
  comments?: string;
}
