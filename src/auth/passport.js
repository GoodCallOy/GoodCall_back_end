"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import the User model
const user_1 = __importDefault(require("../models/user"));
// Serialize and Deserialize User
passport_1.default.serializeUser((user, done) => {
    const sessionUser = {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        agentId: user.agentId ? user.agentId.toString() : null,
    };
    console.log('✅ user serialized:', sessionUser);
    done(null, sessionUser); // <-- store this in the session
});
passport_1.default.deserializeUser((sessionUser, done) => {
    console.log('🔄 user deserialized:', sessionUser);
    done(null, sessionUser);
});
// Google OAuth Strategy
const CLIENT_URL = process.env.NODE_ENV === 'production'
    ? "https://goodcall-back-end.onrender.com/api/v1/auth/google/callback"
    : "https://localhost:3030/api/v1/auth/google/callback";
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: CLIENT_URL,
}, async (accessToken, refreshToken, profile, done) => {
    var _a, _b;
    try {
        let user = await user_1.default.findOne({ googleId: profile.id });
        if (!user) {
            console.log("🟠 No user found, creating a new one...");
            user = new user_1.default({
                googleId: profile.id,
                name: profile.displayName,
                email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value,
                avatar: (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value,
                role: "caller",
                agentId: null
            });
            console.log('✅ saving user:', user);
            await user.save();
            console.log("✅ User saved to DB:", user);
        }
        done(null, user);
    }
    catch (error) {
        console.error("❌ Error in Google OAuth callback:", error);
        done(error, null);
    }
}));
exports.default = passport_1.default;
