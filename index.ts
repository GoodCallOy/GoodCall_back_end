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
import agentCaseInfoRouter from './src/routes/agentCaseInfo';
import agentRouter from './src/routes/agent';
import agentGoalsRouter from './src/routes/agentGoals';
import authRoutes from "./src/routes/authRoutes";
import userRoutes from "./src/routes/user";
import cookieParser from 'cookie-parser'

dotenv.config();

// Connect to the database
connectDB();

const app = express();

app.use(cookieParser())
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string, // Keep secret in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set to true in production to use HTTPS
      sameSite: 'none', // Allow cross-origin cookies
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
      "http://localhost:8080",
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
  next();
});


// Define API 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/test", testRouter);
app.use('/api/v1/agentstats', agentStatsRouter);
app.use('/api/v1/agentCaseInfo', agentCaseInfoRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/cases', caseRouter);
app.use('/api/v1/agentgoals', agentGoalsRouter);


app.use("/api/v1/user", userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});