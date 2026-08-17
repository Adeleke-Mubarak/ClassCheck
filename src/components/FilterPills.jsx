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
              border: isActive ? '1px solid #2563EB' : '1px solid rgba(255,255,255,0.1)',
              background: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
              color: isActive ? '#2563EB' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            }}
          >
            {f}
          </button>
        )
      })}
    </div>
  )
}
