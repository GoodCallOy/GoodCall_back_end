import { Types } from 'mongoose';

export interface IWeek {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  notes?: string;
}

export interface IWeekConfiguration {
  _id?: Types.ObjectId;
  year: number;
  month: number;
  weeks: IWeek[];
  createdBy: Types.ObjectId;
  lastModifiedBy?: Types.ObjectId;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWeekConfigurationCreate {
  year: number;
  month: number;
  weeks: Omit<IWeek, 'isActive'>[];
  isDefault?: boolean;
  notes?: string;
}

export interface IWeekConfigurationUpdate {
  year?: number;
  month?: number;
  weeks?: Omit<IWeek, 'isActive'>[];
  isDefault?: boolean;
  notes?: string;
}

export interface IWeekConfigurationQuery {
  year?: number;
  month?: number;
  isActive?: boolean;
  isDefault?: boolean;
  createdBy?: string;
}
