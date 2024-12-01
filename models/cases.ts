import mongoose, { Document, Model, Schema  } from 'mongoose';

export interface Icases extends Document {
    name: string;
    billing: number;
    state: string;
    type: string;
    create_date: Date;
}

const casesSchema: Schema<Icases> = new Schema<Icases>({
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

const Cases: Model<Icases> = mongoose.model<Icases>('Cases', casesSchema);

export default Cases;