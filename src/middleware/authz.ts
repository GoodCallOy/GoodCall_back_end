import { Request, Response, NextFunction } from 'express'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = (req as any).cookies?.token
  if (!token) return res.status(401).json({ message: 'Not authenticated' })
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user || {}
    const role = (user as any)?.role
    if (!role) return res.status(401).json({ message: 'Not authenticated' })
    if (!roles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}


