"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
// Set base URL based on environment
const CLIENT_URL = process.env.NODE_ENV === "production"
    ? "https://goodcall.fi"
    : "http://localhost:8080";
// Redirect to Google OAuth login
router.get("/google", (req, res, next) => {
    console.log("🔵 Google login request received");
    next();
}, passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// Callback route for Google OAuth
router.get("/google/callback", (req, res, next) => {
    console.log("🔄 Google callback hit");
    next();
}, passport_1.default.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login`,
}), (req, res) => {
    console.log("✅ Google authentication successful, redirecting...");
    res.redirect(CLIENT_URL);
});
// Logout
router.get("/logout", (req, res) => {
    console.log("🚪 Logout request received");
    req.logout((err) => {
        if (err) {
            console.error("❌ Logout error:", err);
            return res.status(500).send("Error logging out");
        }
        res.redirect(`${CLIENT_URL}/`);
    });
});
exports.default = router;
