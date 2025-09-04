import { Router } from "express";
import {
  getAllUsers,
  createUser,
  getCurrentUser,
  logoutUser,
  updatedUser
} from "../controllers/users";

const router = Router();

// Routes for getting and creating users
router.route("/")
  .get(getAllUsers)         // Get all users
  .post(createUser);        // Create a new user

router.route("/:id")
  .put(updatedUser);        // Update user by ID

// Route to get the currently authenticated user
router.route("/me")
  .get(getCurrentUser);      // Get current logged-in user

// Route for logging out the user
router.route("/logout")
  .get(logoutUser);          // Logout user

export default router as Router;