"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_1 = require("../controllers/agent");
const router = (0, express_1.Router)();
router.route("/").get(agent_1.getAllAgents).post(agent_1.addAgent);
router.route("/:id").get(agent_1.getAgentById).post(agent_1.modifyAgent).delete(agent_1.deleteAgent);
router.get('/:name', agent_1.getAgentByName);
exports.default = router;
