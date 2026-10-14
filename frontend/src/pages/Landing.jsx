import { Link } from 'react-router-dom'

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

// Mathematics Pilot Courses Marquee Ticker
const TICKER = [
  { text: 'MAT 401 (Real Analysis III)', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'MAT 403 (Complex Analysis II)', type: 'label' },
  { text: 'Venue change → LT2', type: 'update', kind: 'venue' },
  { text: 'MAT 405 (Abstract Algebra II)', type: 'label' },
  { text: 'Venue change → NLH 3', type: 'update', kind: 'venue' },
  { text: 'MAT 407 (Differential Equations III)', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'MAT 409 (Topology)', type: 'label' },
  { text: 'Venue change → Math Lab 1', type: 'update', kind: 'venue' },
  { text: 'MAT 411 (Functional Analysis)', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'MAT 413 (Numerical Analysis II)', type: 'label' },
  { text: 'Venue change → Math Lab 2', type: 'update', kind: 'venue' },
  { text: 'MAT 415 (Operations Research)', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
  { text: 'MAT 417 (Mathematical Methods)', type: 'label' },
  { text: 'Venue change → Science LT', type: 'update', kind: 'venue' },
  { text: 'MAT 419 (Fluid Dynamics)', type: 'label' },
  { text: 'Cancelled', type: 'update', kind: 'cancel' },
]

const CORE_FEATURES = [
  {
    tag: 'REAL-TIME BROADCASTS',
    tagColor: '#EF4444',
    title: 'Verified Class Updates',
    description:
      'Never walk across campus to an empty hall again. Receive instant, official announcements for class cancellations and venue relocations the second your lecturer or class rep posts them.',
    badge: 'Official lecturer & rep badges',
    icon: (
      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    tag: 'DYNAMIC TIMETABLE',
    tagColor: '#2563EB',
    title: 'Smart Lecture Schedule',
    description:
      'Your weekly academic calendar at a glance. Timetable entries integrate with real-time updates: if a lecture is cancelled or moved today, your schedule card automatically flags it so your day is never thrown off.',
    badge: 'Integrated real-time alerts',
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    tag: 'CAMPUS DIRECTORY',
    tagColor: '#10B981',
    title: 'Faculty & Rep Directory',
    description:
      'No more asking coursemates where a lecturer’s office is. Access office numbers, consultation hours, official emails, and assigned courses for lecturers, HODs, and student reps in one tap.',
    badge: 'Office hours & locations',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
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
      'Select your exact registered mathematics courses this semester. Toggle them on or off anytime.',
  },
  {
    step: '03',
    title: 'Stay synchronized',
    description:
      'Get verified class updates, your daily timetable, and faculty contact info in one organized dashboard.',
  },
]

const STATS = [
  { number: '100+', label: 'students surveyed during research' },
  { number: '87%', label: 'have trekked to an empty hall due to missed notifications' },
  { number: '3 in 1', label: 'live updates, lecture timetable & faculty directory' },
]

const WHY_ITEMS = [
  {
    title: 'No wasted campus treks',
    description:
      'Know about a cancelled class or relocated lecture before you leave your room — not when you arrive exhausted at an empty lecture hall.',
  },
  {
    title: 'One platform, zero group chat clutter',
    description:
      'Stop digging through hundreds of unread WhatsApp messages and memes. Every update for every course in one clean, dedicated feed.',
  },
  {
    title: 'Verified academic authority',
    description:
      'Only admin-approved lecturers and course representatives have broadcast authority. Pure verified signal. Zero rumors.',
  },
]

/* ------------------------------------------------------------------ */
/* Styles                                                               */
/* ------------------------------------------------------------------ */

const S = {
  root: {
    background: '#0A0A0A',
    color: '#FFFFFF',
    fontFamily: "'Plus Jakarta Sans', 'Inter', ui-sans-serif, sans-serif",
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: '20px',
    display: 'block',
  },
  divider: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function Landing() {
  const tickerItems = [...TICKER, ...TICKER, ...TICKER]

  return (
    <div style={S.root}>

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0A0A0A]/90 backdrop-blur-md flex items-center"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="land-container flex items-center justify-between">
          {/* Wordmark */}
          <Link to="/" className="font-extrabold text-base sm:text-[17px] tracking-tight text-white hover:opacity-90 transition-opacity">
            ClassCheck
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/sender" className="land-nav-link hidden sm:inline-flex text-xs sm:text-sm">
              Sender login
            </Link>
            <Link to="/signin" className="land-nav-link text-xs sm:text-sm px-2.5 py-1.5">
              Sign in
            </Link>
            <Link to="/signup" className="land-nav-btn text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              <span>Create account</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '90vh',
        paddingTop: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ ...S.container, paddingTop: '40px', paddingBottom: '60px' }}>

          {/* Eyebrow badge + Waitlist link */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '28px',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '100px',
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB' }} />
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#3B82F6',
              }}>
                Department of Mathematics Pilot · 400 Level
              </span>
            </div>

            <Link
              to="/waitlist"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#3B82F6' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >
              <span>Not in 400L Maths? Request your department</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: 'clamp(32px, 7.5vw, 84px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: '#FFFFFF',
            margin: '0 0 24px',
            maxWidth: '900px',
          }}>
            Your entire lecture day,<br />
            synchronized in<br />
            <span style={{ color: '#2563EB' }}>real time.</span>
          </h1>

          {/* Sub-headline */}
          <p style={{
            fontSize: 'clamp(15px, 3.5vw, 18px)',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '540px',
            margin: '0 0 36px',
          }}>
            Real-time class cancellations, interactive lecture timetable, and faculty contact directory — delivered instantly from verified lecturers and course reps.
          </p>

          {/* CTA buttons */}
          <div className="land-hero-btns" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/signup" className="land-btn-primary">
              <span>Get started — it's free</span>
            </Link>
            <Link to="/signin" className="land-btn-secondary">
              <span>Student sign in</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marquee ticker (Maths Only) ───────────────────────────── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 0',
        background: '#0D0D0D',
        overflow: 'hidden',
      }}>
        <div className="marquee-track" aria-hidden="true">
          {tickerItems.map((item, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 12px',
              }}
            >
              {item.type === 'label' ? (
                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  {item.text}
                </span>
              ) : (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: item.kind === 'cancel' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                  color: item.kind === 'cancel' ? '#EF4444' : '#F59E0B',
                  border: item.kind === 'cancel' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)',
                }}>
                  {item.text}
                </span>
              )}
              <span style={{
                display: 'inline-block',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                margin: '0 16px',
                flexShrink: 0,
              }} />
            </span>
          ))}
        </div>
      </div>

      {/* ── 3 Core Pillars (Schedule + Directory + Updates) ───────── */}
      <section style={{ padding: '96px 0', background: '#0A0A0A' }}>
        <div style={S.container}>
          <div style={{ maxWidth: '640px', marginBottom: '64px' }}>
            <span style={S.sectionLabel}>The Complete Platform</span>
            <h2 style={{
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#FFFFFF',
              margin: '0 0 16px',
            }}>
              Built for campus realities. Not ideal assumptions.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
              ClassCheck replaces fragmented WhatsApp broadcasts with an integrated suite that keeps you on time, in the right hall, and in touch with your department.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {CORE_FEATURES.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '36px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s',
                }}
              >
                <div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                  }}>
                    {feature.icon}
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: feature.tagColor,
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    {feature.tag}
                  </span>

                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    margin: '0 0 14px',
                    lineHeight: 1.25,
                  }}>
                    {feature.title}
                  </h3>

                  <p style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.48)',
                    margin: '0 0 24px',
                  }}>
                    {feature.description}
                  </p>
                </div>

                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: feature.tagColor }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                    {feature.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
                <span style={{
                  display: 'block',
                  fontSize: '80px',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: 'rgba(255,255,255,0.06)',
                  letterSpacing: '-0.05em',
                  marginBottom: '20px',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {item.step}
                </span>
                <h3 style={{
                  fontSize: '20px',
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
                  color: 'rgba(255,255,255,0.44)',
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
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
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
                fontSize: 'clamp(44px, 5vw, 68px)',
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
                color: 'rgba(255,255,255,0.36)',
                lineHeight: 1.5,
                margin: 0,
                maxWidth: '220px',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why ClassCheck ────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
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
                  fontSize: '19px',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  margin: '0 0 12px',
                  lineHeight: 1.25,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.44)',
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
        padding: '96px 32px',
        textAlign: 'center',
        background: '#0A0A0A',
      }}>
        <span style={{ ...S.sectionLabel, marginBottom: '24px' }}>Get Started</span>
        <h2 style={{
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontWeight: 900,
          letterSpacing: '-0.035em',
          lineHeight: 1.08,
          color: '#FFFFFF',
          margin: '0 auto 20px',
          maxWidth: '680px',
        }}>
          Ready to take control of your lecture schedule?
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.45)',
          maxWidth: '460px',
          margin: '0 auto 40px',
          lineHeight: 1.6,
        }}>
          Join your coursemates on ClassCheck today. Free forever for university students.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" className="land-btn-cta">
            <span>Create your free account</span>
          </Link>
          <Link to="/signin" className="land-btn-secondary" style={{ padding: '16px 32px' }}>
            <span>Sign in as student</span>
          </Link>
        </div>

        <p style={{ marginTop: '28px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          Studying in another department or university?{' '}
          <Link to="/waitlist" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>
            Vote to bring ClassCheck to your campus →
          </Link>
        </p>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 32px',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.04em', color: '#FFFFFF' }}>
              ClassCheck
            </span>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
              Department of Mathematics Pilot · All rights reserved.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/waitlist" className="land-link">Request department</Link>
            <Link to="/signin" className="land-link">Student sign in</Link>
            <Link to="/sender" className="land-link">Sender portal</Link>
            <Link to="/signup" className="land-link">Create account</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
