import { z } from 'zod/v4'

const LEVELS = ['100', '200', '300', '400', '500'] as const

export const signUpSchema = z.object({
  full_name: z.string().min(2).max(100),
  matric_no: z.string().min(1),
  email:     z.email(),
  department: z.string().min(2).max(100),
  level:     z.enum(LEVELS),
  password:  z.string().min(6),
})

export const signInSchema = z
  .object({
    email:     z.email().optional(),
    matric_no: z.string().min(1).optional(),
    password:  z.string().min(1),
  })
  .refine((d) => !!d.email || !!d.matric_no, {
    message: 'Provide either email or matric_no.',
    path:    ['email'],
  })

export const forgotPasswordSchema = z.object({
  matric_no: z.string().min(1),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(6),
})

export const updateProfileSchema = z.object({
  full_name:  z.string().min(2).max(100).optional(),
  department: z.string().min(2).max(100).optional(),
  level:      z.enum(LEVELS).optional(),
})

export const createCourseSchema = z.object({
  course_code: z.string().min(2).max(20),
  course_name: z.string().min(2).max(150),
  department:  z.string().min(2).max(100),
  level:       z.enum(LEVELS),
})

export const updateSubscriptionsSchema = z.object({
  course_ids: z.array(z.uuid()),
})

export const createUpdateSchema = z
  .object({
    course_id: z.uuid(),
    type:      z.enum(['cancelled', 'venue_change']),
    new_venue: z.string().max(200).optional(),
    note:      z.string().max(1000).optional(),
  })
  .refine((d) => d.type !== 'venue_change' || !!d.new_venue?.trim(), {
    message: 'new_venue is required when type is venue_change.',
    path:    ['new_venue'],
  })

export const createSenderSchema = z.object({
  full_name: z.string().min(2).max(100),
  email:     z.email(),
  password:  z.string().min(6),
  role:      z.enum(['lecturer', 'class_rep']),
  courses:   z.array(z.uuid()).optional().default([]),
})

export const updateSenderStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
})

export const joinWaitlistSchema = z.object({
  name:       z.string().min(2).max(100),
  email:      z.email(),
  department: z.string().min(2).max(100),
  university: z.string().min(2).max(150),
})