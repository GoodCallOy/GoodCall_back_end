import { Router } from "express";
import { getAllAgents, addAgent, getAgentById, modifyAgent, deleteAgent, getAgentByName } from "../controllers/agent";

const router = Router();

router.route("/").get(getAllAgents).post(addAgent);

router.route("/:id").get(getAgentById).post(modifyAgent).delete(deleteAgent);

router.get('/:name', getAgentByName);

export default router as Router;
