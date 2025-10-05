"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const serverConfig_json_1 = require("./serverConfig.json");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./src/auth/passport"));
const dbConnection_1 = __importDefault(require("./src/db/dbConnection"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const dotenv_1 = __importDefault(require("dotenv"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
// Import routers
const caseRoutes_1 = __importDefault(require("./src/routes/caseRoutes"));
const gcAgentRoutes_1 = __importDefault(require("./src/routes/gcAgentRoutes"));
const orderRoutes_1 = __importDefault(require("./src/routes/orderRoutes"));
const cases_1 = __importDefault(require("./src/routes/cases"));
const tests_1 = __importDefault(require("./src/routes/tests"));
const agentStats_1 = __importDefault(require("./src/routes/agentStats"));
const agentCaseInfo_1 = __importDefault(require("./src/routes/agentCaseInfo"));
const agent_1 = __importDefault(require("./src/routes/agent"));
const agentGoals_1 = __importDefault(require("./src/routes/agentGoals"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const user_1 = __importDefault(require("./src/routes/user"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dailyLogRoutes_1 = __importDefault(require("./src/routes/dailyLogRoutes"));
const weekConfigurationRoutes_1 = __importDefault(require("./src/routes/weekConfigurationRoutes"));
const weekConfigRoutes_1 = __importDefault(require("./src/routes/weekConfigRoutes"));
dotenv_1.default.config();
// Connect to the database
(0, dbConnection_1.default)();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Required when running behind a proxy/edge (e.g., Render) to honor X-Forwarded-* headers
// Ensures req.secure is true when the original request was HTTPS so secure cookies are set/sent
app.set('trust proxy', 1);
// Session middleware
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET, // Keep secret in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Lax in dev to help Firefox
        httpOnly: true, // Prevent JavaScript from accessing the cookie
        maxAge: 24 * 60 * 60 * 1000, // Session expires after 1 day
    },
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO2_URI, // Use your MongoDB connection string
        collectionName: "sessions",
    }),
}));
app.use((0, cors_1.default)({
    origin: [
        "https://localhost:8080",
        "https://goodcall.fi",
        "https://goodcall-front-end.onrender.com"
    ],
    credentials: true, // Allow cookies
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization", // ✅ Add Authorization header
}));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Prevent caching responses
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "img-src 'self' data: https://goodcall-back-end.onrender.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "script-src 'self' https://accounts.google.com",
        "connect-src 'self' https://goodcall-back-end.onrender.com https://www.googleapis.com https://accounts.google.com",
    ].join('; '));
    next();
});
// Define API 
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/test", tests_1.default);
app.use('/api/v1/agentstats', agentStats_1.default);
app.use('/api/v1/agentCaseInfo', agentCaseInfo_1.default);
app.use('/api/v1/agent', agent_1.default);
app.use('/api/v1/cases', cases_1.default);
app.use('/api/v1/agentgoals', agentGoals_1.default);
app.use('/api/v1/gcCases', caseRoutes_1.default);
app.use('/api/v1/gcAgents', gcAgentRoutes_1.default);
app.use('/api/v1/orders', orderRoutes_1.default);
app.use('/api/v1/dailyLogs', dailyLogRoutes_1.default);
app.use('/api/v1/week-configurations', weekConfigurationRoutes_1.default);
app.use('/api/v1/week-config', weekConfigRoutes_1.default);
app.use("/api/v1/user", user_1.default);
// Start the server
if (process.env.NODE_ENV === 'development') {
    const sslOptions = {
        key: fs_1.default.readFileSync('C:\\Users\\j_dan\\server.key'),
        cert: fs_1.default.readFileSync('C:\\Users\\j_dan\\server.cert'),
    };
    https_1.default.createServer(sslOptions, app).listen(serverConfig_json_1.port, () => {
        console.log(`HTTPS server is listening on https://localhost:${serverConfig_json_1.port}...`);
    });
}
else {
    app.listen(serverConfig_json_1.port, () => {
        console.log(`HTTP server is listening on http://localhost:${serverConfig_json_1.port}...`);
    });
}
