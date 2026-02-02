import { Router } from "express";
import {
  getAllAgentGoals,
  getAgentGoalsById,
  addAgentGoals,
  modifyAgentGoals,
  deleteAgentGoals,
  getAgentGoalsByAgentAndMonth,
} from "../controllers/agentGoals";

const router = Router();

// List goals (optional query: agentId, orderId, monthKey) — GET /api/v1/agentGoals?agentId=xxx&monthKey=2025-01
router.get("/", getAllAgentGoals);
// Create/upsert weekly goal — POST /api/v1/agentGoals/
router.post("/", addAgentGoals);

// Legacy: by agent name and month — GET /api/v1/agentGoals/by-agent/:agent?month=2025-01
router.get("/by-agent/:agent", getAgentGoalsByAgentAndMonth);

// Single document by ID
router.get("/:id", getAgentGoalsById);
router.patch("/:id", modifyAgentGoals);
router.delete("/:id", deleteAgentGoals);

export default router as Router;
