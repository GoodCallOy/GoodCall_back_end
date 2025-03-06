import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import cors from 'cors';

import { port, host } from './serverConfig.json';


import connectDB from './src/db/dbConnection';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

import caseRouter from './src/routes/cases';
import agentStatsRouter from './src/routes/agentStats';
import agentRouter from './src/routes/agent';
import agentGoalsRouter from './src/routes/agentGoals';

app.use('/api/v1/agentstats', agentStatsRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/cases', caseRouter);
app.use('/api/v1/agentgoals', agentGoalsRouter);


app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
