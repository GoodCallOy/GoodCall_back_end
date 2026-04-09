import { Request, Response } from "express";
import User from "../models/user";
import { Types } from "mongoose";
import { AuthRequest } from "../types/express"; // Ensure you're using the correct type

export const getCurrentUser = async (req: Request, res: Response) => {
  console.log("🔵 getCurrentUser called");
     if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const doc = await User.findById((req.user as any).id).lean();
    if (!doc) return res.status(404).json({ message: 'User not found' });
    res.json(doc);
  };
// ✅ Update user data
export const updatedUser = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
  
    try {
      // Type req.body to match the User model fields
      console.log("🔵 updatedUser called with body:", req.body);

      const body: any = { ...req.body };

      // Normalize linkedUserId: expect a User _id string, store as ObjectId or null
      if (body.linkedUserId !== undefined) {
        const raw = body.linkedUserId;
        if (raw && typeof raw === 'string' && Types.ObjectId.isValid(raw)) {
          body.linkedUserId = new Types.ObjectId(raw);
        } else if (raw === null || raw === '' || raw === undefined) {
          body.linkedUserId = null;
        } else {
          console.warn('updatedUser: invalid linkedUserId received, setting to null', raw);
          body.linkedUserId = null;
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        body._id, // req.user should be typed as IUser here
        body, // Make sure body contains the correct fields
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("✅ User updated:", updatedUser);
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

          const FRONTEND_URL =
          process.env.NODE_ENV === "production"
              ? "https://goodcall-front-end.onrender.com/#/login"
              : "https://localhost:8080/#/login";

        console.log("FRONTEND_URL", FRONTEND_URL);
        res.redirect(FRONTEND_URL);

        });
      });
    };

// ✅ Create a new user if not exists
export const createUser = async (req: Request, res: Response) => {
  try {
    const { googleId, name, email, avatar, access } = req.body;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = new User({ googleId, name, email, avatar, linkedUserId: null, access });
      await user.save();
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// ✅ Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
  console.log("🔵 getAllUsers called");
  try {
    const users = await User.find();
    console.log("✅ Fetched users:", users);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};
