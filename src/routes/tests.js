"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cases_1 = require("../controllers/cases");
const authRoutes_1 = require("../controllers/authRoutes"); // Adjust the import path as necessary
const router = (0, express_1.Router)();
router.route("/").get(cases_1.getAllCases).post(cases_1.addCase);
router.route("/authTest").get(authRoutes_1.testAuth);
router.route("/:id").get(cases_1.getCaseById).post(cases_1.modifyCase).delete(cases_1.deleteCase);
exports.default = router;
