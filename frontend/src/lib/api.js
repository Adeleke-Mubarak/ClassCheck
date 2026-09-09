// This is the new API client that replaces Supabase.
// Your backend developer can configure this BASE_URL to point to their new custom backend.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Helper for making fetch requests
async function fetchApi(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Example: Attach token from localStorage if you have one
  const token = localStorage.getItem('classcheck_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // MOCK MODE: If there is no real backend yet, we will just return dummy data.
  // The backend developer should remove this try-catch block and use the real fetch.
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'API request failed')
    }
    return await res.json()
  } catch (err) {
    console.warn(`[MOCK API] Caught error fetching ${endpoint}:`, err.message)
    // Return mock responses so the frontend doesn't crash while the backend is being built
    return mockData(endpoint, options)
  }
}

// ------------------------------------------------------------------
// API Client
// ------------------------------------------------------------------
export const api = {
  // --- Auth ---
  signUpStudent: (data) => fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  signInStudent: (data) => fetchApi('/auth/signin/student', { method: 'POST', body: JSON.stringify(data) }),
  signInSender: (data) => fetchApi('/auth/signin/sender', { method: 'POST', body: JSON.stringify(data) }),
  signInAdmin: (data) => fetchApi('/auth/signin/admin', { method: 'POST', body: JSON.stringify(data) }),
  signOut: () => {
    localStorage.removeItem('classcheck_token')
    localStorage.removeItem('classcheck_user')
    return Promise.resolve()
  },
  getSession: async () => {
    const userStr = localStorage.getItem('classcheck_user')
    if (userStr) return { user: JSON.parse(userStr) }
    return { user: null }
  },
  resetPassword: (email) => fetchApi('/auth/reset', { method: 'POST', body: JSON.stringify({ email }) }),
  updatePassword: (password) => fetchApi('/auth/update-password', { method: 'POST', body: JSON.stringify({ password }) }),

  // --- Student Data ---
  getCourses: () => fetchApi('/courses'),
  getStudentSubscriptions: (studentId) => fetchApi(`/students/${studentId}/subscriptions`),
  updateSubscriptions: (studentId, courseIds) => fetchApi(`/students/${studentId}/subscriptions`, { method: 'POST', body: JSON.stringify({ courseIds }) }),
  getFeed: () => fetchApi('/feed'),
  deleteAccount: (studentId) => fetchApi(`/students/${studentId}`, { method: 'DELETE' }),

  // --- Sender Data ---
  getSenderCourses: (senderId) => fetchApi(`/senders/${senderId}/courses`),
  postUpdate: (data) => fetchApi('/updates', { method: 'POST', body: JSON.stringify(data) }),
  getSenderHistory: (senderId) => fetchApi(`/senders/${senderId}/history`),
  deleteUpdate: (updateId) => fetchApi(`/updates/${updateId}`, { method: 'DELETE' }),

  // --- Admin Data ---
  getOverviewMetrics: () => fetchApi('/admin/overview'),
  getSenders: () => fetchApi('/admin/senders'),
  updateSenderStatus: (senderId, status) => fetchApi(`/admin/senders/${senderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteSender: (senderId) => fetchApi(`/admin/senders/${senderId}`, { method: 'DELETE' }),
  createSender: (data) => fetchApi('/admin/senders', { method: 'POST', body: JSON.stringify(data) }),
  deleteCourse: (courseId) => fetchApi(`/admin/courses/${courseId}`, { method: 'DELETE' }),
  createCourse: (data) => fetchApi('/admin/courses', { method: 'POST', body: JSON.stringify(data) }),
  getAllUpdates: () => fetchApi('/admin/updates'),

  // --- Misc ---
  joinWaitlist: (data) => fetchApi('/waitlist', { method: 'POST', body: JSON.stringify(data) }),
}


// ------------------------------------------------------------------
// MOCK DATA GENERATOR (Temporary)
// ------------------------------------------------------------------
function mockData(endpoint, options) {
  if (endpoint.includes('/auth/signin')) {
    const user = { id: 'mock-user-1', email: 'test@students.classcheck.app', app_metadata: { role: 'student' }, user_metadata: { full_name: 'Mock User', department: 'Mathematics', level: '400' } }
    localStorage.setItem('classcheck_user', JSON.stringify(user))
    localStorage.setItem('classcheck_token', 'mock-token')
    return { user, token: 'mock-token' }
  }
  if (endpoint.includes('/courses')) return { data: [{ id: 'c1', course_code: 'MAT401', title: 'Real Analysis' }, { id: 'c2', course_code: 'MAT403', title: 'Complex Analysis' }] }
  if (endpoint.includes('/feed')) return { data: [{ id: 'u1', type: 'cancelled', message: 'Class cancelled today', created_at: new Date().toISOString(), courses: { course_code: 'MAT401' }, senders: { full_name: 'Dr. John', role: 'lecturer' } }] }
  if (endpoint.includes('/students/')) return { data: [] }
  if (endpoint.includes('/admin/overview')) return { data: { students: 10, senders: 2, updates: 5, courses: 11, recentUpdates: [], recentSenders: [] } }
  if (endpoint.includes('/admin/senders')) return { data: [] }
  if (endpoint.includes('/admin/updates')) return { data: [] }
  if (endpoint.includes('/senders/')) return { data: [] }
  return { data: [] }
}
