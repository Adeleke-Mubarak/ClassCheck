import { supabase } from '../config/supabase.js'
import type { ReactionType } from '../types/index.type.js'

export const AuthService = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: (jwt: string) =>
    supabase.auth.admin.signOut(jwt),
}

export const ProfileService = {
  create: (id: string, full_name: string, matric_no: number) =>
    supabase.from('profiles').insert({ id, full_name, matric_no }).select().single(),

  getById: (id: string) =>
    supabase.from('profiles').select('*').eq('id', id).single(),

  update: (id: string, data: { full_name?: string; phone?: string; location?: string }) =>
    supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
}

export const MessageService = {
  getAll: (bookingId: string) =>
    supabase
      .from('messages')
      .select('*, sender:sender_id(full_name)')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true }),

  send: (bookingId: string, senderId: string, content: string) =>
    supabase
      .from('messages')
      .insert({ booking_id: bookingId, sender_id: senderId, content })
      .select()
      .single(),

  markRead: (bookingId: string, userId: string) =>
    supabase
      .from('messages')
      .update({ read: true })
      .eq('booking_id', bookingId)
      .neq('sender_id', userId),
}

export const DepartmentService = {
  getAll: () =>
    supabase.from('departments').select('*').order('name'),

  create: (name: string, code: string) =>
    supabase.from('departments').insert({ name, code }).select().single(),
}

type PostInput = {
  title:       string
  content:     string
  course_code?: string
  location?:    string
  class_time?:  string
}

export const PostService = {
  create: (authorId: string, departmentId: string, data: PostInput) =>
    supabase
      .from('posts')
      .insert({ author_id: authorId, department_id: departmentId, ...data })
      .select('*, author:author_id(full_name, role)')
      .single(),

  getAll: (departmentId?: string) => {
    const query = supabase
      .from('posts')
      .select('*, author:author_id(full_name, role)')
      .order('created_at', { ascending: false })

    return departmentId ? query.eq('department_id', departmentId) : query
  },

  getById: (id: string) =>
    supabase
      .from('posts')
      .select('*, author:author_id(full_name, role)')
      .eq('id', id)
      .single(),

  update: (id: string, data: Partial<PostInput>) =>
    supabase.from('posts').update(data).eq('id', id).select().single(),

  remove: (id: string) =>
    supabase.from('posts').delete().eq('id', id),
}

export const ReactionService = {
  upsert: (postId: string, userId: string, type: ReactionType) =>
    supabase
      .from('reactions')
      .upsert({ post_id: postId, user_id: userId, type }, { onConflict: 'post_id,user_id' })
      .select()
      .single(),

  remove: (postId: string, userId: string) =>
    supabase.from('reactions').delete().eq('post_id', postId).eq('user_id', userId),

  getForPost: (postId: string) =>
    supabase
      .from('reactions')
      .select('*, user:user_id(full_name)')
      .eq('post_id', postId),
}

export const NotificationService = {
  getForUser: (userId: string) =>
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

  markRead: (id: string, userId: string) =>
    supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single(),

  markAllRead: (userId: string) =>
    supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false),
}