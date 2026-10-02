const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

async function fetchApi(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = localStorage.getItem('classcheck_token')

  if (token) headers.Authorization = `Bearer ${token}`

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
}

async function completeAuth(authResult) {
  const session = authResult?.data?.session
  const token = session?.access_token

  if (token) localStorage.setItem('classcheck_token', token)

  const profileResult = await fetchApi('/profile/me')
  const profile = profileResult?.data

  if (profile) localStorage.setItem('classcheck_user', JSON.stringify(profile))

  return { user: profile, session }
}

export const api = {
  // ================================================================
  // AUTH
  // ================================================================

  signUpStudent: async ({ fullName, matricNo, email, department, level, password }) => {
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

  signInStudent: async ({ matricNo, password }) => {
    const result = await fetchApi('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ matric_no: matricNo, password }),
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
}

export { BASE_URL, fetchApi }