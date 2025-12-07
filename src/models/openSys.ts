import mongoose, { Schema, Model } from 'mongoose';
import IOpenSys from '../types/IOpenSys';

const OpenSysSchema = new Schema<IOpenSys>(
  {
    phoneNumber: { type: String },
    businessId: { type: String }, // Y-tunnus
    company: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    city: { type: String },
    email: { type: String },
    website: { type: String },
    used: { type: Schema.Types.Mixed }, // Can be Date or string
    result: { type: String },
    resultDate: { type: Schema.Types.Mixed }, // Can be Date or string
    comments: { type: String },
    title: { type: String },
    industry: { type: String },
    staffClass: { type: String },
    revenueClass: { type: String },
    postalCode: { type: String },
    mobileNumber: { type: String },
    importMessage: { type: String },
    companyLanguage: { type: String },
  },
  { 
    timestamps: true,
    collection: 'opensys' // Explicitly set collection name
  }
);

const OpenSys: Model<IOpenSys> = mongoose.model<IOpenSys>('OpenSys', OpenSysSchema);

export default OpenSys;

