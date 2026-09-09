import type { Request, Response } from 'express'
import {
  AuthService, ProfileService,
  DepartmentService, PostService, ReactionService, NotificationService,
} from '../services/index.service.js'

type IdParam        = { id: string }

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
    const { full_name, matric_no, email, password } = req.body

    const { data: authData, error: authError } = await AuthService.signUp(email, password)
    if (authError) { fail(res, authError.message); return }
    if (!authData.user) { fail(res, 'Signup failed.'); return }

    const { error: profileError } = await ProfileService.create(authData.user.id, full_name, matric_no)
    if (profileError) { fail(res, profileError.message); return }

    const { data: session, error: sessionError } = await AuthService.signIn(email, password)
    if (sessionError) { fail(res, sessionError.message); return }

    ok(res, session, 201)
  },

  signIn: async (req: Request, res: Response) => {
    const { email, password } = req.body
    const { data, error } = await AuthService.signIn(email, password)
    if (error) { fail(res, error.message, 401); return }
    ok(res, data)
  },

  signOut: async (req: Request, res: Response) => {
    const token = req.headers.authorization!.split(' ')[1]
    const { error } = await AuthService.signOut(token!)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Signed out.' })
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

export const DepartmentController = {
  getAll: async (_req: Request, res: Response) => {
    const { data, error } = await DepartmentService.getAll()
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  create: async (req: Request, res: Response) => {
    const { name, code } = req.body
    const { data, error } = await DepartmentService.create(name, code)
    if (error) { fail(res, error.message); return }
    ok(res, data, 201)
  },
}

export const PostController = {
  create: async (req: Request, res: Response) => {
    const { department_id, ...rest } = req.body

    const targetDepartmentId =
      req.user!.role === 'admin' && department_id ? department_id : req.user!.department_id

    if (!targetDepartmentId) {
      fail(res, 'You are not assigned to a department, so you cannot post.', 400)
      return
    }

    const { data, error } = await PostService.create(req.user!.id, targetDepartmentId, rest)
    if (error) { fail(res, error.message); return }
    ok(res, data, 201)
  },

  getAll: async (req: Request, res: Response) => {
    const departmentId = typeof req.query.department_id === 'string' ? req.query.department_id : undefined
    const { data, error } = await PostService.getAll(departmentId)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  getById: async (req: Request<IdParam>, res: Response) => {
    const { data, error } = await PostService.getById(req.params.id)
    if (error) { fail(res, error.message, 404); return }
    ok(res, data)
  },

  update: async (req: Request<IdParam>, res: Response) => {
    const { data: existing, error: fetchError } = await PostService.getById(req.params.id)
    if (fetchError || !existing) { fail(res, 'Post not found.', 404); return }

    if (existing.author_id !== req.user!.id && req.user!.role !== 'admin') {
      fail(res, 'You can only edit your own posts.', 403)
      return
    }

    const { data, error } = await PostService.update(req.params.id, req.body)
    if (error) { fail(res, error.message); return }
    ok(res, data)
  },

  remove: async (req: Request<IdParam>, res: Response) => {
    const { data: existing, error: fetchError } = await PostService.getById(req.params.id)
    if (fetchError || !existing) { fail(res, 'Post not found.', 404); return }

    if (existing.author_id !== req.user!.id && req.user!.role !== 'admin') {
      fail(res, 'You can only delete your own posts.', 403)
      return
    }

    const { error } = await PostService.remove(req.params.id)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Post deleted.' })
  },
}

export const ReactionController = {
  react: async (req: Request<IdParam>, res: Response) => {
    const { type } = req.body
    const { data, error } = await ReactionService.upsert(req.params.id, req.user!.id, type)
    if (error) { fail(res, error.message); return }
    ok(res, data, 201)
  },

  unreact: async (req: Request<IdParam>, res: Response) => {
    const { error } = await ReactionService.remove(req.params.id, req.user!.id)
    if (error) { fail(res, error.message); return }
    ok(res, { message: 'Reaction removed.' })
  },

  getForPost: async (req: Request<IdParam>, res: Response) => {
    const { data, error } = await ReactionService.getForPost(req.params.id)
    if (error) { fail(res, error.message); return }
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