import { Router } from "express";
import {
  getAllUsers,
  createUser,
  getCurrentUser,
  logoutUser
} from "../controllers/users";

// ✅ Extending Request type to include user
import { AuthRequest } from "../types/express"; // Make sure you have the correct path for this file

const router = Router();

// Routes for getting and creating users
router.route("/")
  .get(getAllUsers)         // Get all users
  .post(createUser);        // Create a new user

// Route to get the currently authenticated user
router.route("/me")
  .get(getCurrentUser);      // Get current logged-in user

// Route for logging out the user
router.route("/logout")
  .get(logoutUser);          // Logout user

export default router;
