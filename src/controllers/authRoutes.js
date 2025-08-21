"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.testAuth = exports.getCallback = exports.login = void 0;
exports.logoutUser = logoutUser;
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const CLIENT_URL = process.env.NODE_ENV === 'production'
    ? 'https://goodcall-front-end.onrender.com/#/post-login'
    : 'https://localhost:8080/#/post-login';
// ✅ Logout Function
function logoutUser(req, res, next) {
    req.logout(err => {
        var _a;
        if (err)
            return next(err);
        (_a = req.session) === null || _a === void 0 ? void 0 : _a.destroy(() => {
            res.clearCookie('connect.sid', {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                path: '/', // important so it actually clears
            });
            return res.sendStatus(204);
        });
    });
}
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
        failureRedirect: `${CLIENT_URL}/login`, // Redirect to login on failure
    }),
    (req, res) => {
        console.log('🔍 Passport user object:', req.user); // User populated by passport
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        console.log('🔑 User authenticated successfully');
        const user = req.user; // CustomUser type should be your user interface
        // Generate JWT token
        const JWTtoken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, avatar: user.avatar, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('✅ Google authentication successful, issuing token...', JWTtoken);
        // Set the JWT token in an HTTP-only cookie
        res.cookie('token', JWTtoken, {
            httpOnly: true, // This ensures the cookie cannot be accessed via JavaScript
            secure: true, // Ensure the cookie is sent over HTTPS only in production
            sameSite: 'none', // Required for cross-site cookies (can be 'lax' or 'strict' depending on your needs)
            maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
        });
        console.log('🔵 Issued JWT token in cookie');
        // Redirect to the client (frontend)
        res.redirect(CLIENT_URL);
    }
];
const testAuth = (req, res) => {
    console.log('🔵 Auth test route hit');
    res.json({ message: 'Auth route works' });
};
exports.testAuth = testAuth;
const isAuthenticated = (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Optionally, fetch user from DB here if you want more info
        return res.json({ user: decoded });
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.isAuthenticated = isAuthenticated;
