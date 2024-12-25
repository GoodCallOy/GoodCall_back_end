import { Router } from "express";
import { getAllAgents, addAgent, getAgentById, modifyAgent, deleteAgent } from "../controllers/agent";

const router = Router();

router.route("/").get(getAllAgents).post(addAgent);

router.route("/:id").get(getAgentById).post(modifyAgent).delete(deleteAgent);

export default router as Router;
