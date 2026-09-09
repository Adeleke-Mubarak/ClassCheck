import type { Request, Response, NextFunction } from 'express'
import type { ZodType } from 'zod/v4'
import { supabase } from '../config/supabase.js'
import type { ProfileRole } from '../types/index.type.js'

const STAFF_ROLES = new Set<ProfileRole>(['lecturer', 'hod', 'dept_head', 'admin'])

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
    .select('is_admin, role, department_id')
    .eq('id', data.user.id)
    .single()

  req.user = {
    id:            data.user.id,
    email:         data.user.email ?? '',
    is_admin:      profile?.is_admin ?? false,
    role:          (profile?.role as ProfileRole) ?? 'student',
    department_id: profile?.department_id ?? null,
  }

  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.is_admin) {
    res.status(403).json({ error: 'Admin access required.' })
    return
  }
  next()
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !STAFF_ROLES.has(req.user.role)) {
    res.status(403).json({ error: 'Only staff can manage announcements.' })
    return
  }
  next()
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