"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentGoals_1 = require("../controllers/agentGoals");
const router = (0, express_1.Router)();
router.route("/:agent").get(agentGoals_1.getAgentGoalsByAgentAndMonth);
router.route("/").get(agentGoals_1.getAllAgentGoals).post(agentGoals_1.addAgentGoals);
router.route("/:id").get(agentGoals_1.getAgentGoalsById).post(agentGoals_1.modifyAgentGoals).delete(agentGoals_1.deleteAgentGoals);
exports.default = router;
