"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const serverConfig_json_1 = require("./serverConfig.json");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./src/auth/passport"));
const dbConnection_1 = __importDefault(require("./src/db/dbConnection"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routers
const cases_1 = __importDefault(require("./src/routes/cases"));
const agentStats_1 = __importDefault(require("./src/routes/agentStats"));
const agent_1 = __importDefault(require("./src/routes/agent"));
const agentGoals_1 = __importDefault(require("./src/routes/agentGoals"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const user_1 = __importDefault(require("./src/routes/user"));
dotenv_1.default.config();
// Connect to the database
(0, dbConnection_1.default)();
const app = (0, express_1.default)();
// Session middleware
app.use((0, express_session_1.default)({
  secret: process.env.SESSION_SECRET,
  // Keep secret in .env
  resave: false,
  saveUninitialized: false,
  store: connect_mongo_1.default.create({
    mongoUrl: process.env.MONGO2_URI,
    // Use your MongoDB connection string
    collectionName: "sessions"
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cors_1.default)({
  origin: ["http://localhost:8080", "https://goodcall.fi", "https://goodcall-front-end.onrender.com"],
  // Allow these origins
  credentials: true,
  // Allow cookies/session authentication
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));
app.use(express_1.default.json());
// Prevent caching responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
// Define API routes
app.use('/api/v1/agentstats', agentStats_1.default);
app.use('/api/v1/agent', agent_1.default);
app.use('/api/v1/cases', cases_1.default);
app.use('/api/v1/agentgoals', agentGoals_1.default);
app.use("/auth", authRoutes_1.default);
app.use("/user", user_1.default);
// Start the server
app.listen(serverConfig_json_1.port, () => {
  console.log(`Server is listening on port ${serverConfig_json_1.port}...`);
});