import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

interface CustomUser {
  id: string
  name: string
  email: string
  avatar?: string
}

const CLIENT_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://goodcall-front-end.onrender.com/#/dashboard'
    : 'http://localhost:8080/#/dashboard'

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
    failureRedirect: `${CLIENT_URL}/login`
  }),
  (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    console.log('🔑 User authenticated successfully')
    // Generate JWT token
    const user = req.user as CustomUser
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    console.log('✅ Google authentication successful, issuing token...', token)

    // Set the token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.redirect(CLIENT_URL)
  }
]

export const testAuth = (req: Request, res: Response) => {
    console.log('🔵 Auth test route hit')
    res.json({ message: 'Auth route works' })
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔒 Checking authentication status', req.isAuthenticated())

  if (!req.cookies || !req.cookies.token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET!)
    console.log('✅ Token verified:', decoded)
    res.json(decoded) // Send user info back to frontend
  } catch (error) {
    console.error('❌ Invalid token:', error)
    return res.status(403).json({ message: 'Invalid token' })
  }
}