import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../lib/api'

export default function ForgotPassword() {
  const [matricNo, setMatricNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.resetPassword(matricNo)
      setDone(true)
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="light-workspace min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <header className="h-14 border-b border-white/[0.08] bg-[#0A0A0A] flex items-center px-6">
        <Link to="/" className="font-extrabold text-base tracking-tight text-white">ClassCheck</Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px]">
          {done ? (
            <div className="bg-[#111111] border border-white/[0.08] rounded-[6px] p-8 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-[6px] border border-white/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Check your email</h2>
              <p className="mt-2 text-xs text-white/50 leading-relaxed">
                If an account exists for matric number{' '}
                <span className="font-semibold text-white">{matricNo.toUpperCase()}</span>, a password
                reset link has been sent to the associated email.
              </p>
              <Link
                to="/signin"
                className="mt-6 inline-block text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-[4px] border border-white/10 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <div className="bg-[#111111] border border-white/[0.08] rounded-[6px] p-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40 block mb-1">Account recovery</span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset your password</h1>
              <p className="mt-1.5 text-xs text-white/50 leading-relaxed">
                Enter your matriculation number and we will send a password reset link to your registered email address.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="form-label" htmlFor="matricNo">Matriculation number</label>
                  <input
                    id="matricNo"
                    type="text"
                    required
                    placeholder="e.g. 190404001"
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary mt-3"
                >
                  {loading ? 'Sending link...' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-6 text-center">
                <Link to="/signin" className="text-xs text-white/50 hover:text-white transition-colors">
                  ← Back to sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
