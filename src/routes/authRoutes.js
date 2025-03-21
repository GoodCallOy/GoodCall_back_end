"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// Redirect to Google OAuth login
router.get("/google", (req, res, next) => {
    console.log("🔵 Google login request received");
    next();
}, passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// Callback route for Google to redirect to after login
router.get("/google/callback", (req, res, next) => {
    console.log("🔄 Google callback hit");
    next();
}, passport_1.default.authenticate("google", {
    failureRedirect: "http://localhost:8080/login",
}), (req, res) => {
    console.log("✅ Google authentication successful, redirecting...");
    res.redirect("http://localhost:8080");
});
// Logout
router.get("/logout", (req, res) => {
    console.log("🚪 Logout request received");
    req.logout((err) => {
        if (err) {
            console.error("❌ Logout error:", err);
            return res.status(500).send("Error logging out");
        }
        res.redirect("http://localhost:8080/");
    });
});
exports.default = router;
