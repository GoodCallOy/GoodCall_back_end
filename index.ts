import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import cors from 'cors';

import { port, host } from './serverConfig.json';


import connectDB from './db/dbConnection';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

import caseRouter from './routes/cases';
import agentStatsRouter from './routes/agentStats';
import agentRouter from './routes/agent';

app.use('/api/v1/agentStats', agentStatsRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/cases', caseRouter);


app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
