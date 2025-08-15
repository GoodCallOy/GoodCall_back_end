import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

interface CustomUser {
  _id: string
  name: string
  email: string
  avatar?: string
  role: string
}

const CLIENT_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://goodcall-front-end.onrender.com/#/dashboard'
    : 'https://localhost:8080/#/dashboard'

// ✅ Logout Function
export const logoutUser = (req: Request, res: Response) => {
  console.log('🚪 Logout request received')

  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err)
      return res.status(500).json({ message: 'Error logging out' })
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Session destruction failed' })
      }

      res.clearCookie('connect.sid') // Clear session cookie
      console.log('✅ Logout successful')

      res.json({ success: true, message: 'Logged out successfully' })
    })
  })
}

// ✅ Google Login Function (Middleware)
export const login = [
  (req: Request, res: Response, next: NextFunction) => {
    console.log('🔵 Google login request received')
    next()
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
]

// ✅ Google Callback Function (Middleware)

export const getCallback = [
    (req: Request, res: Response, next: NextFunction) => {
      console.log('🔄 Google callback hit')
      next()
    },
    passport.authenticate('google', {
      failureRedirect: `${CLIENT_URL}/login`, // Redirect to login on failure
    }),
    (req: Request, res: Response) => {
      console.log('🔍 Passport user object:', req.user) // User populated by passport
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' })
      }
  
      console.log('🔑 User authenticated successfully')
      const user = req.user as CustomUser // CustomUser type should be your user interface
      
      // Generate JWT token
      const JWTtoken = jwt.sign(
        { id: user._id, email: user.email, avatar: user.avatar, name: user.name, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )
  
      console.log('✅ Google authentication successful, issuing token...', JWTtoken)
  
      // Set the JWT token in an HTTP-only cookie
      res.cookie('token', JWTtoken, {
        httpOnly: true, // This ensures the cookie cannot be accessed via JavaScript
        secure: true, // Ensure the cookie is sent over HTTPS only in production
        sameSite: 'none', // Required for cross-site cookies (can be 'lax' or 'strict' depending on your needs)
        maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
      })
  
      console.log('🔵 Issued JWT token in cookie')
  
      // Redirect to the client (frontend)
      res.redirect(CLIENT_URL)
    }
  ]
export const testAuth = (req: Request, res: Response) => {
    console.log('🔵 Auth test route hit')
    res.json({ message: 'Auth route works' })
}
export const isAuthenticated = (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Optionally, fetch user from DB here if you want more info
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};