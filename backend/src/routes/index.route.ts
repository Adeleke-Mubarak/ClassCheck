import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth, requireAdmin, requireStaff, validate, notFound, errorHandler } from '../middleware/index.middleware.js'
import {
  AuthController, ProfileController,
  DepartmentController, PostController, ReactionController, NotificationController,
} from '../controllers/index.controller.js'
import {
  signUpSchema, signInSchema, updateProfileSchema,
  createDepartmentSchema, createPostSchema, updatePostSchema, reactionSchema,
} from '../schemas/index.schema.js'

const router = Router()

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { error: 'Too many requests, try again later.' } })

router.post('/auth/signup',  authLimiter, validate(signUpSchema),  AuthController.signUp)
router.post('/auth/signin',  authLimiter, validate(signInSchema),  AuthController.signIn)
router.post('/auth/signout', requireAuth,                          AuthController.signOut)

router.get( '/profile/me',              requireAuth,                                   ProfileController.getMe)
router.put( '/profile/me',              requireAuth, validate(updateProfileSchema),     ProfileController.update)
router.get( '/profile/:id',                                                            ProfileController.getById)

router.get( '/departments',             requireAuth,                                                    DepartmentController.getAll)
router.post('/departments',             requireAuth, requireAdmin, validate(createDepartmentSchema),     DepartmentController.create)

router.get(   '/posts',                 requireAuth,                                              PostController.getAll)
router.get(   '/posts/:id',             requireAuth,                                              PostController.getById)
router.post(  '/posts',                 requireAuth, requireStaff, validate(createPostSchema),    PostController.create)
router.put(   '/posts/:id',             requireAuth, requireStaff, validate(updatePostSchema),    PostController.update)
router.delete('/posts/:id',             requireAuth, requireStaff,                                PostController.remove)

router.get(   '/posts/:id/reactions',   requireAuth,                                              ReactionController.getForPost)
router.post(  '/posts/:id/reactions',   requireAuth, validate(reactionSchema),                    ReactionController.react)
router.delete('/posts/:id/reactions',   requireAuth,                                              ReactionController.unreact)

router.get( '/notifications',           requireAuth,                                              NotificationController.getMine)
router.put( '/notifications/read-all',  requireAuth,                                              NotificationController.markAllRead)
router.put( '/notifications/:id/read',  requireAuth,                                              NotificationController.markRead)

router.use(notFound)
router.use(errorHandler)

export default router