"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = require("../controllers/authRoutes"); // Adjust the import path as necessary
const router = (0, express_1.Router)();
// Google login route
router.route("/google").get(authRoutes_1.login);
// Callback route for Google OAuth
router.route("/google/callback").get(authRoutes_1.getCallback);
router.route("/me").get(authRoutes_1.isAuthenticated);
// Logout
router.route("/logout").get(authRoutes_1.logoutUser);
// Test authentication route
router.route("/authTest").get(authRoutes_1.testAuth);
exports.default = router;
