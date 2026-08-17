import { Link } from 'react-router-dom'

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

// Marquee items: alternating course codes and update types
const TICKER = [
  { text: 'CSC 301', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'MTH 201', type: 'label' },
  { text: 'Venue change → LT4', type: 'update', kind: 'venue' },
  { text: 'ENG 302', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'PHY 101', type: 'label' },
  { text: 'Venue change → Hall B', type: 'update', kind: 'venue' },
  { text: 'CHM 302', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'BIO 201', type: 'label' },
  { text: 'Venue change → Block C', type: 'update', kind: 'venue' },
  { text: 'ACC 301', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'ECO 202', type: 'label' },
  { text: 'Venue change → Room 12', type: 'update', kind: 'venue' },
  { text: 'CIV 401', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'ARC 201', type: 'label' },
  { text: 'Venue change → Annex 2', type: 'update', kind: 'venue' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create your account',
    description:
      'Sign up with your matric number, department, and level. Takes less than a minute.',
  },
  {
    step: '02',
    title: 'Subscribe to your courses',
    description:
      'Pick the exact courses you\'re enrolled in this semester. Toggle them on or off any time.',
  },
  {
    step: '03',
    title: 'Get updates instantly',
    description:
      'Cancellations and venue changes appear in your feed the moment your lecturer or class rep posts.',
  },
]

const STATS = [
  { number: '100+', label: 'students surveyed during research' },
  { number: '87%', label: 'have missed class due to poor communication' },
  { number: '₦0', label: 'cost to use — completely free' },
]

const WHY_ITEMS = [
  {
    title: 'No wasted trips',
    description:
      'Know about a cancelled class before you leave your room — not when you arrive at an empty lecture hall.',
  },
  {
    title: 'One place, not ten chats',
    description:
      'Stop digging through WhatsApp groups and broadcast messages. Every update for every course in one clean feed.',
  },
  {
    title: 'Verified sources only',
    description:
      'Only admin-approved lecturers and class representatives can post updates. No rumours. No confusion.',
  },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const S = {
  // root wrapper
  root: {
    background: '#0A0A0A',
    color: '#FFFFFF',
    fontFamily: "'Plus Jakarta Sans', 'Inter', ui-sans-serif, sans-serif",
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  // shared max-width container
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 32px',
  },
  // section label ("HOW IT WORKS")
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.28)',
    marginBottom: '64px',
    display: 'block',
  },
  // thin divider
  divider: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function Landing() {
  // Duplicate ticker items 3× so the marquee loop is seamless
  const tickerItems = [...TICKER, ...TICKER, ...TICKER]

  return (
    <div style={S.root}>

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '60px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ ...S.container, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Wordmark */}
          <Link to="/" style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.04em', color: '#FFFFFF', textDecoration: 'none' }}>
            ClassCheck
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Link to="/sender" className="land-nav-link">
              Sender login
            </Link>
            <Link to="/signup" className="land-nav-btn">
              <span>Create account</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        paddingTop: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ ...S.container, paddingTop: '80px', paddingBottom: '80px' }}>

          {/* Eyebrow */}
          <p style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#2563EB',
            marginBottom: '28px',
            marginTop: 0,
          }}>
            For Nigerian university students
          </p>

          {/* Main headline */}
          <h1 style={{
            fontSize: 'clamp(52px, 7.5vw, 96px)',
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: '-0.035em',
            color: '#FFFFFF',
            margin: '0 0 28px',
            maxWidth: '860px',
          }}>
            Never miss a<br />
            cancelled class<br />
            <span style={{ color: '#2563EB' }}>again.</span>
          </h1>

          {/* Sub-headline */}
          <p style={{
            fontSize: '17px',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.48)',
            maxWidth: '420px',
            margin: '0 0 44px',
          }}>
            All your class updates in one feed — posted by your actual lecturers and class reps.
          </p>

          {/* CTA buttons */}
          <div className="land-hero-btns" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/signup" className="land-btn-primary">
              <span>Get started — it's free</span>
            </Link>
            <Link to="/signin" className="land-btn-secondary">
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marquee ticker ────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 0',
        background: '#0A0A0A',
        overflow: 'hidden',
      }}>
        <div className="marquee-track" aria-hidden="true">
          {tickerItems.map((item, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 10px',
              }}
            >
              {item.type === 'label' ? (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  {item.text}
                </span>
              ) : (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: item.kind === 'cancel'
                    ? 'rgba(239,68,68,0.7)'
                    : 'rgba(59,130,246,0.7)',
                }}>
                  {item.text}
                </span>
              )}
              <span style={{
                display: 'inline-block',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                margin: '0 16px',
                flexShrink: 0,
              }} />
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section style={{ padding: '64px 0' }}>
        <div style={S.container}>
          <span style={S.sectionLabel}>How it works</span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '0',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} style={{
                padding: '48px 40px 48px 0',
                borderRight: i < HOW_IT_WORKS.length - 1
                  ? '1px solid rgba(255,255,255,0.07)'
                  : 'none',
                paddingRight: i < HOW_IT_WORKS.length - 1 ? '48px' : '0',
                paddingLeft: i > 0 ? '48px' : '0',
              }}>
                {/* Big step number */}
                <span style={{
                  display: 'block',
                  fontSize: '80px',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: 'rgba(255,255,255,0.05)',
                  letterSpacing: '-0.05em',
                  marginBottom: '20px',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {item.step}
                </span>
                <h3 style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  color: '#FFFFFF',
                  margin: '0 0 12px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.42)',
                  fontWeight: 400,
                  margin: 0,
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────── */}
      <section style={{
        background: '#111111',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '56px 0',
      }}>
        <div style={{
          ...S.container,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '48px',
        }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              paddingLeft: i > 0 ? '48px' : '0',
            }}>
              <p style={{
                fontSize: 'clamp(48px, 5.5vw, 72px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: '#FFFFFF',
                margin: '0 0 12px',
              }}>
                {stat.number}
              </p>
              <p style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.32)',
                lineHeight: 1.5,
                margin: 0,
                maxWidth: '200px',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why ClassCheck ────────────────────────────────────────── */}
      <section style={{ padding: '64px 0' }}>
        <div style={S.container}>
          <span style={S.sectionLabel}>Why ClassCheck</span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '40px',
          }}>
            {WHY_ITEMS.map((item) => (
              <div key={item.title} style={{
                borderLeft: '2px solid #2563EB',
                paddingLeft: '24px',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  margin: '0 0 12px',
                  lineHeight: 1.2,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.42)',
                  fontWeight: 400,
                  margin: 0,
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section style={{
        ...S.divider,
        padding: '80px 32px',
        textAlign: 'center',
        background: '#0A0A0A',
      }}>
        <span style={{ ...S.sectionLabel, marginBottom: '28px' }}>Get started</span>
        <h2 style={{
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: 900,
          letterSpacing: '-0.035em',
          lineHeight: 1.05,
          color: '#FFFFFF',
          margin: '0 auto 44px',
          maxWidth: '560px',
        }}>
          Ready to stop missing classes?
        </h2>
        <Link to="/signup" className="land-btn-cta">
          <span>Create your free account</span>
        </Link>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 32px',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.5)' }}>
            ClassCheck
          </span>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/signin" className="land-link">Student sign in</Link>
            <Link to="/sender" className="land-link">Sender login</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
