"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const serverConfig_json_1 = require("./serverConfig.json");
const dbConnection_1 = __importDefault(require("./src/db/dbConnection"));
// Connect to the database
(0, dbConnection_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Prevent caching responses
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
// Import routers
const cases_1 = __importDefault(require("./src/routes/cases"));
const agentStats_1 = __importDefault(require("./src/routes/agentStats"));
const agent_1 = __importDefault(require("./src/routes/agent"));
const agentGoals_1 = __importDefault(require("./src/routes/agentGoals"));
// Define API routes
app.use('/api/v1/agentstats', agentStats_1.default);
app.use('/api/v1/agent', agent_1.default);
app.use('/api/v1/cases', cases_1.default);
app.use('/api/v1/agentgoals', agentGoals_1.default);
// Start the server
app.listen(serverConfig_json_1.port, () => {
    console.log(`Server is listening on port ${serverConfig_json_1.port}...`);
});
