import type { Request, Response, NextFunction } from 'express'
import type { ZodType } from 'zod/v4'
import { supabase } from '../config/supabase.js'
import type { ProfileRole } from '../types/index.type.js'

const SENDER_ROLES = new Set<ProfileRole>(['lecturer', 'class_rep'])

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header.' })
    return
  }

  const token = header.split(' ')[1]
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token.' })
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status, department, level')
    .eq('id', data.user.id)
    .single()

  req.user = {
    id:         data.user.id,
    email:      data.user.email ?? '',
    role:       (profile?.role as ProfileRole) ?? 'student',
    status:     profile?.status ?? 'active',
    department: profile?.department ?? null,
    level:      profile?.level ?? null,
  }

  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' })
    return
  }
  next()
}

// Only lecturers/class reps may post updates, and only while their account is active.
export function requireSender(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !SENDER_ROLES.has(req.user.role)) {
    res.status(403).json({ error: 'Only senders can post updates.' })
    return
  }
  if (req.user.status !== 'active') {
    res.status(403).json({ error: 'Your sender account has been deactivated.' })
    return
  }
  next()
}

// For routes like /students/:id/courses — the owner or an admin may access.
export function requireSelfOrAdmin(paramName = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === 'admin' || req.user?.id === req.params[paramName]) {
      next()
      return
    }
    res.status(403).json({ error: 'Not authorized.' })
  }
}

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        error:   'Validation failed.',
        details: result.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      })
      return
    }
    req.body = result.data
    next()
  }
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `${req.method} ${req.path} not found.` })
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err)
  res.status(500).json({ error: 'Internal server error.' })
}