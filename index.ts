import express from 'express';
import cors from 'cors';
import { port, host } from './serverConfig.json';
import session from "express-session";
import passport from "./src/auth/passport";
import connectDB from './src/db/dbConnection';
import { ensureDefaultCaseTypes } from './src/models/caseType'
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import https from 'https';
import fs from 'fs';

// Import routers

import caseRouter from './src/routes/caseRoutes';
import gcAgentRouter from './src/routes/gcAgentRoutes';
import orderRouter from './src/routes/orderRoutes';
import casesRouter from './src/routes/cases';
import testRouter from './src/routes/tests';
import agentStatsRouter from './src/routes/agentStats';
import agentCaseInfoRouter from './src/routes/agentCaseInfo';
import agentRouter from './src/routes/agent';
import agentGoalsRouter from './src/routes/agentGoals';
import authRoutes from "./src/routes/authRoutes";
import userRoutes from "./src/routes/user";
import cookieParser from 'cookie-parser'
import dailyLogRoutes from './src/routes/dailyLogRoutes'
import caseTypeRoutes from './src/routes/caseTypeRoutes'
import weekConfigurationRoutes from './src/routes/weekConfigurationRoutes'
import weekConfigRoutes from './src/routes/weekConfigRoutes'
import openSysRoutes from './src/routes/openSysRoutes'

dotenv.config();

// Connect to the database
connectDB();
ensureDefaultCaseTypes().catch(err => console.error('CaseTypes seed failed:', err))

const app = express();

app.use(cookieParser())
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Required when running behind a proxy/edge (e.g., Render) to honor X-Forwarded-* headers
// Ensures req.secure is true when the original request was HTTPS so secure cookies are set/sent
app.set('trust proxy', 1)

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string, // Keep secret in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Lax in dev to help Firefox
      httpOnly: true, // Prevent JavaScript from accessing the cookie
      maxAge: 24 * 60 * 60 * 1000, // Session expires after 1 day
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO2_URI, // Use your MongoDB connection string
      collectionName: "sessions",
    }),
  })
);

app.use(
  cors({
    origin: [
      "https://localhost:8080",
      "https://goodcall.fi",
      "https://goodcall-front-end.onrender.com"
    ],
    credentials: true, // Allow cookies
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization", // ✅ Add Authorization header
  })
);

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());


// Prevent caching responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader(
  'Content-Security-Policy',
  [
    "default-src 'self'",
    "img-src 'self' data: https://goodcall-back-end.onrender.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self' https://accounts.google.com",
    "connect-src 'self' https://goodcall-back-end.onrender.com https://www.googleapis.com https://accounts.google.com",
  ].join('; ')
)
  next();
});


// Define API 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/test", testRouter);
app.use('/api/v1/agentstats', agentStatsRouter);
app.use('/api/v1/agentCaseInfo', agentCaseInfoRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/cases', casesRouter);
app.use('/api/v1/agentgoals', agentGoalsRouter);
app.use('/api/v1/gcCases', caseRouter);
app.use('/api/v1/gcAgents', gcAgentRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/dailyLogs', dailyLogRoutes)
app.use('/api/v1', caseTypeRoutes)
app.use('/api/v1/week-configurations', weekConfigurationRoutes);
app.use('/api/v1/week-config', weekConfigRoutes);
app.use('/api/v1/openSys', openSysRoutes);

app.use("/api/v1/user", userRoutes);

// Start the server
if (process.env.NODE_ENV === 'development') {
  const sslOptions = {
    key: fs.readFileSync('C:\\Users\\j_dan\\server.key'),
    cert: fs.readFileSync('C:\\Users\\j_dan\\server.cert'),
  };

  https.createServer(sslOptions, app).listen(port, () => {
    console.log(`HTTPS server is listening on https://localhost:${port}...`);
  });
} else {
  app.listen(port, () => {
    console.log(`HTTP server is listening on http://localhost:${port}...`);
  });
}
