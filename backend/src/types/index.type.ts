export type ProfileRole = 'student' | 'lecturer' | 'hod' | 'dept_head' | 'admin'

export interface Profile {
  id:            string
  full_name:     string
  matric_no:     number
  is_admin:      boolean
  role:          ProfileRole
  department_id: string | null
  phone?:        string | null
  location?:     string | null
  created_at:    string
  updated_at:    string
}

export interface Department {
  id:         string
  name:       string
  code:       string
  created_at: string
}

export type ReactionType = 'like' | 'heart' | 'seen'

export interface Post {
  id:             string
  author_id:      string
  department_id:  string
  title:          string
  content:        string
  course_code:    string | null
  location:       string | null
  class_time:     string | null
  created_at:     string
  updated_at:     string
}

export interface Reaction {
  id:         string
  post_id:    string
  user_id:    string
  type:       ReactionType
  created_at: string
}

export interface Notification {
  id:         string
  user_id:    string
  post_id:    string | null
  message:    string
  is_read:    boolean
  created_at: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id:            string
        email:         string
        is_admin:      boolean
        role:          ProfileRole
        department_id: string | null
      }
    }
  }
}