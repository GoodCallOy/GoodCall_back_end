"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.testAuth = exports.getCallback = exports.login = exports.logoutUser = void 0;
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        console.log('🔑 User authenticated successfully');
        // Generate JWT token
        const user = req.user;
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('✅ Google authentication successful, issuing token...', token);
        // Set the token in an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Secure only in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.redirect(CLIENT_URL);
    }
];
const testAuth = (req, res) => {
    console.log('🔵 Auth test route hit');
    res.json({ message: 'Auth route works' });
};
exports.testAuth = testAuth;
const isAuthenticated = (req, res, next) => {
    console.log('🔒 Checking authentication status', req.isAuthenticated());
    if (!req.cookies || !req.cookies.token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(req.cookies.token, process.env.JWT_SECRET);
        console.log('✅ Token verified:', decoded);
        res.json(decoded); // Send user info back to frontend
    }
    catch (error) {
        console.error('❌ Invalid token:', error);
        return res.status(403).json({ message: 'Invalid token' });
    }
};
exports.isAuthenticated = isAuthenticated;
