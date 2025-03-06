import { Router } from "express";
import { getAllAgentGoals, getAgentGoalsById, addAgentGoals, modifyAgentGoals, deleteAgentGoals } from "../controllers/agentGoals";

const router = Router();

router.route("/").get(getAllAgentGoals).post(addAgentGoals);

router.route("/:id").get(getAgentGoalsById).post(modifyAgentGoals).delete(deleteAgentGoals);

export default router as Router;
