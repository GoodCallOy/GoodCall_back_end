"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const router = (0, express_1.Router)();
// Routes for getting and creating users
router.route("/")
    .get(users_1.getAllUsers) // Get all users
    .post(users_1.createUser); // Create a new user
// Route to get the currently authenticated user
router.route("/me")
    .get(users_1.getCurrentUser); // Get current logged-in user
// Route for logging out the user
router.route("/logout")
    .get(users_1.logoutUser); // Logout user
exports.default = router;
