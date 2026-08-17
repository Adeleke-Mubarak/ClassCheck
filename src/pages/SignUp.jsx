import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signUpStudent } from '../lib/auth'
import Typewriter from '../components/Typewriter'

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const DEPARTMENTS = [
  'Mathematics',
]

const LEVELS = ['100', '200', '300', '400', '500']

/* ------------------------------------------------------------------ */
/* Inline styles                                                        */
/* ------------------------------------------------------------------ */

const font = "'Plus Jakarta Sans', 'Inter', ui-sans-serif, sans-serif"

const styles = {
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
    position: 'relative',
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
  inputPlaceholder: {
    color: 'rgba(255,255,255,0.22)',
  },

  /* ---- Dropdown ---- */
  dropdownTrigger: {
    width: '100%',
    padding: '13px 16px',
    background: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontFamily: font,
    fontWeight: 500,
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: '#1A1A1A',
    border: '1px solid #2A2A2A',
    borderRadius: '6px',
    maxHeight: '220px',
    overflowY: 'auto',
    zIndex: 100,
  },
  dropdownOption: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s',
    fontFamily: font,
  },
  dropdownOptionHover: {
    background: 'rgba(37,99,235,0.12)',
    color: '#FFFFFF',
  },
  dropdownChevron: {
    width: '16px',
    height: '16px',
    color: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  },

  /* ---- Level pills ---- */
  levelRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  levelPill: (selected) => ({
    padding: '10px 22px',
    borderRadius: '6px',
    border: selected ? '1px solid #2563EB' : '1px solid #2A2A2A',
    background: selected ? '#2563EB' : '#1A1A1A',
    color: selected ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: font,
    cursor: 'pointer',
    transition: 'all 0.18s',
    outline: 'none',
  }),

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
  terms: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    marginTop: '16px',
    lineHeight: 1.5,
  },
}

/* ------------------------------------------------------------------ */
/* Custom Dark Dropdown                                                 */
/* ------------------------------------------------------------------ */

function DarkDropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [focused, setFocused] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        style={{
          ...styles.dropdownTrigger,
          color: value ? '#FFFFFF' : 'rgba(255,255,255,0.22)',
          ...(focused || open ? { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' } : {}),
        }}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value || placeholder}</span>
        {/* Chevron */}
        <svg
          style={{
            ...styles.dropdownChevron,
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div style={styles.dropdownMenu} role="listbox">
          {options.map((opt) => (
            <div
              key={opt}
              role="option"
              aria-selected={value === opt}
              style={{
                ...styles.dropdownOption,
                ...(hovered === opt ? styles.dropdownOptionHover : {}),
                ...(value === opt ? { color: '#2563EB', fontWeight: 600 } : {}),
              }}
              onMouseEnter={() => setHovered(opt)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Dark Input with focus glow                                           */
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
        ...styles.input,
        ...(focused ? styles.inputFocus : {}),
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    matricNo: '',
    department: '',
    level: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitHover, setSubmitHover] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.level) return toast.error('Please select your level')
    if (!form.department) return toast.error('Please select your department')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await signUpStudent(form)
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="signup-left" style={styles.left}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>ClassCheck</Link>

        {/* Statement */}
        <div style={styles.leftMiddle}>
          <h1 style={styles.leftHeadline}>
            Join your<br />coursemates.<br />
            <span style={{ color: '#2563EB' }}><Typewriter /></span>
          </h1>

          {/* Trust lines */}
          <div style={styles.trustItem}>
            <p style={styles.trustText}>Updates from verified lecturers and class reps only</p>
          </div>
          <div style={styles.trustItem}>
            <p style={styles.trustText}>Personalised to your courses and level</p>
          </div>
          <div style={{ ...styles.trustItem, marginBottom: 0 }}>
            <p style={styles.trustText}>Free forever — no credit card needed</p>
          </div>
        </div>

        {/* Bottom link */}
        <p style={styles.leftBottom}>
          Already have an account?
          <Link to="/signin" style={styles.leftBottomLink}>Sign in</Link>
        </p>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────── */}
      <div className="signup-right" style={styles.right}>
        <div style={styles.formWrapper}>
          <span style={styles.sectionLabel}>Create your account</span>

          <form onSubmit={handleSubmit}>
            {/* Full name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="fullName">Full name</label>
              <DarkInput
                id="fullName"
                name="fullName"
                required
                autoComplete="name"
                placeholder="e.g. Chukwuemeka Obi"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            {/* Matric number */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="matricNo">Matric number</label>
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

            {/* Department dropdown */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Department</label>
              <DarkDropdown
                value={form.department}
                onChange={(val) => setForm((prev) => ({ ...prev, department: val }))}
                options={DEPARTMENTS}
                placeholder="Select your department"
              />
            </div>

            {/* Level pills */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Level</label>
              <div style={styles.levelRow}>
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, level: l }))}
                    style={styles.levelPill(form.level === l)}
                    onMouseEnter={(e) => {
                      if (form.level !== l) {
                        e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'
                        e.currentTarget.style.color = '#FFFFFF'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (form.level !== l) {
                        e.currentTarget.style.borderColor = '#2A2A2A'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                      }
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="password">Password</label>
              <DarkInput
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submit,
                ...(loading ? styles.submitDisabled : {}),
                ...(submitHover && !loading ? { background: '#E8E8E8', transform: 'translateY(-1px)' } : {}),
              }}
              onMouseEnter={() => setSubmitHover(true)}
              onMouseLeave={() => setSubmitHover(false)}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={styles.terms}>
            By creating an account you agree to our terms.
          </p>
        </div>
      </div>
    </div>
  )
}
