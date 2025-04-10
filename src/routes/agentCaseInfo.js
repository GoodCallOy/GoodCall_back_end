"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentCaseInfo_1 = require("../controllers/agentCaseInfo");
const router = (0, express_1.Router)();
router.route("/:agent").get(agentCaseInfo_1.getAgentCaseInfoByAgentAndMonth);
router.route("/").get(agentCaseInfo_1.getAllAgentCaseInfo).post(agentCaseInfo_1.addAgentCaseInfo);
router.route("/:id").get(agentCaseInfo_1.getAgentCaseInfoById).post(agentCaseInfo_1.getAgentCaseInfoByAgentAndMonth).delete(agentCaseInfo_1.modifyAgentCaseInfo);
exports.default = router;
