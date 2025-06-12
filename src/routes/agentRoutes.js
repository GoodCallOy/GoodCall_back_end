"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agentController_1 = require("../controllers/agentController");
const router = express_1.default.Router();
router.get('/', agentController_1.getAllAgents);
router.get('/:id', agentController_1.getAgentById);
router.post('/', agentController_1.addAgent);
router.put('/:id', agentController_1.modifyAgent);
router.delete('/:id', agentController_1.deleteAgent);
exports.default = router;
