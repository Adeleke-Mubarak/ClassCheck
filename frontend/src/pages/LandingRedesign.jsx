import { Link } from 'react-router-dom'

const previewItems = [
  { code: 'MAT 401', title: 'Real Analysis III', time: '08:00', venue: 'LT 2', state: 'On schedule', tone: 'green' },
  { code: 'MAT 403', title: 'Complex Analysis II', time: '12:00', venue: 'Math Lab 1', state: 'Venue changed', tone: 'amber' },
]

const features = [
  {
    number: '01',
    title: 'Know before you leave',
    body: 'Verified cancellation and venue-change notices reach the students who actually take that course.',
    tone: 'coral',
  },
  {
    number: '02',
    title: 'One timetable that stays current',
    body: 'Your weekly schedule sits beside live updates, so changes are hard to miss and easy to act on.',
    tone: 'green',
  },
  {
    number: '03',
    title: 'A quick read from the hall',
    body: 'Students at the venue can share what they see. Reports are shown with their recency and consensus.',
    tone: 'blue',
  },
]

export default function LandingRedesign() {
  return (
    <main className="landing-shell">
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="ClassCheck home">
          <span className="landing-mark">C</span>
          <span>ClassCheck</span>
        </Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <Link to="/sender">Staff access</Link>
          <Link to="/signin" className="landing-signin">Sign in</Link>
          <Link to="/signup" className="landing-join">Create account <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span /> A clearer signal for campus</p>
          <h1>Know before you cross campus.</h1>
          <p className="landing-lede">
            Class changes happen. Getting the right update shouldn’t depend on scrolling through a noisy group chat.
          </p>
          <div className="landing-actions">
            <Link to="/signup" className="landing-primary">Get started <span aria-hidden="true">↗</span></Link>
            <Link to="/waitlist" className="landing-secondary">Bring ClassCheck to your department</Link>
          </div>
          <p className="landing-proof"><span aria-hidden="true">✓</span> Updates from verified lecturers and class reps</p>
        </div>

        <div className="landing-preview-wrap" aria-label="ClassCheck student timetable preview">
          <div className="landing-preview-topline">
            <span>STUDENT VIEW</span>
            <span className="landing-live"><i /> LIVE STATUS</span>
          </div>
          <div className="landing-preview-heading">
            <div>
              <p>MONDAY, 12 MAY</p>
              <h2>Your lecture day</h2>
            </div>
            <span className="landing-weather">400L · MATHS</span>
          </div>
          <div className="landing-next">
            <div className="landing-next-rail"><span /></div>
            <div className="landing-next-content">
              <span className="landing-next-label">UP NEXT · 08:00</span>
              <strong>MAT 401</strong>
              <span>Real Analysis III · LT 2</span>
            </div>
            <span className="landing-status">On schedule</span>
          </div>
          <div className="landing-preview-divider"><span>ON YOUR TIMETABLE</span><span>2 CLASSES</span></div>
          <div className="landing-course-list">
            {previewItems.map((item) => (
              <div className="landing-course-row" key={item.code}>
                <time>{item.time}</time>
                <div className="landing-course-copy">
                  <strong>{item.code}<span>{item.title}</span></strong>
                  <small>{item.venue}</small>
                </div>
                <span className={`landing-course-state ${item.tone}`}>{item.state}</span>
              </div>
            ))}
          </div>
          <div className="landing-preview-foot">
            <span className="landing-pulse-dot" /> Hall Pulse <b>3 students reporting</b>
            <span className="landing-recent">2 min ago</span>
          </div>
        </div>
      </section>

      <div className="landing-strip" aria-label="ClassCheck capabilities">
        <span>VERIFIED CLASS UPDATES</span><i />
        <span>LIVE TIMETABLE</span><i />
        <span>HALL PULSE</span><i />
        <span>OFFLINE READY</span>
      </div>

      <section className="landing-features">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">A better campus routine</p>
          <h2>Less guessing.<br /><em>More knowing.</em></h2>
        </div>
        <div className="landing-feature-list">
          {features.map((feature) => (
            <article className={`landing-feature ${feature.tone}`} key={feature.number}>
              <span className="landing-feature-number">{feature.number}</span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
              <span className="landing-feature-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-steps">
        <div>
          <p className="landing-eyebrow">Simple by design</p>
          <h2>Your courses.<br />Your signal.</h2>
        </div>
        <ol>
          <li><span>01</span><div><strong>Choose your courses</strong><p>Build a feed around the classes you take.</p></div></li>
          <li><span>02</span><div><strong>Get verified changes</strong><p>See important updates from approved senders.</p></div></li>
          <li><span>03</span><div><strong>Check the hall</strong><p>Use recent student reports to understand what’s happening.</p></div></li>
        </ol>
      </section>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand"><span className="landing-mark">C</span><span>ClassCheck</span></Link>
        <span>Built for the real rhythm of campus.</span>
        <Link to="/signup">Join the pilot <span aria-hidden="true">↗</span></Link>
      </footer>
    </main>
  )
}