import { Router } from "express";
import { getAllAgentCaseInfo, getAgentCaseInfoById, addAgentCaseInfo, getAgentCaseInfoByAgentAndMonth, modifyAgentCaseInfo } from "../controllers/agentCaseInfo";

const router = Router();

router.route("/:agent").get(getAgentCaseInfoByAgentAndMonth)

router.route("/").get(getAllAgentCaseInfo).post(addAgentCaseInfo);

router.route("/:id").get(getAgentCaseInfoById).post(getAgentCaseInfoByAgentAndMonth).delete(modifyAgentCaseInfo);


export default router as Router;
