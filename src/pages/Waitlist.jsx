import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import Typewriter from '../components/Typewriter'

export default function Waitlist() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      department: formData.get('department'),
      university: formData.get('university'),
    }

    const { error } = await supabase
      .from('waitlist')
      .insert([data])

    if (error) {
      if (error.code === '23505') {
        toast.error('This email is already on the waitlist!')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } else {
      setSuccess(true)
      toast.success('You are on the list!')
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-container">
      {/* Left Panel: Graphic / Brand */}
      <div className="auth-left">
        <div className="auth-brand">
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            ClassCheck
          </Link>
        </div>
        <div className="auth-message-wrapper">
          <div className="auth-message-box">
            <Typewriter />
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1 className="auth-title">Join the waitlist</h1>
            <p className="auth-subtitle">
              We are currently in a closed pilot. Join the waitlist to be notified when we launch in your department.
            </p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'rgba(37, 99, 235, 0.1)', color: '#3B82F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: '32px'
              }}>✓</div>
              <h2 style={{ fontSize: '24px', margin: '0 0 12px', color: '#fff' }}>You're on the list!</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 32px' }}>
                We'll email you as soon as ClassCheck is available for your department.
              </p>
              <Link to="/" className="btn-primary" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  className="form-input"
                  style={{ background: '#111', color: '#fff', border: '1px solid #333' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="form-input"
                  style={{ background: '#111', color: '#fff', border: '1px solid #333' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">University</label>
                <input
                  type="text"
                  name="university"
                  required
                  placeholder="e.g. University of Lagos"
                  className="form-input"
                  style={{ background: '#111', color: '#fff', border: '1px solid #333' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  required
                  placeholder="e.g. Computer Science"
                  className="form-input"
                  style={{ background: '#111', color: '#fff', border: '1px solid #333' }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '12px' }}>
                {loading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          )}
          
          <div className="auth-footer" style={{ marginTop: '32px' }}>
            <p>
              Already in the pilot?{' '}
              <Link to="/signin" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
