import mongoose from 'mongoose';

require('dotenv').config();

const options = {
  authSource: 'admin',
  user: `${process.env.MONGO_USER}`,
  pass: `${process.env.MONGO_PASS}`,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(`${process.env.MONGO1_URI}`, options);
    console.log('Connected to MongoDB');
   
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
};

export default connectDB;
