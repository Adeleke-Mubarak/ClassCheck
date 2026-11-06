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

  // NOTE (Backend Dev):
  // 1. Consider using .ilike('matric_no', matricNo.trim()) instead of .eq to prevent case-sensitivity login issues (e.g. 'mat/...' vs 'MAT/...').
  // 2. Select 'id, email' here directly so AuthController.signIn doesn't need to make an extra Supabase Auth Admin getUserById API roundtrip.
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
      .select('*, sender_courses(profiles!sender_id(full_name, role)), updates(id)')
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

const UPDATE_SELECT = '*, courses:course_id(course_code, course_name), senders:profiles!sender_id(full_name, role)'

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

export type WaitlistStatus = 'pending' | 'contacted' | 'launched'
export type HallPulseStatus = 'in_class' | 'late' | 'not_in_class'

export const WaitlistService = {
  join: (data: { name: string; email: string; department: string; university: string }) =>
    supabase.from('waitlist').insert(data).select().single(),

  getAll: () =>
    supabase.from('waitlist').select('*').order('created_at', { ascending: false }),

  updateStatus: (id: string, status: WaitlistStatus) =>
    supabase.from('waitlist').update({ status }).eq('id', id).select().maybeSingle(),

  remove: (id: string) =>
    supabase.from('waitlist').delete().eq('id', id).select('id').maybeSingle(),
}

export const HallPulseService = {
  getRecentConsensus: async (courseId: string) => {
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('hall_pulse_reports')
      .select('status, created_at')
      .eq('course_id', courseId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }

    const counts: Record<HallPulseStatus, number> = {
      in_class: 0,
      late: 0,
      not_in_class: 0,
    }
    for (const report of data ?? []) {
      const status = report.status as HallPulseStatus
      counts[status] = (counts[status] ?? 0) + 1
    }

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    const highest = Math.max(...Object.values(counts))
    const leaders = (Object.entries(counts) as [HallPulseStatus, number][])
      .filter(([, count]) => count === highest && count > 0)
    const latest = data?.[0]?.created_at ?? null
    const consensus = leaders.length > 1
      ? 'mixed'
      : highest >= 3
      ? leaders[0]![0]
      : null

    return {
      data: {
        course_id: courseId,
        consensus,
        counts,
        total_reports: total,
        last_updated: latest,
      },
      error: null,
    }
  },

  submit: (userId: string, courseId: string, status: HallPulseStatus) =>
    supabase.from('hall_pulse_reports')
      .upsert({ user_id: userId, course_id: courseId, status, created_at: new Date().toISOString() }, { onConflict: 'course_id,user_id' })
      .select().single(),
}


export const AdminService = {
  getStudents: () =>
    supabase.from('profiles')
      .select('id, full_name, email, matric_no, department, level, role, status, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false }),

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
          .select('id, type, created_at, courses:course_id(course_code), senders:profiles!sender_id(full_name)')
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

const TIMETABLE_SELECT = '*, courses:course_id(id, course_code, course_name, department, level)'

export type TimetableCreateInput = {
  course_id:     string
  day_of_week:   string
  start_time:    string
  end_time:      string
  venue:         string
  lecturer_name?: string | null
  note?:          string | null
}

export const TimetableService = {
  // NOTE (Backend Dev): Added '| undefined' to optional properties below so callers in
  // index.controller.ts (lines 325, 335, 354) pass type checking under exactOptionalPropertyTypes: true.
  getAll: (filters?: { day_of_week?: string | undefined; course_id?: string | undefined }) => {
    let query = supabase
      .from('timetable_entries')
      .select(TIMETABLE_SELECT)
      .order('start_time', { ascending: true })

    if (filters?.day_of_week) {
      query = query.eq('day_of_week', filters.day_of_week.toLowerCase())
    }
    if (filters?.course_id) {
      query = query.eq('course_id', filters.course_id)
    }

    return query
  },

  getForCourses: (courseIds: string[], dayOfWeek?: string) => {
    if (courseIds.length === 0) return Promise.resolve({ data: [], error: null } as const)
    let query = supabase
      .from('timetable_entries')
      .select(TIMETABLE_SELECT)
      .in('course_id', courseIds)
      .order('start_time', { ascending: true })

    if (dayOfWeek) {
      query = query.eq('day_of_week', dayOfWeek.toLowerCase())
    }

    return query
  },

  getById: (id: string) =>
    supabase.from('timetable_entries').select(TIMETABLE_SELECT).eq('id', id).single(),

  create: (userId: string, data: TimetableCreateInput) =>
    supabase
      .from('timetable_entries')
      .insert({ created_by: userId, ...data })
      .select(TIMETABLE_SELECT)
      .single(),

  update: (id: string, data: Partial<TimetableCreateInput>) =>
    supabase
      .from('timetable_entries')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(TIMETABLE_SELECT)
      .single(),

  remove: (id: string) =>
    supabase.from('timetable_entries').delete().eq('id', id),
}

const DIRECTORY_SELECT = 'id, full_name, email, role, department, level, location, phone, office_hours, status, sender_courses(courses:course_id(id, course_code, course_name, level))'

export const DirectoryService = {
  // NOTE (Backend Dev): Added '| undefined' to optional properties below so callers in
  // index.controller.ts (line 400) pass type checking under exactOptionalPropertyTypes: true.
  getAll: (filters?: { role?: string | undefined; department?: string | undefined; search?: string | undefined }) => {
    let query = supabase
      .from('profiles')
      .select(DIRECTORY_SELECT)
      .in('role', ['lecturer', 'class_rep', 'hod', 'dept_head'])
      .eq('status', 'active')
      .order('full_name')

    if (filters?.role && filters.role !== 'all') {
      if (filters.role === 'hod') {
        query = query.in('role', ['hod', 'dept_head'])
      } else {
        query = query.eq('role', filters.role)
      }
    }

    if (filters?.department) {
      query = query.eq('department', filters.department)
    }

    if (filters?.search) {
      query = query.ilike('full_name', `%${filters.search}%`)
    }

    return query
  },

  getFacilitatorsForCourses: async (courseIds: string[]) => {
    if (courseIds.length === 0) return { data: [], error: null }

    const { data: assignments, error: assignErr } = await supabase
      .from('sender_courses')
      .select('sender_id')
      .in('course_id', courseIds)

    if (assignErr) return { data: null, error: assignErr }

    const senderIds = Array.from(new Set((assignments || []).map((a: any) => a.sender_id)))
    if (senderIds.length === 0) return { data: [], error: null }

    return supabase
      .from('profiles')
      .select(DIRECTORY_SELECT)
      .in('id', senderIds)
      .eq('status', 'active')
      .order('full_name')
  },
}