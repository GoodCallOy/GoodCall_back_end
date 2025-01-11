"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var express_1 = require("express");
var agent_1 = require("../controllers/agent");
var router = (0, express_1.Router)();
router.route("/").get(agent_1.getAllAgents).post(agent_1.addAgent);
router.route("/:id").get(agent_1.getAgentById).post(agent_1.modifyAgent)["delete"](agent_1.deleteAgent);
exports["default"] = router;