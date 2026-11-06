import { formatDistanceToNow } from 'date-fns'

export default function UpdateCard({ update }) {
  const { courses, senders, type, new_venue, note, created_at } = update

  const isCancelled = type === 'cancelled'
  const isVenueChange = type === 'venue_change'
  const isLecturer = senders?.role === 'lecturer'

  return (
    <article className={`update-card ${isCancelled ? 'cancelled' : 'venue-change'}`}>
      <div className="update-card-main">
        <div className="update-card-heading">
          <div className="update-card-course">
            <strong>{courses?.course_code || 'Course update'}</strong>
            <span>{courses?.course_name}</span>
          </div>
          <span className={`update-kind ${isCancelled ? 'cancelled' : 'venue-change'}`}>
            {isCancelled ? 'Class cancelled' : 'Venue changed'}
          </span>
        </div>

        {isVenueChange && new_venue && (
          <p className="update-card-venue">New venue <strong>{new_venue}</strong></p>
        )}
        {note && <p className="update-card-note">{note}</p>}
      </div>

      <footer className="update-card-footer">
        <span className={`update-source ${isLecturer ? 'lecturer' : 'rep'}`}>
          <i /> {senders?.full_name || (isLecturer ? 'Lecturer' : 'Class representative')}
          <span>{isLecturer ? 'Lecturer' : 'Class rep'}</span>
        </span>
        <time dateTime={created_at}>
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </time>
      </footer>
    </article>
  )
}
