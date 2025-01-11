import { Router } from "express";
import { getAllCases, addCase, getCaseById, modifyCase, deleteCase } from "../controllers/cases";

const router = Router();

router.route("/").get(getAllCases).post(addCase);

router.route("/:id").get(getCaseById).post(modifyCase).delete(deleteCase);

export default router as Router;
