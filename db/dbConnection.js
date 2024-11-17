"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require('dotenv').config();
const options = {
    authSource: 'admin',
    user: `${process.env.MONGO_USER}`,
    pass: `${process.env.MONGO_PASS}`,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(`${process.env.MONGO_URI}`, options);
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
};
exports.default = connectDB;
