"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAuth = exports.getCallback = exports.login = exports.logoutUser = void 0;
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CLIENT_URL = process.env.NODE_ENV === 'production'
    ? 'https://goodcall-front-end.onrender.com/#/dashboard'
    : 'http://localhost:8080/#/dashboard';
// ✅ Logout Function
const logoutUser = (req, res) => {
    console.log('🚪 Logout request received');
    req.logout((err) => {
        if (err) {
            console.error('❌ Logout error:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Session destruction failed' });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            console.log('✅ Logout successful');
            res.json({ success: true, message: 'Logged out successfully' });
        });
    });
};
exports.logoutUser = logoutUser;
// ✅ Google Login Function (Middleware)
exports.login = [
    (req, res, next) => {
        console.log('🔵 Google login request received');
        next();
    },
    passport_1.default.authenticate('google', { scope: ['profile', 'email'] })
];
// ✅ Google Callback Function (Middleware)
exports.getCallback = [
    (req, res, next) => {
        console.log('🔄 Google callback hit');
        next();
    },
    passport_1.default.authenticate('google', {
        failureRedirect: `${CLIENT_URL}/login`
    }),
    (req, res) => {
        console.log('✅ Google authentication successful, redirecting...');
        res.redirect(CLIENT_URL);
    }
];
const testAuth = (req, res) => {
    console.log('🔵 Auth test route hit');
    res.json({ message: 'Auth route works' });
};
exports.testAuth = testAuth;
