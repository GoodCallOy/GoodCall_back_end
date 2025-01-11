"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var express_1 = require("express");
var cases_1 = require("../controllers/cases");
var router = (0, express_1.Router)();
router.route("/").get(cases_1.getAllCases).post(cases_1.addCase);
router.route("/:id").get(cases_1.getCaseById).post(cases_1.modifyCase)["delete"](cases_1.deleteCase);
exports["default"] = router;