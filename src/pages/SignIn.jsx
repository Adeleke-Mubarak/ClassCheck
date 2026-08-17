import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signInStudent } from '../lib/auth'
import Typewriter from '../components/Typewriter'

/* ------------------------------------------------------------------ */
/* Inline styles — mirrors SignUp exactly                               */
/* ------------------------------------------------------------------ */

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

  /* ---- Left panel ---- */
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
    maxWidth: '380px',
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

  /* ---- Right panel ---- */
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

  /* ---- Fields ---- */
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
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  forgotLink: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.35)',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },

  /* ---- Submit ---- */
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
    position: 'relative',
    overflow: 'hidden',
  },
  submitDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
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

/* ------------------------------------------------------------------ */
/* Dark Input                                                           */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function SignIn() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ matricNo: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [submitHover, setSubmitHover] = useState(false)
  const [forgotHover, setForgotHover] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInStudent(form)
      navigate('/feed')
    } catch (err) {
      toast.error('Invalid matric number or password')
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
            Welcome back.<br />
            <span style={{ color: '#2563EB' }}><Typewriter /></span>
          </h1>

          <div style={S.trustItem}>
            <p style={S.trustText}>Real-time cancellations and venue changes</p>
          </div>
          <div style={S.trustItem}>
            <p style={S.trustText}>Only courses you're subscribed to</p>
          </div>
          <div style={{ ...S.trustItem, marginBottom: 0 }}>
            <p style={S.trustText}>Posted by verified lecturers and class reps</p>
          </div>
        </div>

        <p style={S.leftBottom}>
          Don't have an account?
          <Link to="/signup" style={S.leftBottomLink}>Sign up</Link>
        </p>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────── */}
      <div className="signup-right" style={S.right}>
        <div style={S.formWrapper}>
          <span style={S.sectionLabel}>Sign in to your account</span>

          <form onSubmit={handleSubmit}>
            {/* Matric number */}
            <div style={S.fieldGroup}>
              <label style={S.label} htmlFor="matricNo">Matric number</label>
              <DarkInput
                id="matricNo"
                name="matricNo"
                required
                autoComplete="username"
                placeholder="e.g. 190404001"
                value={form.matricNo}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div style={S.fieldGroup}>
              <div style={S.labelRow}>
                <label style={{ ...S.label, marginBottom: 0 }} htmlFor="password">Password</label>
                <Link
                  to="/reset"
                  style={{
                    ...S.forgotLink,
                    ...(forgotHover ? { color: '#FFFFFF' } : {}),
                  }}
                  onMouseEnter={() => setForgotHover(true)}
                  onMouseLeave={() => setForgotHover(false)}
                >
                  Forgot password?
                </Link>
              </div>
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={S.bottomText}>
            Don't have an account?
            <Link to="/signup" style={S.bottomLink}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
