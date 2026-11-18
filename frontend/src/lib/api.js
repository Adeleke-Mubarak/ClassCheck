const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const MOCK_COURSES = [
  { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III', department: 'Mathematics', level: '400' },
  { id: 'c2', course_code: 'MAT403', course_name: 'Complex Analysis II', department: 'Mathematics', level: '400' },
  { id: 'c3', course_code: 'MAT405', course_name: 'Abstract Algebra II', department: 'Mathematics', level: '400' },
  { id: 'c4', course_code: 'MAT407', course_name: 'Differential Equations III', department: 'Mathematics', level: '400' },
  { id: 'c5', course_code: 'MAT409', course_name: 'Topology', department: 'Mathematics', level: '400' },
  { id: 'c6', course_code: 'MAT411', course_name: 'Functional Analysis', department: 'Mathematics', level: '400' },
  { id: 'c7', course_code: 'MAT413', course_name: 'Numerical Analysis II', department: 'Mathematics', level: '400' },
  { id: 'c8', course_code: 'MAT415', course_name: 'Operations Research', department: 'Mathematics', level: '400' },
  { id: 'c9', course_code: 'MAT417', course_name: 'Mathematical Methods', department: 'Mathematics', level: '400' },
  { id: 'c10', course_code: 'MAT419', course_name: 'Fluid Dynamics', department: 'Mathematics', level: '400' },
  { id: 'c11', course_code: 'MAT497', course_name: 'Final Year Project', department: 'Mathematics', level: '400' },
]

const MOCK_TIMETABLE_INITIAL = [
  {
    id: 'tt-1',
    course_id: 'c1',
    day_of_week: 'monday',
    start_time: '08:00',
    end_time: '10:00',
    venue: 'LT2',
    lecturer_name: 'Prof Moses Akanbi',
    note: 'Weekly foundational lecture & proofs',
    courses: { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III', level: '400' },
  },
  {
    id: 'tt-2',
    course_id: 'c2',
    day_of_week: 'monday',
    start_time: '12:00',
    end_time: '14:00',
    venue: 'Math Lab 1',
    lecturer_name: 'Prof Olutiomo',
    note: 'Complex integration & contour theorems',
    courses: { id: 'c2', course_code: 'MAT403', course_name: 'Complex Analysis II', level: '400' },
  },
  {
    id: 'tt-3',
    course_id: 'c3',
    day_of_week: 'tuesday',
    start_time: '10:00',
    end_time: '12:00',
    venue: 'NLH 3',
    lecturer_name: 'Dr Oyebo',
    note: 'Group theory & Galois structures',
    courses: { id: 'c3', course_code: 'MAT405', course_name: 'Abstract Algebra II', level: '400' },
  },
  {
    id: 'tt-4',
    course_id: 'c7',
    day_of_week: 'tuesday',
    start_time: '14:00',
    end_time: '16:00',
    venue: 'Math Lab 2',
    lecturer_name: 'Dr Akewushola',
    note: 'Numerical algorithms & error analysis',
    courses: { id: 'c7', course_code: 'MAT413', course_name: 'Numerical Analysis II', level: '400' },
  },
  {
    id: 'tt-5',
    course_id: 'c4',
    day_of_week: 'wednesday',
    start_time: '08:00',
    end_time: '10:00',
    venue: 'LT1',
    lecturer_name: 'Dr Ige',
    note: 'Boundary value problems & ODE systems',
    courses: { id: 'c4', course_code: 'MAT407', course_name: 'Differential Equations III', level: '400' },
  },
  {
    id: 'tt-6',
    course_id: 'c8',
    day_of_week: 'wednesday',
    start_time: '12:00',
    end_time: '14:00',
    venue: 'Science LT',
    lecturer_name: 'Mr Shonibare',
    note: 'Linear programming & optimization models',
    courses: { id: 'c8', course_code: 'MAT415', course_name: 'Operations Research', level: '400' },
  },
  {
    id: 'tt-7',
    course_id: 'c9',
    day_of_week: 'thursday',
    start_time: '10:00',
    end_time: '12:00',
    venue: 'NLH 2',
    lecturer_name: 'Dr Ibitowa',
    note: 'Special functions & integral transforms',
    courses: { id: 'c9', course_code: 'MAT417', course_name: 'Mathematical Methods', level: '400' },
  },
  {
    id: 'tt-8',
    course_id: 'c1',
    day_of_week: 'thursday',
    start_time: '14:00',
    end_time: '16:00',
    venue: 'LT2',
    lecturer_name: 'Prof Moses Akanbi',
    note: 'Tutorial & problem solving review',
    courses: { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III', level: '400' },
  },
  {
    id: 'tt-9',
    course_id: 'c5',
    day_of_week: 'friday',
    start_time: '09:00',
    end_time: '11:00',
    venue: 'Math Lab 2',
    lecturer_name: 'Mr Moshood',
    note: 'Topological spaces & compactness theorems',
    courses: { id: 'c5', course_code: 'MAT409', course_name: 'Topology', level: '400' },
  },
  {
    id: 'tt-10',
    course_id: 'c2',
    day_of_week: 'friday',
    start_time: '11:00',
    end_time: '13:00',
    venue: 'NLH 1',
    lecturer_name: 'Prof Olutiomo',
    note: 'Conformal mappings & revision',
    courses: { id: 'c2', course_code: 'MAT403', course_name: 'Complex Analysis II', level: '400' },
  },
]

const MOCK_DIRECTORY = [
  {
    id: 'dir-1',
    full_name: 'Prof Moses Akanbi',
    email: 'm.akanbi@university.edu.ng',
    role: 'hod',
    department: 'Mathematics',
    level: null,
    location: 'Faculty of Science, Math Block A, Office 10',
    office_hours: 'Mondays & Thursdays: 10:00 AM – 12:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III' },
    ],
  },
  {
    id: 'dir-2',
    full_name: 'Prof Olutiomo',
    email: 'olutiomo@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Science Complex, Office 304',
    office_hours: 'Mondays & Fridays: 1:00 PM – 3:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c2', course_code: 'MAT403', course_name: 'Complex Analysis II' },
    ],
  },
  {
    id: 'dir-3',
    full_name: 'Dr Oyebo',
    email: 'oyebo@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Faculty of Science, Office 208',
    office_hours: 'Tuesdays: 11:00 AM – 1:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c3', course_code: 'MAT405', course_name: 'Abstract Algebra II' },
    ],
  },
  {
    id: 'dir-4',
    full_name: 'Dr Ige',
    email: 'ige@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Math Block B, Office 12',
    office_hours: 'Wednesdays: 10:00 AM – 12:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c4', course_code: 'MAT407', course_name: 'Differential Equations III' },
    ],
  },
  {
    id: 'dir-5',
    full_name: 'Mr Moshood',
    email: 'moshood@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Science Quad, Office 105',
    office_hours: 'Fridays: 10:00 AM – 12:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c5', course_code: 'MAT409', course_name: 'Topology' },
    ],
  },
  {
    id: 'dir-6',
    full_name: 'Dr Akewushola',
    email: 'akewushola@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Senate Building, Suite 305',
    office_hours: 'Tuesdays & Thursdays: 2:00 PM – 4:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c7', course_code: 'MAT413', course_name: 'Numerical Analysis II' },
    ],
  },
  {
    id: 'dir-7',
    full_name: 'Mr Shonibare',
    email: 'shonibare@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Math Block A, Office 16',
    office_hours: 'Wednesdays & Thursdays: 1:00 PM – 3:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c8', course_code: 'MAT415', course_name: 'Operations Research' },
    ],
  },
  {
    id: 'dir-8',
    full_name: 'Dr Ibitowa',
    email: 'ibitowa@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Science Complex, Office 215',
    office_hours: 'Thursdays: 10:00 AM – 12:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c9', course_code: 'MAT417', course_name: 'Mathematical Methods' },
    ],
  },
  {
    id: 'dir-9',
    full_name: 'Taiwo Daniel',
    email: 'taiwo.daniel@student.edu.ng',
    role: 'class_rep',
    department: 'Mathematics',
    level: '400',
    location: 'Departmental Rep Desk / Science Quad',
    office_hours: 'Monday – Friday: 12:00 PM – 2:00 PM',
    phone: '+234 802 345 6789',
    status: 'active',
    courses: [
      { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III' },
      { id: 'c2', course_code: 'MAT403', course_name: 'Complex Analysis II' },
      { id: 'c3', course_code: 'MAT405', course_name: 'Abstract Algebra II' },
      { id: 'c4', course_code: 'MAT407', course_name: 'Differential Equations III' },
      { id: 'c5', course_code: 'MAT409', course_name: 'Topology' },
      { id: 'c7', course_code: 'MAT413', course_name: 'Numerical Analysis II' },
      { id: 'c8', course_code: 'MAT415', course_name: 'Operations Research' },
      { id: 'c9', course_code: 'MAT417', course_name: 'Mathematical Methods' },
    ],
  },
  {
    id: 'dir-10',
    full_name: 'Obasi Obinna',
    email: 'obasi.obinna@student.edu.ng',
    role: 'class_rep',
    department: 'Mathematics',
    level: '400',
    location: 'Science Quad / Math Study Room',
    office_hours: 'Monday – Friday: 1:00 PM – 3:00 PM',
    phone: '+234 809 987 6543',
    status: 'active',
    courses: [
      { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III' },
      { id: 'c2', course_code: 'MAT403', course_name: 'Complex Analysis II' },
      { id: 'c3', course_code: 'MAT405', course_name: 'Abstract Algebra II' },
      { id: 'c4', course_code: 'MAT407', course_name: 'Differential Equations III' },
      { id: 'c5', course_code: 'MAT409', course_name: 'Topology' },
      { id: 'c7', course_code: 'MAT413', course_name: 'Numerical Analysis II' },
      { id: 'c8', course_code: 'MAT415', course_name: 'Operations Research' },
      { id: 'c9', course_code: 'MAT417', course_name: 'Mathematical Methods' },
    ],
  },
]

function getLocalTimetable() {
  try {
    const raw = localStorage.getItem('classcheck_dev_timetable_v2')
    if (raw) return JSON.parse(raw)
    const oldRaw = localStorage.getItem('classcheck_dev_timetable')
    if (oldRaw) {
      const parsed = JSON.parse(oldRaw)
      const hasOldName = parsed.some(
        (item) =>
          item.lecturer_name?.includes('Adeyemi') ||
          item.lecturer_name?.includes('Okon')
      )
      if (!hasOldName) return parsed
    }
  } catch {}
  return MOCK_TIMETABLE_INITIAL
}

function saveLocalTimetable(list) {
  try {
    localStorage.setItem('classcheck_dev_timetable_v2', JSON.stringify(list))
    localStorage.setItem('classcheck_dev_timetable', JSON.stringify(list))
  } catch {}
}

function isDateToday(dateString) {
  if (!dateString) return false
  const d = new Date(dateString)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

function getRegisteredStudents() {
  try {
    const raw = localStorage.getItem('classcheck_registered_students')
    let list = raw ? JSON.parse(raw) : null
    if (!list) {
      const userRaw = localStorage.getItem('classcheck_user')
      let initialUser = null
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw)
          if (u.role === 'student') initialUser = u
        } catch {}
      }
      list = initialUser ? [initialUser] : []
      localStorage.setItem('classcheck_registered_students', JSON.stringify(list))
    } else {
      const userRaw = localStorage.getItem('classcheck_user')
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw)
          if (u.role === 'student' && !list.some((s) => s.email === u.email || s.matric_no === u.matric_no || s.id === u.id)) {
            list.push(u)
            localStorage.setItem('classcheck_registered_students', JSON.stringify(list))
          }
        } catch {}
      }
    }
    return list
  } catch {
    return []
  }
}

function getLocalUpdates() {
  try {
    const raw = localStorage.getItem('classcheck_dev_updates')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function getLocalSenders() {
  try {
    const raw = localStorage.getItem('classcheck_dev_senders')
    if (raw) return JSON.parse(raw)
  } catch {}
  return MOCK_DIRECTORY
}

function saveLocalSenders(list) {
  try {
    localStorage.setItem('classcheck_dev_senders', JSON.stringify(list))
  } catch {}
}

function getLocalCourses() {
  try {
    const raw = localStorage.getItem('classcheck_dev_courses')
    if (raw) return JSON.parse(raw)
  } catch {}
  return MOCK_COURSES
}

function saveLocalCourses(list) {
  try {
    localStorage.setItem('classcheck_dev_courses', JSON.stringify(list))
  } catch {}
}

function getLocalWaitlist() {
  try {
    const raw = localStorage.getItem('classcheck_dev_waitlist')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Purge any previous mock/dummy entries starting with 'wl_'
    const realOnly = parsed.filter((w) => !w.id?.startsWith('wl_'))
    if (realOnly.length !== parsed.length) {
      localStorage.setItem('classcheck_dev_waitlist', JSON.stringify(realOnly))
    }
    return realOnly
  } catch {
    return []
  }
}

async function fetchApi(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = localStorage.getItem('classcheck_token')

  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorMessage = `API request failed (${response.status})`

      try {
        const data = await response.json()

        if (data?.details?.length) {
          errorMessage = data.details
            .map((detail) => `${detail.field}: ${detail.message}`)
            .join('\n')
        } else {
          errorMessage = data?.error || errorMessage
        }
      } catch {
        const text = await response.text().catch(() => '')
        if (text) errorMessage = text
      }

      throw new Error(errorMessage)
    }

    if (response.status === 204) return null

    const contentType = response.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) return response.text()

    return response.json()
  } catch (err) {
    console.log(err)
  }
}

async function completeAuth(authResult) {
  const session = authResult?.data?.session
  const token = session?.access_token || 'dev-token'

  if (token) localStorage.setItem('classcheck_token', token)

  let profile = authResult?.data?.user
  if (!profile) {
    try {
      const profileResult = await fetchApi('/profile/me')
      profile = profileResult?.data
    } catch {}
  }

  if (profile) localStorage.setItem('classcheck_user', JSON.stringify(profile))

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('classcheck_auth_change'))
  }

  return { user: profile, session }
}

export const api = {
  // ================================================================
  // AUTH
  // ================================================================

  signUpStudent: async (data) => {
    const fullName = data.fullName || data.full_name
    const matricNo = data.matricNo || data.matric_no
    const { email, department, level, password } = data

    const result = await fetchApi('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        full_name: fullName,
        matric_no: matricNo,
        email,
        department,
        level,
        password,
      }),
    })

    console.log(result)
    return completeAuth(result)
  },

  signInStudent: async ({ email, matricNo, password }) => {
    const result = await fetchApi('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, matric_no: matricNo, password }),
    })
    return completeAuth(result)
  },

  signInSender: async ({ email, password }) => {
    const result = await fetchApi('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return completeAuth(result)
  },

  signInAdmin: async ({ email, password }) => {
    const result = await fetchApi('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return completeAuth(result)
  },

  signOut: async () => {
    try {
      await fetchApi('/auth/signout', { method: 'POST' })
    } finally {
      localStorage.removeItem('classcheck_token')
      localStorage.removeItem('classcheck_user')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('classcheck_auth_change'))
      }
    }
  },

  getSession: async () => {
    const token = localStorage.getItem('classcheck_token')
    const userString = localStorage.getItem('classcheck_user')

    if (!token || !userString) return { user: null, token: null }

    try {
      return { user: JSON.parse(userString), token }
    } catch {
      localStorage.removeItem('classcheck_user')
      return { user: null, token }
    }
  },

  resetPassword: (matricNo) =>
    fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ matric_no: matricNo }),
    }),

  updatePassword: (password) =>
    fetchApi('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),

  deleteAccount: async () => {
    const result = await fetchApi('/auth/account', { method: 'DELETE' })
    localStorage.removeItem('classcheck_token')
    localStorage.removeItem('classcheck_user')
    return result
  },

  // ================================================================
  // PROFILE
  // ================================================================

  getMyProfile: () => fetchApi('/profile/me'),

  getProfile: (id) => fetchApi(`/profile/${id}`),

  updateProfile: (data) =>
    fetchApi('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ================================================================
  // COURSES (catalog)
  // ================================================================

  getCourses: () => fetchApi('/courses'),

  createCourse: (data) =>
    fetchApi('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteCourse: (id) =>
    fetchApi(`/courses/${id}`, { method: 'DELETE' }),

  // ================================================================
  // STUDENT SUBSCRIPTIONS
  // ================================================================

  getStudentSubscriptions: (studentId) =>
    fetchApi(`/students/${studentId}/courses`),

  updateSubscriptions: (studentId, courseIds) =>
    fetchApi(`/students/${studentId}/courses`, {
      method: 'PUT',
      body: JSON.stringify({ course_ids: courseIds }),
    }),

  // ================================================================
  // SENDER COURSES + UPDATES
  // ================================================================
  
  getSenderCourses: async (senderId) => {
    const result = await fetchApi(`/senders/${senderId}/courses`)
    return { data: (result?.data || []).map((row) => row.courses).filter(Boolean) }
  },

  getSenderHistory: (senderId) => fetchApi(`/senders/${senderId}/updates`),

  getFeed: () => fetchApi('/feed'),

  postUpdate: (data) =>
    fetchApi('/updates', {
      method: 'POST',
      body: JSON.stringify({
        course_id: data.course_id,
        type:      data.type,
        new_venue: data.new_venue,
        note:      data.note,
      }),
    }),

  deleteUpdate: (updateId) =>
    fetchApi(`/updates/${updateId}`, { method: 'DELETE' }),

  getAllUpdates: () => fetchApi('/updates'),

  // ================================================================
  // ADMIN: SENDERS
  // ================================================================

  getSenders: () => fetchApi('/senders'),

  createSender: (data) =>
    fetchApi('/senders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSenderStatus: (id, status) =>
    fetchApi(`/senders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deleteSender: (id) =>
    fetchApi(`/senders/${id}`, { method: 'DELETE' }),

  // ================================================================
  // ADMIN: OVERVIEW
  // ================================================================

  getOverviewMetrics: () => fetchApi('/admin/overview'),

  // ================================================================
  // NOTIFICATIONS
  // ================================================================

  getNotifications: () => fetchApi('/notifications'),

  markAllNotificationsRead: () =>
    fetchApi('/notifications/read-all', { method: 'PUT' }),

  markNotificationRead: (notificationId) =>
    fetchApi(`/notifications/${notificationId}/read`, { method: 'PUT' }),

  // ================================================================
  // WAITLIST & STUDENTS (ADMIN / ANALYTICS)
  // ================================================================

  joinWaitlist: (data) =>
    fetchApi('/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getWaitlistEntries: () => fetchApi('/waitlist'),

  updateWaitlistStatus: (id, status) =>
    fetchApi(`/waitlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deleteWaitlistEntry: (id) =>
    fetchApi(`/waitlist/${id}`, { method: 'DELETE' }),

  getRegisteredStudents: () => fetchApi('/students'),

  // ================================================================
  // TIMETABLE
  // ================================================================

  getTimetable: (params = {}) => {
    const query = new URLSearchParams()
    if (params.day) query.set('day', params.day)
    if (params.course_id) query.set('course_id', params.course_id)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return fetchApi(`/timetable${qs}`)
  },

  getMyTimetable: (params = {}) => {
    const query = new URLSearchParams()
    if (params.day) query.set('day', params.day)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return fetchApi(`/timetable/me${qs}`)
  },

  createTimetableEntry: (data) =>
    fetchApi('/timetable', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTimetableEntry: (id, data) =>
    fetchApi(`/timetable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTimetableEntry: (id) =>
    fetchApi(`/timetable/${id}`, { method: 'DELETE' }),

  // ================================================================
  // FACULTY & COURSE REP DIRECTORY
  // ================================================================

  getDirectory: (params = {}) => {
    const query = new URLSearchParams()
    if (params.role) query.set('role', params.role)
    if (params.department) query.set('department', params.department)
    if (params.search) query.set('search', params.search)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return fetchApi(`/directory${qs}`)
  },

  getMyFacilitators: () => fetchApi('/directory/me'),

  // ================================================================
  // HALL PULSE (CROWDSOURCED LECTURE STATUS)
  // ================================================================

  getHallPulse: (courseId) => fetchApi(`/hall-pulse/${courseId}`),

  submitHallPulse: (data) =>
    fetchApi('/hall-pulse', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export { BASE_URL, fetchApi }