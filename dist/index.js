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
const dbConnection_1 = __importDefault(require("./db/dbConnection"));
(0, dbConnection_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const cases_1 = __importDefault(require("./routes/cases"));
const agentStats_1 = __importDefault(require("./routes/agentStats"));
const agent_1 = __importDefault(require("./routes/agent"));
app.use('/api/v1/agentStats', agentStats_1.default);
app.use('/api/v1/agent', agent_1.default);
app.use('/api/v1/cases', cases_1.default);
app.listen(serverConfig_json_1.port, () => {
  console.log(`Server is listening on port ${serverConfig_json_1.port}...`);
});