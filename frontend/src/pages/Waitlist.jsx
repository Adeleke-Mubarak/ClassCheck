import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../lib/api'

/* ------------------------------------------------------------------ */
/* Inline styles — mirrors SignUp and SignIn                            */
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
    maxWidth: '420px',
  },
  leftHeadline: {
    fontSize: '40px',
    fontWeight: 800,
    lineHeight: 1.12,
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
    margin: '0 0 32px',
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
    marginBottom: '28px',
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
    marginTop: '24px',
    transition: 'background 0.2s, transform 0.12s',
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

function DarkInput({ id, name, type = 'text', required, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
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

export default function Waitlist() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    university: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitHover, setSubmitHover] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.department.trim() || !form.university.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await api.joinWaitlist({
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        university: form.university.trim(),
      })
      setSuccess(true)
      toast.success('You have been added to the priority list!')
    } catch (error) {
      if (error?.code === '23505' || error?.message?.includes('already')) {
        toast.error('This email is already registered on the waitlist!')
      } else {
        toast.error(error?.message || 'Something went wrong. Please try again.')
      }
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
            Vote for your<br />department.<br />
            <span style={{ color: '#2563EB' }}>Bring ClassCheck to campus.</span>
          </h1>

          <div style={S.trustItem}>
            <p style={S.trustText}>Currently in closed pilot for 400L Mathematics</p>
          </div>
          <div style={S.trustItem}>
            <p style={S.trustText}>We expand to new departments based on student demand votes</p>
          </div>
          <div style={{ ...S.trustItem, marginBottom: 0 }}>
            <p style={S.trustText}>Be first to receive real-time cancellations, timetables & directories</p>
          </div>
        </div>

        <p style={S.leftBottom}>
          In the 400L Mathematics pilot?
          <Link to="/signin" style={S.leftBottomLink}>Sign in here</Link>
        </p>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────── */}
      <div className="signup-right" style={S.right}>
        <div style={S.formWrapper}>
          <span style={S.sectionLabel}>Department expansion waitlist</span>

          {success ? (
            <div style={{
              background: '#161616',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '40px 24px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(37,99,235,0.12)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px',
                fontWeight: 800,
              }}>
                ✓
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                You're on the priority list!
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 28px' }}>
                We prioritize department rollouts by request volume. We'll email you the moment ClassCheck launches for <strong style={{ color: '#FFFFFF' }}>{form.department}</strong> at <strong style={{ color: '#FFFFFF' }}>{form.university}</strong>.
              </p>
              <Link
                to="/"
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  background: '#FFFFFF',
                  color: '#0A0A0A',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Back to home
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                Request your department
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: '0 0 28px' }}>
                Tell us where you study. The departments with the most votes get onboarded next.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Full name */}
                <div style={S.fieldGroup}>
                  <label style={S.label} htmlFor="name">Full name</label>
                  <DarkInput
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Chukwuemeka Obi"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Email address */}
                <div style={S.fieldGroup}>
                  <label style={S.label} htmlFor="email">Email address</label>
                  <DarkInput
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. student@university.edu.ng"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                {/* University */}
                <div style={S.fieldGroup}>
                  <label style={S.label} htmlFor="university">University / Institution</label>
                  <DarkInput
                    id="university"
                    name="university"
                    required
                    placeholder="e.g. University of Lagos (UNILAG)"
                    value={form.university}
                    onChange={handleChange}
                  />
                </div>

                {/* Department */}
                <div style={S.fieldGroup}>
                  <label style={S.label} htmlFor="department">Department</label>
                  <DarkInput
                    id="department"
                    name="department"
                    required
                    placeholder="e.g. Computer Science"
                    value={form.department}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit button */}
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
                  {loading ? 'Submitting request...' : 'Join priority waitlist'}
                </button>
              </form>

              <p style={S.bottomText}>
                Are you in the 400L Mathematics pilot?
                <Link to="/signup" style={S.bottomLink}>Create your account</Link>
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
