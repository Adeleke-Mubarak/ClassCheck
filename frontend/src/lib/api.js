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

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  
  if (!res.ok) {
    let errorMsg = 'API request failed'
    try {
      const errData = await res.json()
      errorMsg = errData.message || errorMsg
    } catch (e) {
      // If response is not JSON
      errorMsg = await res.text() || errorMsg
    }
    throw new Error(errorMsg)
  }
  
  return await res.json()
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



