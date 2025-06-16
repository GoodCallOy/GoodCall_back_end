"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dailyLogController_1 = require("../controllers/dailyLogController");
const router = express_1.default.Router();
// GET /api/daily-logs - Get all logs
router.get('/', dailyLogController_1.getAllDailyLogs);
// GET /api/daily-logs/agent/:agentId - Get logs by agent ID
router.get('/agent/:agentId', dailyLogController_1.getLogsByAgentId);
// POST /api/daily-logs - Create a new log
router.post('/', dailyLogController_1.addDailyLog);
// PUT /api/daily-logs/:id - Update a log
router.put('/:id', dailyLogController_1.updateDailyLog);
// DELETE /api/daily-logs/:id - Delete a log
router.delete('/:id', dailyLogController_1.deleteDailyLog);
exports.default = router;
