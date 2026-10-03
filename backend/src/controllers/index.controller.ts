import type { Request, Response } from 'express'
import { env } from '../config/env.js'
import {
  AuthService, ProfileService, CourseService,
  StudentCourseService, SenderCourseService, UpdatePostService,
  SenderService, NotificationService, WaitlistService, AdminService,
} from '../services/index.service.js'

type IdParam = { id: string }

function ok(res: Response, data: unknown, status = 200) {
  res.status(status).json({ data })
}

function fail(res: Response, error: unknown, status = 400) {
  console.error(error)
  const message = (error as any)?.message ?? String(error)
  res.status(status).json({ error: message })
}

export const AuthController = {
  signUp: async (req: Request, res: Response) => {
    const { full_name, matric_no, email, department, level, password } = req.body

    const { data: authData, error: authError } = await AuthService.signUp(email, password)
    if (authError) { fail(res, authError.message); return }
    if (!authData.user) { fail(res, 'Signup failed.'); return }

    const { error: profileError } = await ProfileService.create(authData.user.id, {
      full_name, email, matric_no, department, level, role: 'student',
    })
    if (profileError) { fail(res, profileError.message); return }

    const { data: session, error: sessionError } = await AuthService.signIn(email, password)
    if (sessionError) { fail(res, sessionError.message); return }

    ok(res, session, 201)
  },

  // Students sign in with matric_no, senders/admin sign in with email.
  signIn: async (req: Request, res: Response) => {
    const { email, matric_no, password } = req.body

    let resolvedEmail = email as string | undefined

    if (matric_no) {
      const { data: profile } = await ProfileService.getByMatricNo(matric_no)

      if (!profile) {
        fail(res, 'Invalid email, matric number, or password.', 401)
        return
      }

      const { data: userData } = await AuthService.getUserById(profile.id)
      resolvedEmail = userData?.user?.email ?? undefined

      if (!resolvedEmail) {
        fail(res, 'Email required during signin', 401)
        return
      }

      if (email && resolvedEmail.toLowerCase() !== email.toLowerCase()) {
        fail(res, 'Invalid email', 401)
        return
      }
    }

    if (!resolvedEmail) {
      fail(res, 'Email or matric number is required.', 400)
      return
    }

    const { data, error } = await AuthService.signIn(
      resolvedEmail,
      password
    )

    if (error) {
      fail(res, error.message, 401)
      return
    }

    ok(res, data)
  },

  signOut: async (req: Request, res: Response) => {
    const token = req.headers.authorization!.split(' ')[1]
    const { error } = await AuthService.signOut(token!)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Signed out.' })
  },

  forgotPassword: async (req: Request, res: Response) => {
    const { matric_no } = req.body

    const { data: profile } = await ProfileService.getByMatricNo(matric_no)
    if (profile) {
      const { data: userData } = await AuthService.getUserById(profile.id)
      const email = userData?.user?.email
      if (email) {
        await AuthService.sendPasswordReset(email, `${env.clientUrl}/reset-password`)
      }
    }

    ok(res, { message: 'If that matric number exists, a reset link has been sent.' })
  },

  updatePassword: async (req: Request, res: Response) => {
    const { password } = req.body
    const { error } = await AuthService.updatePassword(req.user!.id, password)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Password updated.' })
  },

  deleteAccount: async (req: Request, res: Response) => {
    const { error } = await AuthService.deleteUser(req.user!.id)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Account deleted.' })
  },
}

export const ProfileController = {
  getMe: async (req: Request, res: Response) => {
    const { data, error } = await ProfileService.getById(req.user!.id)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  getById: async (req: Request<IdParam>, res: Response) => {
    const { data, error } = await ProfileService.getById(req.params.id)
    if (error) { fail(res, error.message, 404); return }
    ok(res, data)
  },

  update: async (req: Request, res: Response) => {
    const { data, error } = await ProfileService.update(req.user!.id, req.body)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },
}

export const CourseController = {
  getAll: async (_req: Request, res: Response) => {
    const { data, error } = await CourseService.getAll()
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  create: async (req: Request, res: Response) => {
    const { data, error } = await CourseService.create(req.body)
    if (error) { fail(res, error.message); return }
    ok(res, data, 201)
  },

  remove: async (req: Request<IdParam>, res: Response) => {
    const { error } = await CourseService.remove(req.params.id)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Course deleted.' })
  },
}

export const StudentCourseController = {
  getMine: async (req: Request<IdParam>, res: Response) => {
    const { data, error } = await StudentCourseService.getForStudent(req.params.id)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  replace: async (req: Request<IdParam>, res: Response) => {
    const { course_ids } = req.body
    const { data, error } = await StudentCourseService.replaceAll(req.params.id, course_ids)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },
}

export const SenderCourseController = {
  getMine: async (req: Request<IdParam>, res: Response) => {
    const { data, error } = await SenderCourseService.getForSender(req.params.id)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },
}

export const UpdateController = {
  create: async (req: Request, res: Response) => {
    const { course_id, type, new_venue, note } = req.body

    if (req.user!.role !== 'admin') {
      const assigned = await SenderCourseService.isAssigned(req.user!.id, course_id)
      if (!assigned) { fail(res, 'You are not assigned to post updates for this course.', 403); return }
    }

    const { data, error } = await UpdatePostService.create(req.user!.id, { course_id, type, new_venue, note })
    if (error) { fail(res, error.message); return }
    ok(res, data, 201)
  },

  getAll: async (_req: Request, res: Response) => {
    const { data, error } = await UpdatePostService.getAll()
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  getMine: async (req: Request<IdParam>, res: Response) => {
    const { data, error } = await UpdatePostService.getForSender(req.params.id)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  // A student's feed: updates for courses they're subscribed to only.
  getFeed: async (req: Request, res: Response) => {
    const { data: subs, error: subsError } = await StudentCourseService.getForStudent(req.user!.id)
    if (subsError) { fail(res, subsError.message); return }

    const courseIds = (subs ?? []).map((s: any) => s.course_id)
    if (courseIds.length === 0) { ok(res, []); return }

    const { data, error } = await UpdatePostService.getForCourses(courseIds)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  remove: async (req: Request<IdParam>, res: Response) => {
    const { data: existing, error: fetchError } = await UpdatePostService.getById(req.params.id)
    if (fetchError || !existing) { fail(res, 'Update not found.', 404); return }

    if (existing.sender_id !== req.user!.id && req.user!.role !== 'admin') {
      fail(res, 'You can only delete your own updates.', 403)
      return
    }

    const { error } = await UpdatePostService.remove(req.params.id)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Update deleted.' })
  },
}

export const SenderController = {
  getAll: async (_req: Request, res: Response) => {
    const { data, error } = await SenderService.getAll()
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  // Admin creates a sender account directly (senders cannot self-register).
  create: async (req: Request, res: Response) => {
    const { full_name, email, password, role, courses } = req.body

    const { data: authData, error: authError } = await AuthService.createUser(email, password)
    if (authError) { fail(res, authError.message); return }
    if (!authData.user) { fail(res, 'Failed to create sender account.'); return }

    const { data: profile, error: profileError } = await ProfileService.create(authData.user.id, {
      full_name, email, role,
    })
    if (profileError) { fail(res, profileError.message); return }

    if (courses?.length) {
      const { error: assignError } = await SenderCourseService.assign(authData.user.id, courses)
      if (assignError) { fail(res, assignError.message); return }
    }

    ok(res, profile, 201)
  },

  updateStatus: async (req: Request<IdParam>, res: Response) => {
    const { status } = req.body
    const { data, error } = await SenderService.updateStatus(req.params.id, status)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  remove: async (req: Request<IdParam>, res: Response) => {
    const { error } = await AuthService.deleteUser(req.params.id)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Sender removed.' })
  },
}

export const AdminController = {
  getOverview: async (_req: Request, res: Response) => {
    const data = await AdminService.getOverview()
    ok(res, data)
  },
}

export const NotificationController = {
  getMine: async (req: Request, res: Response) => {
    const { data, error } = await NotificationService.getForUser(req.user!.id)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  markRead: async (req: Request<IdParam>, res: Response) => {
    const { data, error } = await NotificationService.markRead(req.params.id, req.user!.id)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  markAllRead: async (req: Request, res: Response) => {
    const { error } = await NotificationService.markAllRead(req.user!.id)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'All notifications marked read.' })
  },
}

export const WaitlistController = {
  join: async (req: Request, res: Response) => {
    const { data, error } = await WaitlistService.join(req.body)
    if (error) {
      if ((error as any).code === '23505') { fail(res, 'This email is already on the waitlist.', 409); return }
      fail(res, error.message)
      return
    }
    ok(res, data, 201)
  },
}