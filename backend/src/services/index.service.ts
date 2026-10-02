import { supabase } from '../config/supabase.js'
import type { ProfileRole, SenderStatus, UpdateType } from '../types/index.type.js'

export const AuthService = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: (jwt: string) =>
    supabase.auth.admin.signOut(jwt),

  createUser: (email: string, password: string) =>
    supabase.auth.admin.createUser({ email, password, email_confirm: true }),

  getUserById: (id: string) =>
    supabase.auth.admin.getUserById(id),

  updatePassword: (id: string, password: string) =>
    supabase.auth.admin.updateUserById(id, { password }),

  deleteUser: (id: string) =>
    supabase.auth.admin.deleteUser(id),

  sendPasswordReset: (email: string, redirectTo: string) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo }),
}

type ProfileCreateInput = {
  full_name:  string
  email:      string
  matric_no?: string
  department?: string
  level?:     string
  role?:      ProfileRole
}

export const ProfileService = {
  create: (id: string, data: ProfileCreateInput) =>
    supabase.from('profiles').insert({ id, ...data }).select().single(),

  getById: (id: string) =>
    supabase.from('profiles').select('*').eq('id', id).single(),

  getByMatricNo: (matricNo: string) =>
    supabase.from('profiles').select('id').eq('matric_no', matricNo).maybeSingle(),

  update: (id: string, data: Partial<{ full_name: string; department: string; level: string }>) =>
    supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
}

export const CourseService = {
  getAll: () =>
    supabase
      .from('courses')
      .select('*, sender_courses(senders:sender_id(full_name, role)), updates(id)')
      .order('course_code'),

  create: (data: { course_code: string; course_name: string; department: string; level: string }) =>
    supabase.from('courses').insert(data).select().single(),

  remove: (id: string) =>
    supabase.from('courses').delete().eq('id', id),
}

export const StudentCourseService = {
  getForStudent: (studentId: string) =>
    supabase.from('student_courses').select('*, courses(*)').eq('student_id', studentId),

  replaceAll: async (studentId: string, courseIds: string[]) => {
    const del = await supabase.from('student_courses').delete().eq('student_id', studentId)
    if (del.error) return del
    if (courseIds.length === 0) return { data: [], error: null }
    return supabase
      .from('student_courses')
      .insert(courseIds.map((course_id) => ({ student_id: studentId, course_id })))
      .select()
  },
}

export const SenderCourseService = {
  getForSender: (senderId: string) =>
    supabase.from('sender_courses').select('*, courses(*)').eq('sender_id', senderId),

  assign: (senderId: string, courseIds: string[]) => {
    if (courseIds.length === 0) return Promise.resolve({ data: [], error: null } as const)
    return supabase
      .from('sender_courses')
      .insert(courseIds.map((course_id) => ({ sender_id: senderId, course_id })))
      .select()
  },

  isAssigned: async (senderId: string, courseId: string) => {
    const { data } = await supabase
      .from('sender_courses')
      .select('id')
      .eq('sender_id', senderId)
      .eq('course_id', courseId)
      .maybeSingle()
    return !!data
  },
}

const UPDATE_SELECT = '*, courses:course_id(course_code, course_name), senders:sender_id(full_name, role)'

type UpdateInput = {
  course_id:  string
  type:       UpdateType
  new_venue?: string
  note?:      string
}

export const UpdatePostService = {
  create: (senderId: string, data: UpdateInput) =>
    supabase.from('updates').insert({ sender_id: senderId, ...data }).select(UPDATE_SELECT).single(),

  getAll: () =>
    supabase.from('updates').select(UPDATE_SELECT).order('created_at', { ascending: false }),

  getForSender: (senderId: string) =>
    supabase.from('updates').select(UPDATE_SELECT).eq('sender_id', senderId).order('created_at', { ascending: false }),

  getForCourses: (courseIds: string[]) =>
    supabase.from('updates').select(UPDATE_SELECT).in('course_id', courseIds).order('created_at', { ascending: false }),

  getById: (id: string) =>
    supabase.from('updates').select('*').eq('id', id).single(),

  remove: (id: string) =>
    supabase.from('updates').delete().eq('id', id),
}

export const SenderService = {
  getAll: () =>
    supabase
      .from('profiles')
      .select('*, sender_courses(courses:course_id(course_code, course_name))')
      .in('role', ['lecturer', 'class_rep'])
      .order('full_name'),

  updateStatus: (id: string, status: SenderStatus) =>
    supabase.from('profiles').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
}

export const NotificationService = {
  getForUser: (userId: string) =>
    supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),

  markRead: (id: string, userId: string) =>
    supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId).select().single(),

  markAllRead: (userId: string) =>
    supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false),
}

export const WaitlistService = {
  join: (data: { name: string; email: string; department: string; university: string }) =>
    supabase.from('waitlist').insert(data).select().single(),
}

export const AdminService = {
  getOverview: async () => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [studentsCount, sendersCount, coursesCount, todayUpdatesCount, recentUpdates, recentSenders] =
      await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['lecturer', 'class_rep']).eq('status', 'active'),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('updates').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase
          .from('updates')
          .select('id, type, created_at, courses:course_id(course_code), senders:sender_id(full_name)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('profiles')
          .select('id, full_name, role, status')
          .in('role', ['lecturer', 'class_rep'])
          .order('created_at', { ascending: false })
          .limit(5),
      ])

    return {
      students:      studentsCount.count ?? 0,
      senders:       sendersCount.count ?? 0,
      courses:       coursesCount.count ?? 0,
      todayUpdates:  todayUpdatesCount.count ?? 0,
      recentUpdates: recentUpdates.data ?? [],
      recentSenders: recentSenders.data ?? [],
    }
  },
}