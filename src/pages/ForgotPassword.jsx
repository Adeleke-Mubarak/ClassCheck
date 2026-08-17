import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPasswordByMatric } from '../lib/auth'

export default function ForgotPassword() {
  const [matricNo, setMatricNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPasswordByMatric(matricNo)
      setDone(true)
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link')
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
          {done ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
              <p className="mt-2 text-sm text-gray-500">
                If an account exists for matric number{' '}
                <span className="font-medium text-gray-900">{matricNo.toUpperCase()}</span>, a password
                reset link has been sent to the associated email.
              </p>
              <Link
                to="/signin"
                className="mt-6 inline-block text-sm text-gray-900 font-medium hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Enter your matric number and we will send a reset link to your registered email.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="form-label" htmlFor="matricNo">Matric number</label>
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
                  className="btn-primary mt-2"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-5 text-center">
                <Link to="/signin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Back to sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
