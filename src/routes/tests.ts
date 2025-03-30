import { Router } from "express";
import { getAllCases, addCase, getCaseById, modifyCase, deleteCase } from "../controllers/cases";
import { testAuth } from "../controllers/authRoutes"; // Adjust the import path as necessary


const router = Router();

router.route("/").get(getAllCases).post(addCase);

router.route("/authTest").get(testAuth);

router.route("/:id").get(getCaseById).post(modifyCase).delete(deleteCase);


export default router as Router;
