import { z } from 'zod/v4'

export const signUpSchema = z.object({
  full_name: z.string().min(2).max(100),
  matric_no: z.number(),
  email:     z.email(),
  password:  z.string().min(8),
})

export const signInSchema = z.object({
  email:    z.email(),
  password: z.string().min(1),
})

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone:     z.string().max(20).optional(),
  location:  z.string().max(200).optional(),
})

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
})

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(10),
})

export const createPostSchema = z.object({
  title:         z.string().min(2).max(150),
  content:       z.string().min(1).max(3000),
  course_code:   z.string().max(20).optional(),
  location:      z.string().max(200).optional(),
  class_time:    z.iso.datetime({ offset: true }).optional(),
  department_id: z.uuid().optional(),
})

export const updatePostSchema = z.object({
  title:       z.string().min(2).max(150).optional(),
  content:     z.string().min(1).max(3000).optional(),
  course_code: z.string().max(20).optional(),
  location:    z.string().max(200).optional(),
  class_time:  z.iso.datetime({ offset: true }).optional(),
})

export const reactionSchema = z.object({
  type: z.enum(['like', 'heart', 'seen']).default('like'),
})