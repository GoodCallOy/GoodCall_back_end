import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import { port, host } from './serverConfig.json';
import connectDB from './src/db/dbConnection';

// Connect to the database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Prevent caching responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Import routers
import caseRouter from './src/routes/cases';
import agentStatsRouter from './src/routes/agentStats';
import agentRouter from './src/routes/agent';
import agentGoalsRouter from './src/routes/agentGoals';

// Define API routes
app.use('/api/v1/agentstats', agentStatsRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/cases', caseRouter);
app.use('/api/v1/agentgoals', agentGoalsRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
