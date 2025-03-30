import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import dotenv from 'dotenv'

dotenv.config()

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
    console.log('✅ Google authentication successful, redirecting...')
    res.redirect(CLIENT_URL)
  }
]

export const testAuth = (req: Request, res: Response) => {
    console.log('🔵 Auth test route hit')
    res.json({ message: 'Auth route works' })
}
