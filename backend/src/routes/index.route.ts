import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  requireAuth, requireAdmin, requireSender, requireSelfOrAdmin,
  validate, notFound, errorHandler,
} from '../middleware/index.middleware.js'
import {
  AuthController, ProfileController, CourseController,
  StudentCourseController, SenderCourseController, UpdateController,
  SenderController, AdminController, NotificationController, WaitlistController,
} from '../controllers/index.controller.js'
import {
  signUpSchema, signInSchema, forgotPasswordSchema, updatePasswordSchema, updateProfileSchema,
  createCourseSchema, updateSubscriptionsSchema, createUpdateSchema,
  createSenderSchema, updateSenderStatusSchema, joinWaitlistSchema,
} from '../schemas/index.schema.js'

const router = Router()

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, message: { error: 'Too many requests, try again later.' } })

// Auth
router.post  ('/auth/signup',          authLimiter, validate(signUpSchema),          AuthController.signUp)
router.post  ('/auth/signin',          authLimiter, validate(signInSchema),          AuthController.signIn)
router.post  ('/auth/signout',         requireAuth,                                  AuthController.signOut)
router.post  ('/auth/forgot-password', authLimiter, validate(forgotPasswordSchema),  AuthController.forgotPassword)
router.put   ('/auth/password',        requireAuth, validate(updatePasswordSchema),  AuthController.updatePassword)
router.delete('/auth/account',         requireAuth,                                  AuthController.deleteAccount)

// Profile
router.get('/profile/me',  requireAuth,                               ProfileController.getMe)
router.put('/profile/me',  requireAuth, validate(updateProfileSchema), ProfileController.update)
router.get('/profile/:id', requireAuth,                                ProfileController.getById)

// Courses (catalog) — admin manages, everyone signed in can browse
router.get   ('/courses',     requireAuth,                                             CourseController.getAll)
router.post  ('/courses',     requireAuth, requireAdmin, validate(createCourseSchema), CourseController.create)
router.delete('/courses/:id', requireAuth, requireAdmin,                               CourseController.remove)

// Student subscriptions
router.get('/students/:id/courses', requireAuth, requireSelfOrAdmin(),                                    StudentCourseController.getMine)
router.put('/students/:id/courses', requireAuth, requireSelfOrAdmin(), validate(updateSubscriptionsSchema), StudentCourseController.replace)

// Sender assignments + a sender's own post history
router.get('/senders/:id/courses', requireAuth, requireSelfOrAdmin(), SenderCourseController.getMine)
router.get('/senders/:id/updates', requireAuth, requireSelfOrAdmin(), UpdateController.getMine)

// Updates (class posts)
router.get   ('/feed',        requireAuth,                                             UpdateController.getFeed)
router.get   ('/updates',     requireAuth, requireAdmin,                               UpdateController.getAll)
router.post  ('/updates',     requireAuth, requireSender, validate(createUpdateSchema), UpdateController.create)
router.delete('/updates/:id', requireAuth,                                             UpdateController.remove)

// Admin: sender management
router.get   ('/senders',            requireAuth, requireAdmin,                                     SenderController.getAll)
router.post  ('/senders',            requireAuth, requireAdmin, validate(createSenderSchema),        SenderController.create)
router.put   ('/senders/:id/status', requireAuth, requireAdmin, validate(updateSenderStatusSchema),   SenderController.updateStatus)
router.delete('/senders/:id',        requireAuth, requireAdmin,                                     SenderController.remove)

// Admin: overview
router.get('/admin/overview', requireAuth, requireAdmin, AdminController.getOverview)

// Notifications
router.get('/notifications',          requireAuth, NotificationController.getMine)
router.put('/notifications/read-all', requireAuth, NotificationController.markAllRead)
router.put('/notifications/:id/read', requireAuth, NotificationController.markRead)

// Waitlist (public)
router.post('/waitlist', authLimiter, validate(joinWaitlistSchema), WaitlistController.join)

router.use(notFound)
router.use(errorHandler)

export default router