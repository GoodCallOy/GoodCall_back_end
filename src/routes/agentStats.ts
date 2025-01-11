import { Router } from "express";
import { getAllAgentStats, addAgentStats, getAgentStatsById, modifyAgentStats, deleteAgentStats } from "../controllers/agentStats";

const router = Router();

router.route("/").get(getAllAgentStats).post(addAgentStats);

router.route("/:id").get(getAgentStatsById).post(modifyAgentStats).delete(deleteAgentStats);

export default router as Router;
