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
      list = initialUser ? [initialUser] : [
        {
          id: 'student_pilot_1',
          full_name: 'Adeleke Mubarak',
          email: 'adeleke.mubarak@student.edu.ng',
          matric_no: 'MAT/2021/042',
          department: 'Mathematics',
          level: '400',
          role: 'student',
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ]
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
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
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

    try {
      const raw = localStorage.getItem('classcheck_registered_students')
      const list = raw ? JSON.parse(raw) : []
      if (!list.some((s) => s.email === user.email || s.matric_no === user.matric_no)) {
        list.push(user)
      }
      localStorage.setItem('classcheck_registered_students', JSON.stringify(list))
    } catch {}

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
          full_name: role === 'admin' ? 'System Administrator' : role === 'class_rep' ? 'Taiwo Daniel (Class Rep)' : role === 'lecturer' ? 'Prof Moses Akanbi' : (storedUser?.full_name || 'Student User'),
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

    if (role === 'student') {
      try {
        const raw = localStorage.getItem('classcheck_registered_students')
        const list = raw ? JSON.parse(raw) : []
        if (!list.some((s) => s.email === user.email || s.matric_no === user.matric_no)) {
          list.push(user)
        }
        localStorage.setItem('classcheck_registered_students', JSON.stringify(list))
      } catch {}
    }

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
    const courses = getLocalCourses()
    if (method === 'POST') {
      const newCourse = {
        id: `c_${Date.now()}`,
        course_code: body.course_code || 'MAT499',
        course_name: body.course_name || 'Mathematics Elective',
        department: body.department || 'Mathematics',
        level: body.level || '400',
        created_at: new Date().toISOString(),
      }
      courses.push(newCourse)
      saveLocalCourses(courses)
      return { data: newCourse }
    }
    return { data: courses }
  }
  if (endpoint.startsWith('/courses/') && method === 'DELETE') {
    const id = endpoint.split('/').pop()
    const courses = getLocalCourses().filter((c) => c.id !== id)
    saveLocalCourses(courses)
    return { data: { success: true } }
  }

  // 6. Student courses / subscriptions
  if (endpoint.includes('/students/') && endpoint.includes('/courses')) {
    const allCourses = getLocalCourses()
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
    const matchingCourses = allCourses.filter((c) => subs.includes(c.id))
    return {
      data: matchingCourses.map((c) => ({
        id: `sc_${c.id}`,
        student_id: 'student_pilot_1',
        course_id: c.id,
        courses: c,
      })),
    }
  }

  // 7. Feed
  if (endpoint.startsWith('/feed')) {
    const allUpdates = getLocalUpdates()
    return { data: allUpdates }
  }

  // 8. Updates (Post update, List all updates, Delete update)
  if (endpoint === '/updates' || endpoint.startsWith('/updates/')) {
    const allUpdates = getLocalUpdates()
    if (method === 'POST') {
      const courses = getLocalCourses()
      const courseObj = courses.find((c) => c.id === body.course_id) || {
        id: body.course_id,
        course_code: 'MAT401',
        course_name: 'Real Analysis III',
      }
      let senderInfo = { full_name: 'Class Rep', role: 'class_rep' }
      try {
        const uRaw = localStorage.getItem('classcheck_user')
        if (uRaw) {
          const u = JSON.parse(uRaw)
          senderInfo = { full_name: u.full_name || 'Class Rep', role: u.role || 'class_rep' }
        }
      } catch {}

      const newUpdate = {
        id: `u_${Date.now()}`,
        course_id: body.course_id,
        type: body.type,
        new_venue: body.new_venue || null,
        note: body.note || null,
        created_at: new Date().toISOString(),
        courses: courseObj,
        senders: senderInfo,
      }
      allUpdates.unshift(newUpdate)
      try {
        localStorage.setItem('classcheck_dev_updates', JSON.stringify(allUpdates))
      } catch {}
      return { data: newUpdate }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop()
      const filtered = allUpdates.filter((u) => u.id !== id)
      try {
        localStorage.setItem('classcheck_dev_updates', JSON.stringify(filtered))
      } catch {}
      return { data: { success: true } }
    }
    return { data: allUpdates }
  }

  // 9. Timetable
  if (endpoint.startsWith('/timetable')) {
    const timetable = getLocalTimetable()
    if (endpoint === '/timetable' && method === 'POST') {
      const courseObj = getLocalCourses().find((c) => c.id === body.course_id) || {}
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
    const senders = getLocalSenders().filter((s) => s.status === 'active')
    return { data: senders }
  }

  // 11. Admin Overview
  if (endpoint.startsWith('/admin/overview')) {
    const students = getRegisteredStudents()
    const senders = getLocalSenders().filter((s) => s.status === 'active')
    const courses = getLocalCourses()
    const allUpdates = getLocalUpdates()
    const todayUpdates = allUpdates.filter((u) => isDateToday(u.created_at))
    return {
      data: {
        students: students.length,
        senders: senders.length,
        courses: courses.length,
        todayUpdates: todayUpdates.length,
        recentUpdates: allUpdates.slice(0, 5),
        recentSenders: senders.slice(0, 5),
      },
    }
  }

  // 12. Senders
  if (endpoint.startsWith('/senders')) {
    if (endpoint.includes('/courses')) {
      const courses = getLocalCourses()
      return { data: courses.map((c) => ({ courses: c })) }
    }
    if (endpoint.includes('/updates')) {
      const allUpdates = getLocalUpdates()
      return { data: allUpdates }
    }
    const senders = getLocalSenders()
    if (endpoint === '/senders' && method === 'POST') {
      const newSender = {
        id: `dir-${Date.now()}`,
        full_name: body.full_name || 'New Facilitator',
        email: body.email || '',
        role: body.role || 'lecturer',
        department: body.department || 'Mathematics',
        location: body.location || '',
        office_hours: body.office_hours || '',
        phone: body.phone || null,
        status: 'active',
        created_at: new Date().toISOString(),
      }
      senders.push(newSender)
      saveLocalSenders(senders)
      return { data: newSender }
    }
    if (endpoint.includes('/status') && (method === 'PUT' || method === 'PATCH')) {
      const parts = endpoint.split('/')
      const sId = parts[2]
      const nextSenders = senders.map((s) =>
        s.id === sId ? { ...s, status: body.status || (s.status === 'active' ? 'inactive' : 'active') } : s
      )
      saveLocalSenders(nextSenders)
      return { data: nextSenders.find((s) => s.id === sId) }
    }
    if (method === 'DELETE') {
      const sId = endpoint.split('/').pop()
      const nextSenders = senders.filter((s) => s.id !== sId)
      saveLocalSenders(nextSenders)
      return { data: { success: true } }
    }
    return { data: senders }
  }

  // 13. Students (for Admin listing)
  if (endpoint.startsWith('/students') && !endpoint.includes('/courses')) {
    return { data: getRegisteredStudents() }
  }

  // 14. Notifications
  if (endpoint.startsWith('/notifications')) {
    return { data: [] }
  }

  // 15. Waitlist
  if (endpoint.startsWith('/waitlist')) {
    const waitlist = getLocalWaitlist()
    if (method === 'POST') {
      const newEntry = {
        id: `wait_${Date.now()}`,
        full_name: body.full_name || body.fullName || 'Prospective Student',
        email: body.email || '',
        university: body.university || 'University of Lagos',
        department: body.department || 'Computer Science',
        level: body.level || '300',
        created_at: new Date().toISOString(),
      }
      waitlist.unshift(newEntry)
      try {
        localStorage.setItem('classcheck_dev_waitlist', JSON.stringify(waitlist))
      } catch {}
      return { data: newEntry }
    }
    return { data: waitlist }
  }

  // 15. Hall Pulse (Crowdsourced Lecture Status)
  if (endpoint.startsWith('/hall-pulse')) {
    const parts = endpoint.split('/')
    const courseId = parts[2] || body.course_id || 'default'
    const todayStr = new Date().toISOString().slice(0, 10)
    const storageKey = `classcheck_hall_pulse_${courseId}_${todayStr}`

    let pulseData = {
      course_id: courseId,
      status: null,
      consensus: null,
      reports: [],
      counts: { lecturer_present: 0, hall_empty: 0, class_holding: 0 },
    }
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) pulseData = JSON.parse(stored)
    } catch {}

    if (method === 'POST') {
      const { status, user_id, user_name } = body
      const existingIdx = pulseData.reports.findIndex((r) => r.user_id === user_id)
      const report = {
        user_id: user_id || `anon_${Date.now()}`,
        user_name: user_name || 'Coursemate',
        status,
        timestamp: new Date().toISOString(),
      }
      if (existingIdx !== -1) {
        pulseData.reports[existingIdx] = report
      } else {
        pulseData.reports.push(report)
      }

      pulseData.counts = { lecturer_present: 0, hall_empty: 0, class_holding: 0 }
      for (const r of pulseData.reports) {
        if (pulseData.counts[r.status] !== undefined) {
          pulseData.counts[r.status]++
        }
      }

      let consensus = null
      for (const [st, count] of Object.entries(pulseData.counts)) {
        if (count >= 3) {
          consensus = st
          break
        }
      }
      pulseData.consensus = consensus
      try {
        localStorage.setItem(storageKey, JSON.stringify(pulseData))
      } catch {}
      return { data: pulseData }
    }

    return { data: pulseData }
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
  // WAITLIST & STUDENTS (ADMIN / ANALYTICS)
  // ================================================================

  joinWaitlist: (data) =>
    fetchApi('/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getWaitlistEntries: () => fetchApi('/waitlist'),

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