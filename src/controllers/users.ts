import { Request, Response } from "express";
import User from "../models/user";
import IUser from "../types/IUser";
import { AuthRequest } from "../types/express"; // Ensure you're using the correct type

export const getCurrentUser = (req: Request, res: Response) => {
    if (!req.user) {
      console.log("Not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }
    console.log("User authenticated");
    res.json(req.user);  // Return the authenticated user
  };
// ✅ Update user data
export const updatedUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
  
    try {
      // Type req.body to match the User model fields
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id, // req.user should be typed as IUser here
        req.body, // Make sure req.body contains the correct fields
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  };

// ✅ Logout user
export const logoutUser = (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).json({ message: "Session destruction failed" });
          }
          res.clearCookie('connect.sid'); // Clear session cookie
          console.log("🚪 cookie cleard");
          console.log("🚪 Logout successful"); 
          res.redirect("http://localhost:8080/login"); 
        });
      });
    };

// ✅ Create a new user if not exists
export const createUser = async (req: Request, res: Response) => {
  try {
    const { googleId, name, email, avatar, access } = req.body;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = new User({ googleId, name, email, avatar, access });
      await user.save();
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// ✅ Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};
