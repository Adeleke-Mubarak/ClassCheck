const FILTERS = ['All', 'Cancelled', 'Venue change']

export default function FilterPills({ active, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {FILTERS.map((f) => {
        const isActive = active === f
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? '1px solid var(--cc-accent)' : '1px solid var(--cc-line)',
              background: isActive ? 'var(--cc-accent-soft)' : 'var(--cc-surface)',
              color: isActive ? 'var(--cc-accent)' : 'var(--cc-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {f}
          </button>
        )
      })}
    </div>
  )
}
