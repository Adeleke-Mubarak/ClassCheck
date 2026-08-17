import { supabase } from './supabase'

// ─── Student Auth ────────────────────────────────────────────

/**
 * Students log in with matric number + password.
 * We map matric → synthetic internal email.
 */
export function matricToEmail(matricNo) {
  return `${matricNo.toLowerCase().replace(/\s/g, '')}@students.classcheck.app`
}

export async function signUpStudent({ fullName, matricNo, department, level, password }) {
  const email = matricToEmail(matricNo)

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        matric_no: matricNo.toUpperCase(),
      },
    },
  })

  if (authError) {
    if (authError.message?.toLowerCase().includes('rate') || authError.status === 429) {
      throw new Error('Too many attempts. Please wait a few minutes and try again.')
    }
    throw authError
  }

  // If no session (email confirmation is on), sign in manually.
  // The auto_confirm_user DB trigger has already confirmed the user.
  let userId = authData.user?.id
  let session = authData.session

  if (!session) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
    session = signInData.session
    userId = signInData.user?.id
  }

  if (!userId) throw new Error('Sign up failed — please try again.')

  const { error: profileError } = await supabase.from('students').insert({
    id: userId,
    full_name: fullName,
    matric_no: matricNo.toUpperCase(),
    department,
    level,
  })

  if (profileError) throw profileError

  return { session, user: { id: userId } }
}

export async function signInStudent({ matricNo, password }) {
  const email = matricToEmail(matricNo)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ─── Sender Auth ─────────────────────────────────────────────

export async function signInSender({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ─── Admin Auth ──────────────────────────────────────────────

export async function signInAdmin({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ─── Shared ──────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Determine user role by checking app_metadata + tables.
 * Returns 'admin' | 'sender' | 'student' | null
 */
export async function getUserRole(user) {
  if (!user) return null

  // Check admin via app_metadata set in Supabase dashboard
  const appMeta = user.app_metadata || {}
  if (appMeta.role === 'admin') return 'admin'

  // Check sender
  const { data: sender } = await supabase
    .from('senders')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (sender) return 'sender'

  // Default to student
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (student) return 'student'

  return null
}

export async function resetPasswordByMatric(matricNo) {
  const email = matricToEmail(matricNo)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-confirm`,
  })
  if (error) throw error
}
