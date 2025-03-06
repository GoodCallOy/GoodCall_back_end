import mongoose, { Document, Model, Schema  } from 'mongoose';
import ICases from '../types/ICases';

const casesSchema: Schema<ICases> = new Schema<ICases>({
    name: {
      type: String,
      required: true,
    },
    billing: {
      type: Number,
      required: false,
    },
    state: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    create_date: {
      type: Date,
      default: Date.now,
    },
});

const Cases: Model<ICases> = mongoose.model<ICases>('Cases', casesSchema);

export default Cases;