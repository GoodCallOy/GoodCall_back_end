"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const express_1 = require("express");
const agentStats_1 = require("../controllers/agentStats");
const router = (0, express_1.Router)();
router.route("/").get(agentStats_1.getAllAgentStats).post(agentStats_1.addAgentStats);
router.route("/:id").get(agentStats_1.getAgentStatsById).post(agentStats_1.modifyAgentStats).delete(agentStats_1.deleteAgentStats);
exports.default = router;