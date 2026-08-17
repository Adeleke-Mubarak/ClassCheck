import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signInSender, signInAdmin, getUserRole } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function SenderSignIn() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await signInSender(form)
      // Determine role and redirect appropriately
      const role = await getUserRole(user)
      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'sender') {
        navigate('/sender/portal')
      } else {
        await supabase.auth.signOut()
        toast.error('Your account is not authorised. Contact your department admin.')
      }
    } catch (err) {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6">
        <Link to="/" className="font-semibold text-gray-900">ClassCheck</Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px]">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900">Sender sign in</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              For lecturers and class reps. Sign in with your email address.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your@university.edu.ng"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span className="font-medium text-gray-900">
                  Contact your department admin to get access.
                </span>{' '}
                Senders cannot self-register.
              </p>
            </div>

            <p className="mt-4 text-center">
              <Link to="/signin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Sign in as a student instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
