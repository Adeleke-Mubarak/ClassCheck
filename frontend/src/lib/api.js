const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// ============================================================================
// LOCAL DEV MOCK FALLBACK DATA & HANDLER
// Used seamlessly when the backend on :3000 is not running
// ============================================================================

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
    lecturer_name: 'Prof. Adeyemi',
    note: 'Weekly foundational lecture',
    courses: { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III', level: '400' },
  },
  {
    id: 'tt-2',
    course_id: 'c2',
    day_of_week: 'monday',
    start_time: '12:00',
    end_time: '14:00',
    venue: 'Math Lab 1',
    lecturer_name: 'Dr. Okon',
    note: 'Practical problem set review',
    courses: { id: 'c2', course_code: 'MAT403', course_name: 'Complex Analysis II', level: '400' },
  },
  {
    id: 'tt-3',
    course_id: 'c3',
    day_of_week: 'tuesday',
    start_time: '10:00',
    end_time: '12:00',
    venue: 'NLH 3',
    lecturer_name: 'Dr. Bello',
    note: 'Main lecture',
    courses: { id: 'c3', course_code: 'MAT405', course_name: 'Abstract Algebra II', level: '400' },
  },
  {
    id: 'tt-4',
    course_id: 'c4',
    day_of_week: 'wednesday',
    start_time: '08:00',
    end_time: '10:00',
    venue: 'LT1',
    lecturer_name: 'Prof. Adeleke',
    note: 'Tutorial & theorems',
    courses: { id: 'c4', course_code: 'MAT407', course_name: 'Differential Equations III', level: '400' },
  },
  {
    id: 'tt-5',
    course_id: 'c1',
    day_of_week: 'thursday',
    start_time: '14:00',
    end_time: '16:00',
    venue: 'LT2',
    lecturer_name: 'Prof. Adeyemi',
    note: 'Advanced problem solving',
    courses: { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III', level: '400' },
  },
  {
    id: 'tt-6',
    course_id: 'c5',
    day_of_week: 'friday',
    start_time: '10:00',
    end_time: '12:00',
    venue: 'Math Lab 2',
    lecturer_name: 'Dr. Ibrahim',
    note: 'Theory & topological proofs',
    courses: { id: 'c5', course_code: 'MAT409', course_name: 'Topology', level: '400' },
  },
]

const MOCK_DIRECTORY = [
  {
    id: 'dir-1',
    full_name: 'Prof. Olumide Adeyemi',
    email: 'o.adeyemi@university.edu.ng',
    role: 'hod',
    department: 'Mathematics',
    level: null,
    location: 'Faculty of Science, Room 302 (HOD Office)',
    office_hours: 'Mondays & Wednesdays: 10:00 AM – 12:00 PM',
    phone: '+234 803 111 2233',
    status: 'active',
    courses: [
      { id: 'c1', course_code: 'MAT401', course_name: 'Real Analysis III' },
      { id: 'c9', course_code: 'MAT417', course_name: 'Mathematical Methods' },
    ],
  },
  {
    id: 'dir-2',
    full_name: 'Dr. Kelechi Okon',
    email: 'k.okon@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Math Block B, Office 14',
    office_hours: 'Tuesdays & Thursdays: 1:00 PM – 3:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c2', course_code: 'MAT403', course_name: 'Complex Analysis II' },
      { id: 'c7', course_code: 'MAT413', course_name: 'Numerical Analysis II' },
    ],
  },
  {
    id: 'dir-3',
    full_name: 'Dr. Amina Bello',
    email: 'a.bello@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Science Complex, Room 210',
    office_hours: 'Wednesdays & Fridays: 11:00 AM – 1:00 PM',
    phone: '+234 805 444 5566',
    status: 'active',
    courses: [
      { id: 'c3', course_code: 'MAT405', course_name: 'Abstract Algebra II' },
    ],
  },
  {
    id: 'dir-4',
    full_name: 'Prof. Musa Adeleke',
    email: 'm.adeleke@university.edu.ng',
    role: 'lecturer',
    department: 'Mathematics',
    level: null,
    location: 'Senate Building, 4th Floor, Suite 408',
    office_hours: 'Mondays & Thursdays: 2:00 PM – 4:00 PM',
    phone: null,
    status: 'active',
    courses: [
      { id: 'c4', course_code: 'MAT407', course_name: 'Differential Equations III' },
      { id: 'c8', course_code: 'MAT415', course_name: 'Operations Research' },
    ],
  },
  {
    id: 'dir-5',
    full_name: 'Tunde Bakare',
    email: 'tunde.bakare@student.edu.ng',
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
    ],
  },
]

function getLocalTimetable() {
  try {
    const raw = localStorage.getItem('classcheck_dev_timetable')
    if (raw) return JSON.parse(raw)
  } catch {}
  return MOCK_TIMETABLE_INITIAL
}

function saveLocalTimetable(list) {
  try {
    localStorage.setItem('classcheck_dev_timetable', JSON.stringify(list))
  } catch {}
}

function handleDevFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  let body = {}
  try {
    if (options.body) body = JSON.parse(options.body)
  } catch {}

  console.info(`[ClassCheck Dev Fallback] Offline server at ${endpoint} (${method}) — using local persistence.`)

  // 1. Sign Up
  if (endpoint.startsWith('/auth/signup') && method === 'POST') {
    const user = {
      id: `student_${Date.now()}`,
      full_name: body.full_name || body.fullName || 'Student User',
      matric_no: body.matric_no || body.matricNo || 'MAT/2026/001',
      email: body.email || 'student@classcheck.app',
      department: body.department || 'Mathematics',
      level: body.level || '400',
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
    }
    const token = `dev_token_${Date.now()}`
    localStorage.setItem('classcheck_token', token)
    localStorage.setItem('classcheck_user', JSON.stringify(user))
    return {
      data: {
        session: { access_token: token },
        user,
      },
    }
  }

  // 2. Sign In
  if (endpoint.startsWith('/auth/signin') && method === 'POST') {
    const email = (body.email || '').toLowerCase()
    let role = 'student'
    if (email.includes('admin')) role = 'admin'
    else if (email.includes('rep')) role = 'class_rep'
    else if (email.includes('lecturer')) role = 'lecturer'

    let storedUser = null
    try {
      const raw = localStorage.getItem('classcheck_user')
      if (raw) storedUser = JSON.parse(raw)
    } catch {}

    const user = storedUser && storedUser.role === role
      ? storedUser
      : {
          id: `user_${Date.now()}`,
          full_name: role === 'admin' ? 'System Administrator' : role === 'class_rep' ? 'Tunde Bakare (Rep)' : role === 'lecturer' ? 'Dr. Kelechi Okon' : (storedUser?.full_name || 'Student User'),
          email: body.email || (storedUser?.email || 'user@classcheck.app'),
          matric_no: body.matric_no || (storedUser?.matric_no || 'MAT/2026/001'),
          department: storedUser?.department || 'Mathematics',
          level: storedUser?.level || '400',
          role,
          status: 'active',
          created_at: new Date().toISOString(),
        }

    const token = `dev_token_${Date.now()}`
    localStorage.setItem('classcheck_token', token)
    localStorage.setItem('classcheck_user', JSON.stringify(user))
    return {
      data: {
        session: { access_token: token },
        user,
      },
    }
  }

  // 3. Profile me
  if (endpoint.startsWith('/profile/me')) {
    if (method === 'PUT') {
      let current = {}
      try {
        const raw = localStorage.getItem('classcheck_user')
        if (raw) current = JSON.parse(raw)
      } catch {}
      const updated = { ...current, ...body, updated_at: new Date().toISOString() }
      localStorage.setItem('classcheck_user', JSON.stringify(updated))
      return { data: updated }
    }
    let user = null
    try {
      const raw = localStorage.getItem('classcheck_user')
      if (raw) user = JSON.parse(raw)
    } catch {}
    if (!user) {
      user = {
        id: 'dev_student',
        full_name: 'Student User',
        email: 'student@classcheck.app',
        matric_no: 'MAT/2026/001',
        department: 'Mathematics',
        level: '400',
        role: 'student',
        status: 'active',
      }
    }
    return { data: user }
  }

  // 4. Sign out
  if (endpoint.startsWith('/auth/signout')) {
    localStorage.removeItem('classcheck_token')
    localStorage.removeItem('classcheck_user')
    return { data: { success: true } }
  }

  // 5. Courses
  if (endpoint === '/courses' || endpoint.startsWith('/courses?')) {
    return { data: MOCK_COURSES }
  }

  // 6. Student courses / subscriptions
  if (endpoint.includes('/students/') && endpoint.includes('/courses')) {
    if (method === 'PUT') {
      const ids = body.course_ids || []
      localStorage.setItem('classcheck_dev_subscribed_ids', JSON.stringify(ids))
      return { data: ids }
    }
    let subs = ['c1', 'c2', 'c3', 'c4']
    try {
      const raw = localStorage.getItem('classcheck_dev_subscribed_ids')
      if (raw) subs = JSON.parse(raw)
    } catch {}
    const matchingCourses = MOCK_COURSES.filter((c) => subs.includes(c.id))
    return {
      data: matchingCourses.map((c) => ({
        id: `sc_${c.id}`,
        student_id: 'dev_student',
        course_id: c.id,
        courses: c,
      })),
    }
  }

  // 7. Feed
  if (endpoint.startsWith('/feed')) {
    let extraUpdates = []
    try {
      const raw = localStorage.getItem('classcheck_dev_updates')
      if (raw) extraUpdates = JSON.parse(raw)
    } catch {}
    const defaultFeed = [
      {
        id: 'u-1',
        type: 'cancelled',
        new_venue: null,
        note: 'Prof. Adeyemi is attending the faculty board meeting this morning.',
        created_at: new Date().toISOString(),
        courses: { course_code: 'MAT401', course_name: 'Real Analysis III' },
        senders: { full_name: 'Prof. Olumide Adeyemi', role: 'lecturer' },
      },
      {
        id: 'u-2',
        type: 'venue_change',
        new_venue: 'Large Lecture Theatre 2 (LT2)',
        note: 'Relocated from Lab 1 due to departmental presentation.',
        created_at: new Date().toISOString(),
        courses: { course_code: 'MAT403', course_name: 'Complex Analysis II' },
        senders: { full_name: 'Tunde Bakare', role: 'class_rep' },
      },
    ]
    return { data: [...extraUpdates, ...defaultFeed] }
  }

  // 8. Updates (Post update)
  if (endpoint === '/updates' && method === 'POST') {
    const courseObj = MOCK_COURSES.find((c) => c.id === body.course_id) || {
      course_code: 'MAT401',
      course_name: 'Real Analysis III',
    }
    const newUpdate = {
      id: `u_${Date.now()}`,
      course_id: body.course_id,
      type: body.type,
      new_venue: body.new_venue || null,
      note: body.note || null,
      created_at: new Date().toISOString(),
      courses: courseObj,
      senders: { full_name: 'Course Rep', role: 'class_rep' },
    }
    try {
      const raw = localStorage.getItem('classcheck_dev_updates')
      const list = raw ? JSON.parse(raw) : []
      list.unshift(newUpdate)
      localStorage.setItem('classcheck_dev_updates', JSON.stringify(list))
    } catch {}
    return { data: newUpdate }
  }

  // 9. Timetable
  if (endpoint.startsWith('/timetable')) {
    const timetable = getLocalTimetable()
    if (endpoint === '/timetable' && method === 'POST') {
      const courseObj = MOCK_COURSES.find((c) => c.id === body.course_id) || {}
      const newEntry = {
        id: `tt_${Date.now()}`,
        ...body,
        courses: courseObj,
        created_at: new Date().toISOString(),
      }
      timetable.push(newEntry)
      saveLocalTimetable(timetable)
      return { data: newEntry }
    }
    if (method === 'PUT') {
      const id = endpoint.split('/').pop()
      const index = timetable.findIndex((t) => t.id === id)
      if (index !== -1) {
        timetable[index] = { ...timetable[index], ...body }
        saveLocalTimetable(timetable)
        return { data: timetable[index] }
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop()
      const filtered = timetable.filter((t) => t.id !== id)
      saveLocalTimetable(filtered)
      return null
    }
    return { data: timetable }
  }

  // 10. Directory
  if (endpoint.startsWith('/directory')) {
    return { data: MOCK_DIRECTORY }
  }

  // 11. Admin Overview
  if (endpoint.startsWith('/admin/overview')) {
    return {
      data: {
        students: 42,
        senders: 8,
        courses: 11,
        todayUpdates: 2,
        recentUpdates: [],
        recentSenders: [],
      },
    }
  }

  // 12. Senders
  if (endpoint.startsWith('/senders')) {
    return { data: MOCK_DIRECTORY }
  }

  // 13. Notifications
  if (endpoint.startsWith('/notifications')) {
    return { data: [] }
  }

  // 14. Waitlist
  if (endpoint.startsWith('/waitlist')) {
    return { data: { success: true } }
  }

  return { data: [] }
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
    const isNetworkError =
      err.message === 'Failed to fetch' ||
      err.name === 'TypeError' ||
      err.message.includes('fetch') ||
      err.message.includes('NetworkError')

    if (isNetworkError) {
      return handleDevFallback(endpoint, options)
    }

    throw err
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
  // WAITLIST
  // ================================================================

  joinWaitlist: (data) =>
    fetchApi('/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

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
}

export { BASE_URL, fetchApi }