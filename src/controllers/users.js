"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.createUser = exports.logoutUser = exports.updatedUser = exports.getCurrentUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const getCurrentUser = (req, res) => {
    console.log("🔵 getCurrentUser called");
    if (!req.user) {
        console.log("Not authenticated");
        return res.status(401).json({ message: "Not authenticated" });
    }
    console.log("User authenticated");
    res.json(req.user); // Return the authenticated user
};
exports.getCurrentUser = getCurrentUser;
// ✅ Update user data
const updatedUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    try {
        // Type req.body to match the User model fields
        const updatedUser = await user_1.default.findByIdAndUpdate(req.user._id, // req.user should be typed as IUser here
        req.body, // Make sure req.body contains the correct fields
        { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
};
exports.updatedUser = updatedUser;
// ✅ Logout user
const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err)
            return res.status(500).json({ message: "Logout failed" });
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Session destruction failed" });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            console.log("🚪 cookie cleard");
            console.log("🚪 Logout successful");
            const FRONTEND_URL = process.env.NODE_ENV === "production"
                ? "https://goodcall-front-end.onrender.com/#/login"
                : "https://localhost:8080/#/login";
            console.log("FRONTEND_URL", FRONTEND_URL);
            res.redirect(FRONTEND_URL);
        });
    });
};
exports.logoutUser = logoutUser;
// ✅ Create a new user if not exists
const createUser = async (req, res) => {
    try {
        const { googleId, name, email, avatar, access } = req.body;
        let user = await user_1.default.findOne({ googleId });
        if (!user) {
            user = new user_1.default({ googleId, name, email, avatar, access });
            await user.save();
        }
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
};
exports.createUser = createUser;
// ✅ Get all users
const getAllUsers = async (_req, res) => {
    console.log("🔵 getAllUsers called");
    try {
        const users = await user_1.default.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};
exports.getAllUsers = getAllUsers;
