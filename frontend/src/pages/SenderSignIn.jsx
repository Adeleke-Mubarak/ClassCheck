import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const font = "'Plus Jakarta Sans', 'Inter', ui-sans-serif, sans-serif"

const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0A0A0A',
    fontFamily: font,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    color: '#FFFFFF',
  },

  /* Left panel */
  left: {
    width: '45%',
    background: '#0A0A0A',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '40px 48px',
  },
  logo: {
    fontWeight: 800,
    fontSize: '17px',
    letterSpacing: '-0.04em',
    color: '#FFFFFF',
    textDecoration: 'none',
  },
  leftMiddle: {
    maxWidth: '400px',
  },
  leftHeadline: {
    fontSize: '40px',
    fontWeight: 800,
    lineHeight: 1.12,
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
    margin: '0 0 40px',
  },
  trustItem: {
    borderLeft: '2px solid #2563EB',
    paddingLeft: '16px',
    marginBottom: '20px',
  },
  trustText: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.55,
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  leftBottom: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.35)',
  },
  leftBottomLink: {
    color: '#FFFFFF',
    fontWeight: 600,
    textDecoration: 'none',
    marginLeft: '4px',
  },

  /* Right panel */
  right: {
    width: '55%',
    background: '#111111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 48px',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
    overflowY: 'auto',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '420px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#2563EB',
    marginBottom: '32px',
    display: 'block',
  },

  /* Fields */
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#888888',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    background: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontFamily: font,
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputFocus: {
    borderColor: '#2563EB',
    boxShadow: '0 0 0 3px rgba(37,99,235,0.15)',
  },

  /* Submit */
  submit: {
    width: '100%',
    padding: '14px 24px',
    background: '#FFFFFF',
    color: '#0A0A0A',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: font,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '-0.01em',
    marginTop: '28px',
    transition: 'background 0.2s, transform 0.12s',
  },
  submitDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  noticeBox: {
    marginTop: '24px',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  noticeText: {
    fontSize: '13px',
    lineHeight: 1.5,
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  bottomText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    marginTop: '24px',
  },
  bottomLink: {
    color: '#FFFFFF',
    fontWeight: 600,
    textDecoration: 'none',
    marginLeft: '4px',
  },
}

function DarkInput({ id, name, type = 'text', required, autoComplete, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...S.input,
        ...(focused ? S.inputFocus : {}),
      }}
    />
  )
}

export default function SenderSignIn() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [submitHover, setSubmitHover] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await api.signInSender(form)
      await refreshProfile()
      const role = user?.role
      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'lecturer' || role === 'class_rep') {
        navigate('/sender/portal')
      } else {
        await api.signOut()
        await refreshProfile()
        toast.error('Your account is not authorised. Contact your department admin.')
      }
    } catch (err) {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="signup-left" style={S.left}>
        <Link to="/" style={S.logo}>ClassCheck</Link>

        <div style={S.leftMiddle}>
          <h1 style={S.leftHeadline}>
            Broadcast authority.<br />
            <span style={{ color: '#2563EB' }}>Zero noise.</span>
          </h1>

          <div style={S.trustItem}>
            <p style={S.trustText}>Direct channel to verified enrolled students</p>
          </div>
          <div style={S.trustItem}>
            <p style={S.trustText}>Instant venue relocations and cancellation alerts</p>
          </div>
          <div style={{ ...S.trustItem, marginBottom: 0 }}>
            <p style={S.trustText}>Department authorization and audit history</p>
          </div>
        </div>

        <p style={S.leftBottom}>
          Student at your university?
          <Link to="/signin" style={S.leftBottomLink}>Sign in as student</Link>
        </p>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────── */}
      <div className="signup-right" style={S.right}>
        <div style={S.formWrapper}>
          <span style={S.sectionLabel}>Sender & Faculty Portal</span>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={S.fieldGroup}>
              <label style={S.label} htmlFor="email">Email address</label>
              <DarkInput
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="your@university.edu.ng"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div style={S.fieldGroup}>
              <label style={S.label} htmlFor="password">Password</label>
              <DarkInput
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...S.submit,
                ...(loading ? S.submitDisabled : {}),
                ...(submitHover && !loading ? { background: '#E8E8E8', transform: 'translateY(-1px)' } : {}),
              }}
              onMouseEnter={() => setSubmitHover(true)}
              onMouseLeave={() => setSubmitHover(false)}
            >
              {loading ? 'Signing in...' : 'Sign in to dispatch'}
            </button>
          </form>

          {/* Senders cannot self-register notice */}
          <div style={S.noticeBox}>
            <p style={S.noticeText}>
              <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>Access is restricted.</strong> Senders cannot self-register. Contact your department administrator to receive credentials.
            </p>
          </div>

          <p style={S.bottomText}>
            Are you a student?
            <Link to="/signin" style={S.bottomLink}>Student sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
