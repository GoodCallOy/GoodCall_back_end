"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gcAgentController_1 = require("../controllers/gcAgentController");
const router = express_1.default.Router();
// POST /api/agents - Create a new agent
router.post('/', gcAgentController_1.createAgent);
// GET /api/agents - Get all agents
router.get('/', gcAgentController_1.getAllAgents);
// GET /api/agents/:id - Get one agent by ID
router.get('/:id', gcAgentController_1.getAgentById);
// PUT /api/agents/:id - Update an agent
router.put('/:id', gcAgentController_1.updateAgent);
// DELETE /api/agents/:id - Delete an agent
router.delete('/:id', gcAgentController_1.deleteAgent);
exports.default = router;
