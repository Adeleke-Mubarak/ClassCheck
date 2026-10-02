export type ProfileRole   = 'student' | 'lecturer' | 'class_rep' | 'admin'
export type SenderStatus  = 'active' | 'inactive'
export type UpdateType    = 'cancelled' | 'venue_change'

export interface Profile {
  id:         string
  full_name:  string
  email:      string
  matric_no:  string | null
  department: string | null
  level:      string | null
  role:       ProfileRole
  status:     SenderStatus
  created_at: string
  updated_at: string
}

export interface Course {
  id:          string
  course_code: string
  course_name: string
  department:  string
  level:       string
  created_at:  string
}

export interface StudentCourse {
  id:         string
  student_id: string
  course_id:  string
  created_at: string
}

export interface SenderCourse {
  id:         string
  sender_id:  string
  course_id:  string
  created_at: string
}

export interface UpdatePost {
  id:         string
  course_id:  string
  sender_id:  string
  type:       UpdateType
  new_venue:  string | null
  note:       string | null
  created_at: string
}

export interface Notification {
  id:         string
  user_id:    string
  update_id:  string | null
  message:    string
  is_read:    boolean
  created_at: string
}

export interface WaitlistEntry {
  id:         string
  name:       string
  email:      string
  department: string
  university: string
  created_at: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id:         string
        email:      string
        role:       ProfileRole
        status:     SenderStatus
        department: string | null
        level:      string | null
      }
    }
  }
}