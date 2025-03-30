import express from 'express';
import cors from 'cors';
import { port, host } from './serverConfig.json';
import session from "express-session";
import passport from "./src/auth/passport";
import connectDB from './src/db/dbConnection';
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

// Import routers
import caseRouter from './src/routes/cases';
import testRouter from './src/routes/tests';
import agentStatsRouter from './src/routes/agentStats';
import agentRouter from './src/routes/agent';
import agentGoalsRouter from './src/routes/agentGoals';
import authRoutes from "./src/routes/authRoutes";
import userRoutes from "./src/routes/user";

dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string, // Keep secret in .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO2_URI, // Use your MongoDB connection string
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: ["http://localhost:8080", "https://goodcall.fi", "https://goodcall-front-end.onrender.com"], // Allow these origins
    credentials: true, // Allow cookies/session authentication
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());

// Prevent caching responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});


// Define API 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/test", testRouter);
app.use('/api/v1/agentstats', agentStatsRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/cases', caseRouter);
app.use('/api/v1/agentgoals', agentGoalsRouter);

app.use("/api/v1/user", userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
