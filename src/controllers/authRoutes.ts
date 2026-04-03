import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import User from '../models/user'

dotenv.config()

interface CustomUser {
  _id: string
  name: string
  email: string
  avatar?: string
  role: string
  linkedUserId?: string | null
}

const CLIENT_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://goodcall-front-end.onrender.com'
    : 'https://localhost:8080'

const POST_LOGIN_PATH = '/#/post-login'
const LOGIN_PATH = '/#/login'

// ✅ Logout Function
export function logoutUser(req: Request, res: Response, next: NextFunction) {
  req.logout(err => {
    if (err) return next(err);

    req.session?.destroy(() => {
      res.clearCookie('connect.sid', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/', // important so it actually clears
      });
      return res.sendStatus(204);
    });
  });
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
      failureRedirect: `${CLIENT_URL}${LOGIN_PATH}`, // Redirect to login on failure
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
        { id: user._id, email: user.email, avatar: user.avatar, name: user.name, role: user.role, linkedUserId: user.linkedUserId },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )
  
      console.log('✅ Google authentication successful, issuing token...', JWTtoken)

      // Set the JWT token in an HTTP-only cookie
      res.cookie('token', JWTtoken, {
        httpOnly: true, // This ensures the cookie cannot be accessed via JavaScript
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Lax in dev helps Firefox
        maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
      })

      console.log('🔵 Issued JWT token in cookie')

      // Redirect to the client (frontend)
      res.redirect(`${CLIENT_URL}${POST_LOGIN_PATH}`)
    }
  ]
export const testAuth = (req: Request, res: Response) => {
    console.log('🔵 Auth test route hit')
    res.json({ 
      message: 'Auth route works',
      nodeEnv: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
      cookieSettings: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      }
    })
}
export const isAuthenticated = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    console.warn('Auth /me: missing token cookie', {
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent'],
      cookieHeaderPresent: Boolean(req.headers.cookie),
    });
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & {
      id?: string
      _id?: string
      role?: string
      name?: string
      email?: string
      avatar?: string
      linkedUserId?: string | null
    }
    const userId = decoded.id ?? decoded._id
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    const fresh = await User.findById(userId)
      .select('name email avatar role linkedUserId')
      .lean()

    if (!fresh) {
      return res.status(401).json({ message: 'User not found' })
    }

    const user = {
      id: String(fresh._id),
      name: fresh.name,
      email: fresh.email,
      avatar: fresh.avatar,
      role: fresh.role,
      linkedUserId: fresh.linkedUserId ? String(fresh.linkedUserId) : null,
    }

    return res.json({ user })
  } catch (err) {
    console.warn('Auth /me: invalid token', { error: (err as any)?.message });
    return res.status(401).json({ message: 'Invalid token' });
  }
};