import { Router } from "express";
import { logoutUser, login, getCallback, testAuth, isAuthenticated } from "../controllers/authRoutes"; // Adjust the import path as necessary
  
const router = Router();

// Google login route
router.route("/google").get(login);

// Callback route for Google OAuth
router.route("/google/callback").get(getCallback);

router.route("/me").get(isAuthenticated);

// Logout
router.route("/logout").get(logoutUser);

// Test authentication route
router.route("/authTest").get(testAuth);


export default router as Router;